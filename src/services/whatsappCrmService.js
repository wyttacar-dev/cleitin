const API_BASE = import.meta.env.VITE_API_URL || "/api";
const FALLBACK_API_BASES = import.meta.env.DEV ? ["http://localhost:3001/api", "http://localhost:3002/api"] : [];

async function request(path, options = {}) {
  const bases = [API_BASE, ...FALLBACK_API_BASES].filter((base, index, list) => base && list.indexOf(base) === index);
  let lastError = null;

  for (const base of bases) {
    try {
      const response = await fetch(`${base}/whatsapp-crm${path}`, {
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
        ...options,
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        lastError = new Error(payload.error || "Falha no CRM WhatsApp.");
        if (response.status !== 404) throw lastError;
        continue;
      }
      return payload;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Falha no CRM WhatsApp.");
}

export function getWhatsappStatus() {
  return request("/status");
}

export function connectWhatsapp() {
  return request("/connect", { method: "POST" });
}

export function disconnectWhatsapp() {
  return request("/disconnect", { method: "POST" });
}

export function analyzeWhatsappLeads(sellerStyle) {
  return request("/analyze", {
    method: "POST",
    body: JSON.stringify({ sellerStyle }),
  });
}

export function sendWhatsappMessage({ jid, text }) {
  return request("/send", {
    method: "POST",
    body: JSON.stringify({ jid, text, confirmSend: true }),
  });
}
