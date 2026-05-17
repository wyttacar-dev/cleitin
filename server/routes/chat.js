import express from "express";
import { generatePetReply } from "../services/groqService.js";

export const chatRouter = express.Router();

chatRouter.post("/", async (req, res) => {
  try {
    const { message, userProfile, memory, tasks, mood, petType } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message e obrigatorio." });
    }

    const result = await generatePetReply({
      message,
      userProfile,
      memory,
      tasks,
      mood,
      petType,
    });

    return res.json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      error: error.message || "Erro ao chamar a IA do Cleitin.",
    });
  }
});
