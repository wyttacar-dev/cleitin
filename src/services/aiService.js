import { sendMessageToPet } from "./chatService";
import { loadMemory } from "./memoryService";

export async function generateDailyPlan(userMessage, userProfile, context = {}) {
  const result = await sendMessageToPet({
    message: userMessage,
    userProfile,
    tasks: context.tasks || [],
    mood: context.mood || "neutro",
    petType: context.petType || "cleitin",
    memory: context.memory || loadMemory(),
  });

  return {
    reply: result.reply,
    tasks: result.suggestedTasks || [],
    productivityAnalysis: result.productivityAnalysis,
    mood: result.mood,
  };
}
