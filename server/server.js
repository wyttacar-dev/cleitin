import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chatRouter } from "./routes/chat.js";
import { whatsappCrmRouter } from "./routes/whatsappCrm.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_ORIGINS = (process.env.CLIENT_ORIGIN || "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:5177,http://localhost:5178")
  .split(",")
  .map((origin) => origin.trim());
const LOCAL_DEV_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/;

app.use(cors({
  origin(origin, callback) {
    if (!origin || CLIENT_ORIGINS.includes(origin) || LOCAL_DEV_ORIGIN.test(origin)) return callback(null, true);
    return callback(new Error("Origem nao permitida pelo CORS."));
  },
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "cleitin-cobrancas-api",
    groqConfigured: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "SUA_API_KEY"),
  });
});

app.use("/api/chat", chatRouter);
app.use("/api/whatsapp-crm", whatsappCrmRouter);

app.listen(PORT, () => {
  console.log(`Cleitin API rodando em http://localhost:${PORT}`);
});
