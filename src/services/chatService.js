import { loadMemory } from "./memoryService";

const API_BASE = import.meta.env.VITE_API_URL || "/api";
const FALLBACK_API_BASES = import.meta.env.DEV ? ["http://localhost:3001/api", "http://localhost:3002/api"] : [];

async function postChat(body) {
  const bases = [API_BASE, ...FALLBACK_API_BASES].filter((base, index, list) => base && list.indexOf(base) === index);
  let lastError = null;

  for (const base of bases) {
    try {
      const response = await fetch(`${base}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        lastError = new Error(payload.error || "Cleitin nao conseguiu falar com a IA agora.");
        if (response.status !== 404 && response.status !== 503) throw lastError;
        continue;
      }

      return payload;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Cleitin nao conseguiu falar com a IA agora.");
}

export async function getAiHealth() {
  const bases = [API_BASE, ...FALLBACK_API_BASES].filter((base, index, list) => base && list.indexOf(base) === index);
  let lastError = null;

  for (const base of bases) {
    try {
      const response = await fetch(`${base}/health`);
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        lastError = new Error(payload.error || "Nao foi possivel verificar a IA.");
        continue;
      }

      return payload;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Nao foi possivel verificar a IA.");
}

export async function sendMessageToPet({
  message,
  userProfile,
  tasks,
  mood,
  petType,
  memory = loadMemory(),
}) {
  const payload = await postChat({
    message,
    userProfile,
    memory,
    tasks,
    mood,
    petType,
  });

  return {
    reply: payload.reply || "Beleza. Anotei aqui.",
    suggestedTasks: payload.suggestedTasks || [],
    productivityAnalysis: payload.productivityAnalysis || null,
    mood: payload.mood || mood,
  };
}
