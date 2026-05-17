const reminderWords = [
  "me lembra",
  "criar lembrete",
  "cria um lembrete",
  "me cobra",
  "cobrar",
  "lembrar",
  "tarefa",
  "compromisso",
  "ate eu fazer",
  "até eu fazer",
  "ate concluir",
  "até concluir",
  "de meia em meia hora",
  "a cada",
];

const completionWords = ["ja fiz", "já fiz", "conclui", "concluí", "feito", "terminei", "finalizei", "terminei essa tarefa"];

export function isCompletionMessage(message = "") {
  const text = normalize(message);
  return completionWords.some((word) => text.includes(normalize(word)));
}

export function interpretReminderFromMessage(message = "") {
  const original = message.trim();
  const text = normalize(original);
  const hasIntent = reminderWords.some((word) => text.includes(normalize(word)));
  if (!hasIntent) return { hasIntent: false };

  const time = extractTime(text);
  const repeatIntervalMinutes = extractInterval(text) || 30;
  const repeatUntilDone = /ate eu fazer|ate concluir|ate eu concluir|ate marcar como feito|continuar cobrando|me cobra|cobrar/.test(text);
  const title = extractTitle(original);
  const needsClarification = !time || !title;

  return {
    hasIntent: true,
    title,
    time,
    reminderEnabled: true,
    repeatUntilDone,
    repeatIntervalMinutes,
    priority: time ? "alta" : "media",
    category: guessCategory(text),
    needsClarification,
    missing: {
      title: !title,
      time: !time,
    },
    originalMessage: original,
  };
}

export function applyReminderClarification(pendingReminder, answer = "") {
  const interpreted = interpretReminderFromMessage(`${pendingReminder.originalMessage} ${answer}`);
  const answerTime = extractTime(normalize(answer));
  const answerTitle = extractTitle(answer);

  return {
    ...pendingReminder,
    title: pendingReminder.title || interpreted.title || answerTitle,
    time: pendingReminder.time || interpreted.time || answerTime,
    repeatIntervalMinutes: interpreted.repeatIntervalMinutes || pendingReminder.repeatIntervalMinutes || 30,
    repeatUntilDone: interpreted.repeatUntilDone || pendingReminder.repeatUntilDone,
    needsClarification: !(pendingReminder.title || interpreted.title || answerTitle) || !(pendingReminder.time || interpreted.time || answerTime),
    missing: {
      title: !(pendingReminder.title || interpreted.title || answerTitle),
      time: !(pendingReminder.time || interpreted.time || answerTime),
    },
  };
}

function normalize(text = "") {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function extractTime(text) {
  const match = text.match(/\b([01]?\d|2[0-3])(?:(?:h|:)(\d{2})?)?\b/);
  if (!match) return "";
  return `${match[1].padStart(2, "0")}:${match[2] || "00"}`;
}

function extractInterval(text) {
  if (text.includes("meia em meia hora")) return 30;
  if (text.includes("de hora em hora")) return 60;

  const minuteMatch = text.match(/a cada\s+(\d+)\s*(min|minuto|minutos)/);
  if (minuteMatch) return Number(minuteMatch[1]);

  const hourMatch = text.match(/a cada\s+(\d+)\s*(h|hora|horas)/);
  if (hourMatch) return Number(hourMatch[1]) * 60;

  return null;
}

function extractTitle(message) {
  let title = message
    .replace(/\b(me lembra de|me lembra pra|me cobra de|me cobra pra|cria um lembrete pra|criar lembrete pra|cria um lembrete de|criar lembrete de|lembrar de|lembrar pra)\b/gi, "")
    .replace(/\b(e\s+)?me cobra\b.*$/gi, "")
    .replace(/\b(a cada|de meia em meia hora|de hora em hora|ate eu fazer|até eu fazer|ate concluir|até concluir|ate eu concluir|até eu concluir|continuar cobrando|cobrar)\b.*$/gi, "")
    .replace(/\b(as|às|aos|para|pra)\s+([01]?\d|2[0-3])(?:(?:h|:)(\d{2})?)?\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  title = title.replace(/^[,.;:\-\s]+|[,.;:\-\s]+$/g, "");
  if (!title || title.length < 3) return "";
  return title.charAt(0).toUpperCase() + title.slice(1);
}

function guessCategory(text) {
  if (/cliente|responder|ligar|venda|simulacao|orcamento|anuncio/.test(text)) return "vendas";
  if (/postar|anuncio|marketing|conteudo/.test(text)) return "marketing";
  if (/estudar|aula|curso/.test(text)) return "estudo";
  if (/agua|remedio|treinar|saude/.test(text)) return "saude";
  return "rotina";
}
