import React, { useMemo, useState } from "react";
import { Bot, CalendarCheck, Send, Sparkles } from "lucide-react";
import { chargeStyles } from "../data/phrases";

const checkInQuestions = [
  { key: "todayNeeds", text: "Bom dia, o que voce precisa resolver hoje?" },
  { key: "mainPriority", text: "Qual e a tarefa mais importante do dia?" },
  { key: "scheduledCommitments", text: "Tem algum compromisso com horario marcado?" },
  { key: "procrastinated", text: "Tem algo que voce esta enrolando ha dias?" },
  { key: "endTime", text: "Que horas voce quer encerrar o dia?" },
  { key: "chargeStyle", text: "Quer cobranca leve, motivadora, acida ou ignorante engracada hoje?" },
];

function makeMessage(role, text) {
  return {
    id: crypto.randomUUID(),
    role,
    text,
    createdAt: Date.now(),
  };
}

export function createInitialDailyChat() {
  return [makeMessage("pet", "Oi. Pode falar comigo normal ou clicar em Planejar meu dia quando quiser montar tarefas.")];
}

export function DailyChat({
  messages,
  checkIn,
  onSend,
  onStartPlanning,
  onUpdateCheckIn,
  isTodayPlanned,
  isLoading = false,
  aiOnline = false,
}) {
  const [draft, setDraft] = useState("");
  const isPlanning = Boolean(checkIn.active);
  const currentQuestion = isPlanning ? checkInQuestions[checkIn.step] ?? null : null;

  const styleOptions = useMemo(
    () => Object.entries(chargeStyles).map(([key, value]) => ({ key, label: value.label })),
    []
  );

  function submit(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text, currentQuestion);
    setDraft("");
  }

  return (
    <section className="glass rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-teal-200">
            <Bot size={16} />
            Chat com Cleitin
          </p>
          <h2 className="mt-1 text-2xl font-black">Inteligencia de rotina</h2>
        </div>
        <div className={`rounded-full px-3 py-2 text-xs font-black uppercase tracking-wide ${aiOnline ? "bg-teal-300/15 text-teal-100" : "bg-rose-300/15 text-rose-100"}`}>
          {aiOnline ? "IA online" : "IA offline"}
        </div>
        <button className="soft-button bg-amber-300" onClick={onStartPlanning}>
          <CalendarCheck size={18} />
          Planejar meu dia
        </button>
      </div>

      <div className="mt-5 max-h-[390px] space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/30 p-3">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[84%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                message.role === "user"
                  ? "bg-teal-300 text-slate-950"
                  : "border border-white/10 bg-white/10 text-slate-100"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-slate-100">
              Cleitin digitando<span className="animate-pulse">...</span>
            </div>
          </div>
        )}
      </div>

      {currentQuestion?.key === "chargeStyle" && (
        <div className="mt-3 flex flex-wrap gap-2">
          {styleOptions.map((style) => (
            <button
              key={style.key}
              className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-bold text-slate-100 hover:bg-white/20"
              onClick={() => {
                onUpdateCheckIn("chargeStyle", style.key);
                onSend(style.label, currentQuestion);
              }}
            >
              {style.label}
            </button>
          ))}
        </div>
      )}

      <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={submit}>
        <input
          className="input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={isLoading}
          placeholder={isPlanning ? "Responda o check-in do Cleitin" : "Fale comigo ou peça uma tarefa quando quiser"}
        />
        <button className="soft-button bg-teal-300" type="submit" disabled={isLoading}>
          <Send size={18} />
          {isLoading ? "Pensando" : "Enviar"}
        </button>
      </form>

      {isPlanning && !isTodayPlanned && (
        <p className="mt-3 flex items-center gap-2 text-sm text-slate-300">
          <Sparkles size={15} className="text-amber-200" />
          Complete o check-in para o Cleitin montar tarefas automaticas.
        </p>
      )}
    </section>
  );
}
