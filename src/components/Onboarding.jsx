import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { chargeStyles } from "../data/phrases";

const steps = ["nome", "rotina", "objetivos", "tarefas", "estilo"];

export function Onboarding({ onFinish }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    wakeTime: "07:00",
    sleepTime: "23:00",
    goals: "",
    fixedTasks: ["Beber água", "Planejar o dia", "Estudar 30 minutos"],
    chargeStyle: "acido",
  });

  const isLast = step === steps.length - 1;
  const canContinue = form.name.trim() || step !== 0;

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateTask(index, value) {
    setForm((current) => ({
      ...current,
      fixedTasks: current.fixedTasks.map((task, taskIndex) => (taskIndex === index ? value : task)),
    }));
  }

  function next() {
    if (!canContinue) return;
    if (isLast) {
      onFinish({
        ...form,
        name: form.name.trim(),
        goals: form.goals.trim(),
        fixedTasks: form.fixedTasks.filter((task) => task.trim()),
      });
      return;
    }
    setStep((current) => current + 1);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 text-white">
      <section className="glass w-full max-w-2xl rounded-2xl p-5 sm:p-7">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-200">Onboarding inteligente</p>
            <h1 className="mt-2 text-3xl font-black">Configure o Cleitin</h1>
          </div>
          <div className="rounded-full bg-slate-950/50 px-3 py-2 text-sm font-black text-amber-200">
            {step + 1}/{steps.length}
          </div>
        </div>

        <div className="mb-6 h-2 rounded-full bg-slate-950/60">
          <div
            className="h-full rounded-full bg-teal-300 transition-all"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="min-h-[300px] animate-pop">
          {step === 0 && (
            <Field label="Qual é o seu nome?">
              <input className="input" value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Ex.: Ana" autoFocus />
            </Field>
          )}

          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Que horas você acorda?">
                <input className="input" type="time" value={form.wakeTime} onChange={(event) => updateField("wakeTime", event.target.value)} />
              </Field>
              <Field label="Que horas você dorme?">
                <input className="input" type="time" value={form.sleepTime} onChange={(event) => updateField("sleepTime", event.target.value)} />
              </Field>
            </div>
          )}

          {step === 2 && (
            <Field label="Quais são seus principais objetivos?">
              <textarea className="input min-h-36 resize-none" value={form.goals} onChange={(event) => updateField("goals", event.target.value)} placeholder="Ex.: estudar, treinar, cuidar da casa, entregar projetos..." />
            </Field>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="text-lg font-black">Tarefas fixas do dia</p>
              {form.fixedTasks.map((task, index) => (
                <input key={index} className="input" value={task} onChange={(event) => updateTask(index, event.target.value)} placeholder={`Tarefa ${index + 1}`} />
              ))}
              <button
                className="rounded-xl border border-white/10 px-4 py-3 font-bold text-teal-100 transition hover:bg-white/10"
                onClick={() => updateField("fixedTasks", [...form.fixedTasks, ""])}
              >
                Adicionar tarefa fixa
              </button>
            </div>
          )}

          {step === 4 && (
            <div>
              <p className="text-lg font-black">Como o pet deve cobrar você?</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {Object.entries(chargeStyles).map(([key, style]) => (
                  <button
                    key={key}
                    className={`rounded-2xl border p-4 text-left transition ${form.chargeStyle === key ? "border-amber-300 bg-amber-300/15" : "border-white/10 bg-slate-950/30 hover:bg-white/10"}`}
                    onClick={() => updateField("chargeStyle", key)}
                  >
                    <span className="font-black">{style.label}</span>
                    <span className="mt-1 block text-sm text-slate-300">{style.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-7 flex items-center justify-between gap-3">
          <button
            className="soft-button bg-white/10 text-white"
            onClick={() => setStep((current) => Math.max(current - 1, 0))}
            disabled={step === 0}
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
          <button className="soft-button bg-amber-300" onClick={next} disabled={!canContinue}>
            {isLast ? <Check size={18} /> : <ArrowRight size={18} />}
            {isLast ? "Entrar no app" : "Continuar"}
          </button>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-3 block text-lg font-black">{label}</span>
      {children}
    </label>
  );
}
