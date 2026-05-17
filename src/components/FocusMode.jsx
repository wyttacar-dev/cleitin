import React from "react";
import { ArrowLeft, CheckCircle2, Timer } from "lucide-react";
import { getTaskStatus } from "../hooks/useNotifications";
import { PetDisplay } from "./PetDisplay";

export function FocusMode({ tasks, onExit, onToggle, petId, accessories, visualEffects, robotColors }) {
  const nextTask = tasks.find((task) => !task.completed) ?? null;
  const overdue = tasks.some((task) => getTaskStatus(task) === "atrasada");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 text-white">
      <section className="glass w-full max-w-3xl rounded-2xl p-5 text-center sm:p-8">
        <button className="mb-4 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 font-bold text-slate-200 hover:bg-white/10" onClick={onExit}>
          <ArrowLeft size={18} />
          Sair do foco
        </button>
        <PetDisplay petId={petId} mood={overdue ? "disappointed" : "neutral"} accessories={accessories} visualEffects={visualEffects} robotColors={robotColors} compact />
        <p className="mt-5 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-teal-200">
          <Timer size={16} />
          modo foco
        </p>
        {nextTask ? (
          <>
            <h1 className="mt-4 text-4xl font-black sm:text-6xl">{nextTask.title}</h1>
            <p className="mt-3 text-lg text-slate-300">{nextTask.time ? `Horário marcado: ${nextTask.time}` : "Sem horário marcado"}</p>
            <button className="soft-button mt-8 bg-teal-300 text-lg" onClick={() => onToggle(nextTask.id)}>
              <CheckCircle2 size={20} />
              Concluir missão
            </button>
          </>
        ) : (
          <>
            <h1 className="mt-4 text-4xl font-black sm:text-6xl">Tudo concluído.</h1>
            <p className="mt-3 text-lg text-slate-300">Seu pet está em estado de pura admiração produtiva.</p>
          </>
        )}
      </section>
    </main>
  );
}
