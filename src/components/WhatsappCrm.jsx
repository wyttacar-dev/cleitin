import React, { useEffect, useMemo, useState } from "react";
import { Bell, CheckCircle2, Copy, MessageCircle, RefreshCcw, Send, ShieldCheck, Wifi, WifiOff } from "lucide-react";
import {
  analyzeWhatsappLeads,
  connectWhatsapp,
  disconnectWhatsapp,
  getWhatsappStatus,
  sendWhatsappMessage,
} from "../services/whatsappCrmService";
import {
  create as createClientRecord,
  list as listClientRecords,
  update as updateClientRecord,
} from "../services/clientService";

const statusLabels = {
  connected: "Conectado",
  connecting: "Conectando",
  qr: "Aguardando QR",
  disconnected: "Desconectado",
  logged_out: "Sessao encerrada",
};

const leadStyles = {
  quente: "border-rose-300/40 bg-rose-300/10 text-rose-100",
  morno: "border-amber-300/40 bg-amber-300/10 text-amber-100",
  frio: "border-sky-300/40 bg-sky-300/10 text-sky-100",
  "sem resposta": "border-slate-300/40 bg-slate-300/10 text-slate-100",
};

export function WhatsappCrm({ profile, notifications }) {
  const [status, setStatus] = useState({ status: "disconnected" });
  const [leads, setLeads] = useState([]);
  const [generatedAt, setGeneratedAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [sendingId, setSendingId] = useState(null);
  const [savedClientsCount, setSavedClientsCount] = useState(0);

  const todayLeads = useMemo(() => leads.filter((lead) => lead.dueToday), [leads]);

  async function refreshStatus() {
    const nextStatus = await getWhatsappStatus();
    setStatus(nextStatus);
    return nextStatus;
  }

  async function startConnection() {
    setLoading(true);
    setMessage("");
    try {
      const nextStatus = await connectWhatsapp();
      setStatus(nextStatus);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function stopConnection() {
    setLoading(true);
    try {
      const nextStatus = await disconnectWhatsapp();
      setStatus(nextStatus);
      setLeads([]);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function runAnalysis() {
    setLoading(true);
    setMessage("");
    try {
      const result = await analyzeWhatsappLeads(profile?.chargeStyle);
      setLeads(result.leads || []);
      setGeneratedAt(result.generatedAt || Date.now());
      notifyFollowUps(result.today || []);
      await syncLeadsToCloud(result.leads || []);
      if (!result.leads?.length) {
        setMessage("Nenhum follow-up urgente apareceu nas conversas recentes.");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function syncLeadsToCloud(items) {
    if (!items.length) return;

    try {
      const existingClients = await listClientRecords();
      const clientsByPhone = new Map(existingClients.map((client) => [normalizePhone(client.phone), client]));
      let saved = 0;

      for (const lead of items) {
        const phoneKey = normalizePhone(lead.phone);
        const payload = {
          name: lead.name || "Cliente sem nome",
          phone: lead.phone || "",
          lead_status: lead.leadStatus || "novo",
          notes: [
            lead.nextAction,
            lead.suggestedMessage ? `Mensagem sugerida: ${lead.suggestedMessage}` : "",
            lead.tags?.length ? `Tags: ${lead.tags.join(", ")}` : "",
          ].filter(Boolean).join("\n"),
        };

        const current = clientsByPhone.get(phoneKey);
        if (current) {
          await updateClientRecord(current.id, payload);
        } else {
          await createClientRecord(payload);
        }
        saved += 1;
      }

      setSavedClientsCount((current) => current + saved);
    } catch (error) {
      setMessage(error.message || "Analise concluida, mas nao consegui salvar clientes no Supabase.");
    }
  }

  async function copyMessage(lead) {
    await navigator.clipboard.writeText(lead.suggestedMessage);
    setCopiedId(lead.id);
    setTimeout(() => setCopiedId(null), 1800);
  }

  async function sendMessage(lead) {
    const approved = window.confirm(`Enviar esta mensagem para ${lead.name}? Confira o texto antes de confirmar.`);
    if (!approved) return;

    setSendingId(lead.id);
    setMessage("");
    try {
      await sendWhatsappMessage({ jid: lead.jid, text: lead.suggestedMessage });
      setMessage("Mensagem enviada com aprovacao manual.");
      await runAnalysis();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSendingId(null);
    }
  }

  function notifyFollowUps(items) {
    if (!items.length || !notifications?.canNotify || !("Notification" in window)) return;
    const last = Number(localStorage.getItem("cleitin-last-crm-notification") || 0);
    if (Date.now() - last < 60 * 60 * 1000) return;

    new Notification("Cleitin achou cliente para cobrar", {
      body: `${items.length} follow-up${items.length > 1 ? "s" : ""} esperando sua aprovacao manual.`,
      icon: "/pet-icon.svg",
      tag: "whatsapp-crm-followups",
    });
    localStorage.setItem("cleitin-last-crm-notification", String(Date.now()));
  }

  useEffect(() => {
    let alive = true;
    refreshStatus().catch(() => undefined);
    listClientRecords()
      .then((items) => {
        if (alive) setSavedClientsCount(items.length);
      })
      .catch(() => undefined);
    const interval = window.setInterval(async () => {
      try {
        const nextStatus = await getWhatsappStatus();
        if (alive) setStatus(nextStatus);
      } catch {
        if (alive) setStatus((current) => ({ ...current, status: "disconnected" }));
      }
    }, 3500);
    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <section className="space-y-5">
      <div className="glass rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-[var(--theme-accent)]">
              <MessageCircle size={16} />
              CRM WhatsApp
            </p>
            <h2 className="mt-1 text-3xl font-black text-[var(--theme-text)]">Clientes para cobrar hoje</h2>
            <p className="mt-3 max-w-2xl text-[var(--theme-muted)]">
              O Cleitin analisa conversas recentes, aponta leads que merecem retorno e prepara mensagens para voce aprovar.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card-strong)] p-4">
            <div className="flex items-center gap-2 font-black text-[var(--theme-text)]">
              {status.connected ? <Wifi size={18} className="text-emerald-300" /> : <WifiOff size={18} className="text-amber-300" />}
              {statusLabels[status.status] || status.status}
            </div>
            <p className="mt-1 text-sm text-[var(--theme-muted)]">{status.conversationCount || 0} conversas lidas nesta sessao</p>
          </div>
        </div>

        {message && (
          <div className="mt-4 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card-strong)] p-4 font-bold text-[var(--theme-text)]">
            {message}
          </div>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <button className="soft-button bg-[var(--theme-button)] text-[var(--theme-button-text)]" onClick={startConnection} disabled={loading || status.connected || status.status === "qr"}>
            <Wifi size={18} />
            Conectar WhatsApp
          </button>
          <button className="soft-button bg-white text-slate-950" onClick={runAnalysis} disabled={loading}>
            <RefreshCcw size={18} />
            Analisar conversas
          </button>
          <button className="soft-button bg-amber-300" onClick={notifications?.requestPermission} disabled={notifications?.permission === "granted"}>
            <Bell size={18} />
            Lembretes CRM
          </button>
          <button className="soft-button bg-slate-200 text-slate-950" onClick={stopConnection} disabled={loading || status.status === "disconnected"}>
            <WifiOff size={18} />
            Desconectar
          </button>
        </div>

        {status.qrDataUrl && (
          <div className="mt-5 grid gap-5 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card-strong)] p-5 md:grid-cols-[280px_1fr]">
            <img src={status.qrDataUrl} alt="QR Code para conectar WhatsApp Web" className="rounded-2xl bg-white p-3" />
            <div className="self-center">
              <p className="font-black text-[var(--theme-text)]">Escaneie pelo WhatsApp</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--theme-muted)]">
                Abra WhatsApp no celular, entre em aparelhos conectados e escaneie este QR. A sessao fica salva localmente no backend.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CrmMetric label="Para cobrar" value={todayLeads.length} />
        <CrmMetric label="Leads quentes" value={leads.filter((lead) => lead.leadStatus === "quente").length} />
        <CrmMetric label="Sem resposta" value={leads.filter((lead) => lead.leadStatus === "sem resposta").length} />
        <CrmMetric label="Clientes na nuvem" value={savedClientsCount} />
      </div>

      <div className="glass rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-[var(--theme-accent)]">
              <ShieldCheck size={16} />
              Aprovacao manual obrigatoria
            </p>
            <h3 className="mt-1 text-2xl font-black text-[var(--theme-text)]">Follow-ups sugeridos</h3>
          </div>
          {generatedAt && <p className="text-sm font-bold text-[var(--theme-muted)]">Atualizado {new Date(generatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>}
        </div>

        <div className="mt-5 space-y-3">
          {todayLeads.length ? (
            todayLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                copied={copiedId === lead.id}
                sending={sendingId === lead.id}
                onCopy={() => copyMessage(lead)}
                onSend={() => sendMessage(lead)}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card-strong)] p-6 text-[var(--theme-muted)]">
              Conecte o WhatsApp e rode a analise para o Cleitin encontrar clientes que precisam de retorno.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function normalizePhone(phone = "") {
  return phone.replace(/\D/g, "");
}

function LeadCard({ lead, copied, sending, onCopy, onSend }) {
  return (
    <article className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card-strong)] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-xl font-black text-[var(--theme-text)]">{lead.name}</h4>
            <span className={`rounded-full border px-3 py-1 text-xs font-black ${leadStyles[lead.leadStatus] || leadStyles.morno}`}>
              {lead.leadStatus}
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--theme-muted)]">{lead.phone}</p>
        </div>
        <p className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold text-[var(--theme-text)]">{lead.nextAction}</p>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--theme-border)] bg-slate-950/20 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-[var(--theme-muted)]">Ultima mensagem do cliente</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--theme-text)]">{lead.lastCustomerMessage?.text || "Sem mensagem do cliente capturada ainda."}</p>
        </div>
        <div className="rounded-2xl border border-[var(--theme-border)] bg-slate-950/20 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-[var(--theme-muted)]">Mensagem sugerida</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--theme-text)]">{lead.suggestedMessage}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {lead.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[var(--theme-muted)]">{tag}</span>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button className="soft-button bg-white text-slate-950" onClick={onCopy}>
          {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
          {copied ? "Copiado" : "Copiar mensagem"}
        </button>
        <button className="soft-button bg-[var(--theme-button)] text-[var(--theme-button-text)]" onClick={onSend} disabled={sending}>
          <Send size={18} />
          {sending ? "Enviando" : "Enviar com confirmacao"}
        </button>
      </div>
    </article>
  );
}

function CrmMetric({ label, value }) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--theme-muted)]">{label}</p>
      <p className="mt-1 text-3xl font-black text-[var(--theme-text)]">{value}</p>
    </div>
  );
}
