import path from "node:path";
import { fileURLToPath } from "node:url";
import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import pino from "pino";
import QRCode from "qrcode";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_DIR = path.join(__dirname, "..", ".baileys-auth");
const MAX_MESSAGES_PER_CHAT = 60;

class WhatsappBaileysService {
  constructor() {
    this.sock = null;
    this.status = "disconnected";
    this.qr = null;
    this.qrDataUrl = null;
    this.lastError = null;
    this.started = false;
    this.conversations = new Map();
  }

  async connect() {
    if (this.status === "connected" || this.status === "connecting" || this.status === "qr") return this.getStatus();

    this.status = "connecting";
    this.lastError = null;
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    this.sock = makeWASocket({
      auth: state,
      version,
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      markOnlineOnConnect: false,
      syncFullHistory: true,
      browser: Browsers.macOS("Desktop"),
    });

    this.sock.ev.on("creds.update", saveCreds);
    this.sock.ev.on("connection.update", (update) => this.handleConnectionUpdate(update));
    this.sock.ev.on("messages.upsert", ({ messages }) => this.ingestMessages(messages));
    this.started = true;

    return this.getStatus();
  }

  async disconnect() {
    if (this.sock) {
      await this.sock.logout().catch(() => undefined);
      this.sock.end?.();
    }
    this.sock = null;
    this.qr = null;
    this.qrDataUrl = null;
    this.status = "disconnected";
    return this.getStatus();
  }

  async handleConnectionUpdate(update) {
    if (update.qr) {
      this.qr = update.qr;
      this.qrDataUrl = await QRCode.toDataURL(update.qr, { margin: 1, width: 280 });
      this.status = "qr";
    }

    if (update.connection === "open") {
      this.status = "connected";
      this.qr = null;
      this.qrDataUrl = null;
      this.lastError = null;
    }

    if (update.connection === "close") {
      const statusCode = update.lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      this.status = shouldReconnect ? "disconnected" : "logged_out";
      this.lastError = update.lastDisconnect?.error?.message || "Conexao encerrada.";
      this.sock = null;
      if (shouldReconnect && this.started) {
        setTimeout(() => this.connect().catch((error) => {
          this.lastError = error.message;
          this.status = "disconnected";
        }), 3000);
      }
    }
  }

  ingestMessages(messages = []) {
    messages.forEach((message) => {
      const jid = message.key?.remoteJid;
      if (!jid || jid.endsWith("@g.us") || jid === "status@broadcast") return;

      const text = extractText(message);
      if (!text) return;

      const timestamp = Number(message.messageTimestamp || 0) * 1000 || Date.now();
      const existing = this.conversations.get(jid) || {
        id: jid,
        jid,
        phone: jidToPhone(jid),
        name: message.pushName || jidToPhone(jid),
        messages: [],
      };

      if (message.pushName && (!existing.name || existing.name === existing.phone)) existing.name = message.pushName;
      existing.messages.push({
        id: message.key?.id || `${jid}-${timestamp}`,
        text,
        fromMe: Boolean(message.key?.fromMe),
        timestamp,
      });
      existing.messages = dedupeMessages(existing.messages).slice(-MAX_MESSAGES_PER_CHAT);
      existing.updatedAt = Math.max(...existing.messages.map((item) => item.timestamp));
      this.conversations.set(jid, existing);
    });
  }

  getStatus() {
    return {
      status: this.status,
      connected: this.status === "connected",
      qr: this.qr,
      qrDataUrl: this.qrDataUrl,
      lastError: this.lastError,
      conversationCount: this.conversations.size,
    };
  }

  getRecentConversations(limit = 40) {
    return Array.from(this.conversations.values())
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .slice(0, limit);
  }

  async sendMessage(jid, text, options = {}) {
    if (!options.confirmSend) {
      const error = new Error("Envio bloqueado: confirmacao manual obrigatoria.");
      error.statusCode = 400;
      throw error;
    }
    if (!this.sock || this.status !== "connected") {
      const error = new Error("WhatsApp nao conectado.");
      error.statusCode = 409;
      throw error;
    }
    if (!jid || !text) {
      const error = new Error("jid e text sao obrigatorios.");
      error.statusCode = 400;
      throw error;
    }

    await this.sock.sendMessage(jid, { text });
    this.ingestMessages([{
      key: { remoteJid: jid, fromMe: true, id: `manual-${Date.now()}` },
      messageTimestamp: Math.floor(Date.now() / 1000),
      message: { conversation: text },
    }]);
    return { ok: true };
  }
}

function extractText(message) {
  const payload = message.message || {};
  return (
    payload.conversation ||
    payload.extendedTextMessage?.text ||
    payload.imageMessage?.caption ||
    payload.videoMessage?.caption ||
    payload.documentMessage?.caption ||
    payload.buttonsResponseMessage?.selectedDisplayText ||
    payload.listResponseMessage?.title ||
    ""
  ).trim();
}

function dedupeMessages(messages) {
  const seen = new Set();
  return messages.filter((message) => {
    if (seen.has(message.id)) return false;
    seen.add(message.id);
    return true;
  });
}

function jidToPhone(jid = "") {
  return jid.replace("@s.whatsapp.net", "");
}

export const whatsappBaileysService = new WhatsappBaileysService();
