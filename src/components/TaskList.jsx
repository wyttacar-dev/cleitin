import React from "react";
import { BellRing, CheckCircle2, Clock, MessageCircle, Repeat2, Trash2, XCircle } from "lucide-react";
import { getTaskStatus } from "../hooks/useNotifications";

const statusStyles = {
  pendente: "bg-amber-300/15 text-amber-100 border-amber-300/20",
  concluida: "bg-teal-300/15 text-teal-100 border-teal-300/20",
  atrasada: "bg-rose-300/15 text-rose-100 border-rose-300/20",
};

export function TaskList({ tasks, onToggle, onDelete, onUpdate }) {
  if (!tasks.length) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-xl font-black">Nenhuma missão cadastrada.</p>
        <p className="mt-2 text-slate-300">Adicione uma tarefa e deixe seu pet começar a cobrar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const status = getTaskStatus(task);
        const StatusIcon = status === "concluida" ? CheckCircle2 : status === "atrasada" ? XCircle : Clock;

        return (
          <article key={task.id} className="glass rounded-2xl p-4 transition hover:bg-white/[0.095]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${statusStyles[status]}`}>
                    <StatusIcon size={14} />
                    {status}
                  </span>
                  {task.time && <span className="text-sm font-bold text-slate-300">{task.time}</span>}
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-300">
                    {task.priority || "media"}
                  </span>
                  <span className="rounded-full bg-teal-300/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-100">
                    {task.category || "rotina"}
                  </span>
                  {task.createdByChat && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-100">
                      <MessageCircle size={13} />
                      Criado pelo chat
                    </span>
                  )}
                  {task.reminderEnabled && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-300/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-violet-100">
                      <BellRing size={13} />
                      Cobra ate concluir
                    </span>
                  )}
                  {task.reminderEnabled && task.repeatUntilDone && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-300/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-100">
                      <Repeat2 size={13} />
                      Repetindo a cada {task.repeatIntervalMinutes || 30}min
                    </span>
                  )}
                </div>
                <input
                  className={`mt-3 w-full bg-transparent text-xl font-black outline-none ${task.completed ? "text-slate-500 line-through" : "text-white"}`}
                  value={task.title}
                  onChange={(event) => onUpdate(task.id, { title: event.target.value })}
                />
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                  <label className="inline-flex items-center gap-2 font-bold">
                    <input
                      type="checkbox"
                      checked={Boolean(task.reminderEnabled)}
                      onChange={(event) => onUpdate(task.id, { reminderEnabled: event.target.checked })}
                    />
                    Cobrança recorrente
                  </label>
                  <label className="inline-flex items-center gap-2 font-bold">
                    Intervalo
                    <input
                      className="input w-24 py-2"
                      type="number"
                      min="5"
                      step="5"
                      value={task.repeatIntervalMinutes || 30}
                      onChange={(event) => onUpdate(task.id, { repeatIntervalMinutes: Number(event.target.value) || 30 })}
                    />
                    min
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  className="input w-32"
                  type="time"
                  value={task.time}
                  onChange={(event) => onUpdate(task.id, { time: event.target.value })}
                  aria-label={`Horário de ${task.title}`}
                />
                <button className="rounded-xl bg-teal-300 p-3 text-slate-950 transition hover:-translate-y-0.5" onClick={() => onToggle(task.id)} aria-label="Alternar tarefa">
                  <CheckCircle2 size={20} />
                </button>
                <button className="rounded-xl bg-rose-300 p-3 text-slate-950 transition hover:-translate-y-0.5" onClick={() => onDelete(task.id)} aria-label="Excluir tarefa">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
