import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { PetDisplay } from "./PetDisplay";

export function WelcomeScreen({ onStart }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 text-white">
      <section className="grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="order-2 lg:order-1">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.24em] text-teal-200">
            <Sparkles size={16} />
            produtividade com personalidade
          </p>
          <h1 className="mt-4 text-5xl font-black leading-none sm:text-7xl">Cleitin Cobranças</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
            Conheça Cleitin, o pet virtual que organiza suas missões diárias, cobra no horário e comemora cada tarefa concluída com XP.
          </p>
          <button className="soft-button mt-8 bg-amber-300 text-lg" onClick={onStart}>
            Criar meu perfil
            <ArrowRight size={20} />
          </button>
        </div>
        <div className="order-1 rounded-3xl border border-white/10 bg-white/[0.07] p-6 shadow-glow backdrop-blur-2xl lg:order-2">
          <PetDisplay mood="happy" petId="cleitin" accessories={{ glasses: "juliet" }} />
        </div>
      </section>
    </main>
  );
}
