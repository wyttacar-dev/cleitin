import express from "express";
import { analyzeConversations } from "../services/crmAnalyzer.js";
import { whatsappBaileysService } from "../services/whatsappBaileysService.js";

export const whatsappCrmRouter = express.Router();

whatsappCrmRouter.get("/status", (_req, res) => {
  res.json(whatsappBaileysService.getStatus());
});

whatsappCrmRouter.post("/connect", async (_req, res) => {
  try {
    const status = await whatsappBaileysService.connect();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message || "Nao foi possivel iniciar o WhatsApp." });
  }
});

whatsappCrmRouter.post("/disconnect", async (_req, res) => {
  const status = await whatsappBaileysService.disconnect();
  res.json(status);
});

whatsappCrmRouter.get("/conversations", (req, res) => {
  const limit = Number(req.query.limit || 40);
  res.json({ conversations: whatsappBaileysService.getRecentConversations(limit) });
});

whatsappCrmRouter.post("/analyze", (req, res) => {
  const { sellerStyle } = req.body || {};
  const conversations = whatsappBaileysService.getRecentConversations(80);
  const leads = analyzeConversations(conversations, { sellerStyle });
  res.json({
    generatedAt: Date.now(),
    leads,
    today: leads.filter((lead) => lead.dueToday),
  });
});

whatsappCrmRouter.post("/send", async (req, res) => {
  try {
    const { jid, text, confirmSend } = req.body || {};
    const result = await whatsappBaileysService.sendMessage(jid, text, { confirmSend });
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || "Falha ao enviar mensagem." });
  }
});
