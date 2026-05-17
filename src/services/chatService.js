import { loadMemory } from "./memoryService";
import { sendMessageToCleitin } from "./groqChatService";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export async function getAiHealth() {
  const response = await fetch(`${API_BASE}/health`);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "Nao foi possivel verificar a IA.");
  }

  return payload;
}

export async function sendMessageToPet({
  message,
  userProfile,
  tasks,
  mood,
  petType,
  memory = loadMemory(),
}) {
  const payload = await sendMessageToCleitin({
    message,
    userProfile,
    memory,
    tasks,
    petMood: mood,
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
