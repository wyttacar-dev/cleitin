import { generatePetReply } from "../../server/services/groqService.js";

const jsonHeaders = {
  "Content-Type": "application/json",
};

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ error: "Metodo nao permitido." }),
    };
  }

  try {
    const { message, userProfile, memory, tasks, mood, petType } = JSON.parse(event.body || "{}");

    if (!message || typeof message !== "string") {
      return {
        statusCode: 400,
        headers: jsonHeaders,
        body: JSON.stringify({ error: "message e obrigatorio." }),
      };
    }

    const result = await generatePetReply({
      message,
      userProfile,
      memory,
      tasks,
      mood,
      petType,
    });

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: error.statusCode || 500,
      headers: jsonHeaders,
      body: JSON.stringify({
        error: error.message || "Erro ao chamar a IA do Cleitin.",
      }),
    };
  }
}
