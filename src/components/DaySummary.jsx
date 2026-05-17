import React from "react";
import { BarChart3, CheckCircle2, Lightbulb, X } from "lucide-react";
import { getTaskStatus } from "../hooks/useNotifications";

function buildComment(stats, style) {
  if (!stats.total) return "Hoje nao teve missao. O Cleitin ficou de oculos, olhando para o nada.";
  if (stats.productivity >= 80) return "Voce foi bem. O Cleitin quase bateu palma, mas lembrou que precisa manter a pose.";
  if (stats.productivity >= 50) return "Nao foi perfeito, mas tambem nao foi esse desastre todo. Amanha da para apertar mais cedo.";
  if (style === "ignorante") return "Meu parceiro, o dia escapou bonito. Amanha tenta nao abandonar o barco depois do almoco.";
  if (style === "acido") return "A lista sobreviveu mais que sua disposicao. Amanha a gente encurta a desculpa e aumenta a acao.";
  return "Hoje foi pesado. Amanha escolha menos tarefas e proteja a primeira hora do dia.";
}

export function DaySummary({ open, tasks, profile, onClose }) {
  if (!open) return null;

  const completed = tasks.filter((task) => task.completed);
  const pending = tasks.filter((task) => !task.completed);
  const overdue = tasks.filter((task) => getTaskStatus(task) === "atrasada");
  const total = tasks.length;
  const productivity = total ? Math.round((completed.length / total) * 100) : 0;
  const stats = { total, productivity };
  const suggestion =
    overdue.length > 2
      ? "Amanha coloque horario nas tarefas grandes e deixe espaco entre elas."
      : "Amanha comece pela tarefa mais importante antes de abrir distrações.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur">
      <section className="glass max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-5 text-white sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-teal-200">
              <BarChart3 size={16} />
              Resumo do dia
            </p>
            <h2 className="mt-2 text-3xl font-black">Relatorio do Cleitin</h2>
          </div>
          <button className="rounded-xl bg-white/10 p-3 hover:bg-white/20" onClick={onClose} aria-label="Fechar resumo">
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <SummaryCard label="Concluidas" value={completed.length} />
          <SummaryCard label="Pendentes" value={pending.length} />
          <SummaryCard label="Produtividade" value={`${productivity}%`} />
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
          <p className="text-sm font-bold text-slate-300">Comentario do pet</p>
          <p className="mt-2 text-xl font-black text-amber-200">{buildComment(stats, profile?.chargeStyle)}</p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <TaskColumn title="Concluidas" icon={CheckCircle2} tasks={completed} empty="Nada concluido ainda." />
          <TaskColumn title="Pendentes" icon={Lightbulb} tasks={pending} empty="Sem pendencias. Que fase." />
        </div>

        <div className="mt-5 rounded-2xl border border-teal-300/20 bg-teal-300/10 p-4">
          <p className="text-sm font-bold text-teal-100">Sugestao para amanha</p>
          <p className="mt-2 text-slate-100">{suggestion}</p>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
    </div>
  );
}

function TaskColumn({ title, icon: Icon, tasks, empty }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
      <p className="flex items-center gap-2 font-black">
        <Icon size={18} className="text-amber-200" />
        {title}
      </p>
      <div className="mt-3 space-y-2">
        {tasks.length ? (
          tasks.map((task) => (
            <div key={task.id} className="rounded-xl bg-white/10 px-3 py-2 text-sm text-slate-200">
              {task.title}
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">{empty}</p>
        )}
      </div>
    </div>
  );
}

