import Groq from "groq-sdk";
import { systemPrompt } from "../prompts/systemPrompt.js";

const MODEL = "llama-3.3-70b-versatile";

function getClient() {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "SUA_API_KEY") {
    const error = new Error("GROQ_API_KEY ausente. Configure server/.env com sua chave da Groq.");
    error.statusCode = 503;
    throw error;
  }

  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

function extractJson(content) {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Resposta da Groq nao trouxe JSON valido.");
    return JSON.parse(match[0]);
  }
}

function normalizeTask(task) {
  return {
    title: String(task?.title || "").trim(),
    time: typeof task?.time === "string" ? task.time : "",
    priority: ["alta", "media", "baixa"].includes(task?.priority) ? task.priority : "media",
    category: task?.category || "rotina",
    status: "pendente",
  };
}

function hasTaskIntent(message = "") {
  const text = message.toLowerCase();
  const taskWords = [
    "preciso", "tenho que", "tenho de", "vou fazer", "me lembra", "lembrar", "agendar",
    "planejar", "criar tarefa", "adiciona", "adicionar", "coloca", "colocar", "postar",
    "estudar", "ligar", "responder", "pagar", "comprar", "treinar", "reuniao", "reunião",
    "cliente", "simulacao", "simulação", "cobrar", "follow", "entregar", "fazer",
  ];
  const hasTime = /\b([01]?\d|2[0-3])(?:[:h](\d{2}))?\b/.test(text);
  return hasTime || taskWords.some((word) => text.includes(word));
}

export async function generatePetReply({
  message,
  userProfile = {},
  memory = {},
  tasks = [],
  mood = "neutro",
  petType = "cleitin",
}) {
  const groq = getClient();
  const taskIntent = hasTaskIntent(message);

  const context = {
    userMessage: message,
    conversationMode: taskIntent ? "produtividade" : "conversa_casual",
    taskIntent,
    userProfile,
    memory,
    todayTasks: tasks,
    currentMood: mood,
    petType,
    currentDate: new Date().toISOString(),
  };

  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.75,
    max_tokens: 900,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Contexto do usuario e pedido atual em JSON:\n${JSON.stringify(context, null, 2)}\n\nInstrucao importante: se conversationMode for "conversa_casual", converse normalmente, nao cobre tarefas, nao fale de pendencias e retorne suggestedTasks como lista vazia.`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  const parsed = extractJson(raw);
  const suggestedTasks = taskIntent && Array.isArray(parsed.suggestedTasks)
    ? parsed.suggestedTasks.map(normalizeTask).filter((task) => task.title)
    : [];

  return {
    reply: parsed.reply || "Beleza. O Cleitin anotou, agora falta voce fazer.",
    suggestedTasks,
    productivityAnalysis: parsed.productivityAnalysis || {
      summary: "",
      risks: [],
      nextBestAction: "",
    },
    mood: parsed.mood || mood,
  };
}
