import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const jsonHeaders = {
  "Content-Type": "application/json",
};

const SYSTEM_PROMPT = `Você é Cleitin, um pet virtual cobrador de produtividade.
Responda sempre em JSON válido, sem markdown.
Formato:
{
  "reply": "mensagem do Cleitin",
  "intent": "chat",
  "mood": "neutral"
}`;

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { message, userProfile, memory, tasks, petMood, mood, petType } = JSON.parse(event.body || "{}");

    if (!process.env.GROQ_API_KEY) {
      return {
        statusCode: 500,
        headers: jsonHeaders,
        body: JSON.stringify({
          reply: "A chave da Groq não está configurada no Netlify.",
          intent: "chat",
          mood: "sad",
        }),
      };
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 500,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            message,
            userProfile,
            memory,
            tasks,
            petMood: petMood || mood,
            petType,
          }),
        },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        reply: raw || "Meu cérebro respondeu estranho, mas ainda tô online.",
        intent: "chat",
        mood: "neutral",
      };
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      parsed = {
        reply: String(raw || "Meu cérebro respondeu estranho, mas ainda tô online."),
        intent: "chat",
        mood: "neutral",
      };
    }

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify(parsed),
    };
  } catch (error) {
    console.error("Erro Groq:", error);

    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({
        reply: "Deu ruim no meu cérebro agora. Confere a função da Groq no Netlify.",
        intent: "chat",
        mood: "sad",
        error: error.message,
      }),
    };
  }
}
