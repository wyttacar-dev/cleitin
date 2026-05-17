const HOUR = 60 * 60 * 1000;

const hotWords = ["fechar", "fechado", "quero", "vamos fazer", "pode mandar", "contratar", "aprovar", "aceito"];
const warmWords = ["interesse", "gostei", "legal", "quanto fica", "valor", "parcela", "entrada", "condicao", "condição"];
const coldWords = ["caro", "vou pensar", "sem interesse", "depois eu vejo", "agora nao", "agora não", "nao quero", "não quero"];
const simulationWords = ["simulacao", "simulação", "simular", "proposta", "orcamento", "orçamento", "parcela", "entrada", "financiamento"];
const returnWords = ["me chama", "retorno", "volta", "amanha", "amanhã", "mais tarde", "depois", "posso ver"];

export function analyzeConversations(conversations = [], options = {}) {
  const now = Date.now();
  return conversations
    .map((conversation) => analyzeConversation(conversation, { ...options, now }))
    .filter(Boolean)
    .sort((a, b) => b.priority - a.priority);
}

export function analyzeConversation(conversation, options = {}) {
  const messages = (conversation.messages || []).filter((message) => message.text);
  if (!messages.length) return null;

  const now = options.now || Date.now();
  const lastMessage = messages[messages.length - 1];
  const lastCustomerMessage = [...messages].reverse().find((message) => !message.fromMe);
  const textWindow = messages.slice(-8).map((message) => message.text).join(" ").toLowerCase();
  const lastCustomerText = (lastCustomerMessage?.text || "").toLowerCase();
  const lastFromMe = Boolean(lastMessage.fromMe);
  const age = now - Number(lastMessage.timestamp || now);
  const customerAge = now - Number(lastCustomerMessage?.timestamp || lastMessage.timestamp || now);

  const tags = new Set();
  if (containsAny(textWindow, simulationWords)) tags.add("pediu simulacao");
  if (lastFromMe && age >= 4 * HOUR) tags.add("sem resposta");
  if (containsAny(lastCustomerText, returnWords) || (!lastFromMe && customerAge >= 2 * HOUR)) tags.add("precisa de retorno");

  let leadStatus = "morno";
  if (containsAny(textWindow, warmWords)) leadStatus = "morno";
  if (containsAny(textWindow, hotWords)) leadStatus = "quente";
  if (containsAny(textWindow, coldWords)) leadStatus = "frio";
  if (!lastCustomerMessage && lastFromMe) leadStatus = "sem resposta";
  if (tags.has("sem resposta")) leadStatus = "sem resposta";
  if (tags.has("pediu simulacao") && leadStatus !== "frio") leadStatus = "quente";

  const needsFollowUp = tags.has("sem resposta") || tags.has("precisa de retorno") || tags.has("pediu simulacao") || leadStatus === "quente";
  if (!needsFollowUp && leadStatus === "frio") return null;

  const nextAction = getNextAction({ leadStatus, tags, lastFromMe });
  const priority = scorePriority({ leadStatus, tags: Array.from(tags) });

  return {
    id: conversation.id,
    jid: conversation.jid,
    name: conversation.name || conversation.jid,
    phone: conversation.phone || jidToPhone(conversation.jid),
    leadStatus,
    tags: Array.from(tags),
    lastMessage: {
      text: lastMessage.text,
      fromMe: lastMessage.fromMe,
      timestamp: lastMessage.timestamp,
    },
    lastCustomerMessage: lastCustomerMessage
      ? {
          text: lastCustomerMessage.text,
          timestamp: lastCustomerMessage.timestamp,
        }
      : null,
    nextAction,
    suggestedMessage: buildSuggestedMessage({
      name: conversation.name,
      leadStatus,
      tags,
      sellerStyle: options.sellerStyle,
    }),
    dueToday: needsFollowUp,
    priority,
  };
}

function containsAny(text, words) {
  return words.some((word) => text.includes(word));
}

function getNextAction({ leadStatus, tags, lastFromMe }) {
  if (tags.has("pediu simulacao") && tags.has("sem resposta")) return "Cobrar retorno da simulacao enviada.";
  if (tags.has("pediu simulacao")) return "Ajudar a ajustar entrada, parcela ou prazo.";
  if (leadStatus === "quente") return "Responder rapido e conduzir para fechamento.";
  if (tags.has("sem resposta") || lastFromMe) return "Fazer follow-up leve sem pressionar.";
  if (leadStatus === "frio") return "Reativar com uma pergunta curta e sem insistencia.";
  return "Dar retorno e manter a conversa aquecida.";
}

function buildSuggestedMessage({ name, leadStatus, tags, sellerStyle }) {
  const firstName = cleanFirstName(name);
  const greeting = firstName ? `Boa tarde, ${firstName}. Tudo bem?` : "Boa tarde, tudo bem?";
  const suffix = sellerStyle === "acido" || sellerStyle === "ignorante"
    ? "Me chama que eu ajusto isso sem enrolacao."
    : "Posso te ajudar a ajustar para ficar melhor para voce.";

  if (tags.has("pediu simulacao")) {
    return `${greeting} Conseguiu analisar a simulacao que te enviei? Posso te ajudar a ajustar entrada ou parcela para ficar melhor para voce.`;
  }

  if (leadStatus === "quente") {
    return `${greeting} Vi que voce demonstrou interesse. Quer que eu te ajude a avancar com a melhor condicao hoje?`;
  }

  if (leadStatus === "frio") {
    return `${greeting} Passando rapidinho para saber se ainda faz sentido eu te ajudar com isso ou se prefere que eu retome em outro momento.`;
  }

  if (tags.has("sem resposta")) {
    return `${greeting} Passando para saber se conseguiu ver minha ultima mensagem. ${suffix}`;
  }

  return `${greeting} Fiquei de te dar retorno e estou passando para continuar de onde paramos.`;
}

function cleanFirstName(name = "") {
  const first = name.split(" ")[0]?.replace(/[^\p{L}\p{N}]/gu, "");
  if (!first || first.length > 24 || first.includes("@")) return "";
  return first;
}

function jidToPhone(jid = "") {
  return jid.replace("@s.whatsapp.net", "").replace("@c.us", "");
}

function scorePriority(item) {
  const tags = new Set(item.tags || []);
  let score = 0;
  if (item.leadStatus === "quente") score += 40;
  if (item.leadStatus === "morno") score += 20;
  if (item.leadStatus === "sem resposta") score += 30;
  if (tags.has("pediu simulacao")) score += 35;
  if (tags.has("precisa de retorno")) score += 25;
  if (tags.has("sem resposta")) score += 15;
  return score;
}
