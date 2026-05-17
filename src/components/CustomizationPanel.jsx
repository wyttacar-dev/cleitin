import React from "react";
import { Check, Lock, Palette, Shirt, Smile } from "lucide-react";
import { pets } from "../data/pets";
import { PetDisplay } from "./PetDisplay";
import { ThemeSelector } from "./ThemeSelector";
import { AccessorySelector } from "./AccessorySelector";
import { PetPreview } from "./pets/index.jsx";

export function CustomizationPanel({
  customization,
  activePet,
  petMood,
  walletXp,
  onEquipPet,
  onEquipAccessory,
  onEquipTheme,
  onToggleVisualEffect,
  onUpdateRobotColors,
}) {
  return (
    <section className="space-y-5">
      <div className="glass rounded-2xl p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <div>
            <PetDisplay
              petId={customization.selectedPet}
              mood={petMood}
              accessories={customization.equippedAccessories}
              visualEffects={customization.visualEffects}
              robotColors={customization.robotColors}
            />
            <div className="mt-4 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card-strong)] p-4">
              <p className="text-sm font-bold text-[var(--theme-muted)]">XP disponivel</p>
              <p className="text-4xl font-black text-[var(--theme-text)]">{walletXp}</p>
            </div>
          </div>
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-[var(--theme-accent)]">
              <Smile size={16} />
              Personalizar
            </p>
            <h2 className="mt-1 text-3xl font-black text-[var(--theme-text)]">Escolha o visual do seu cobrador</h2>
            <p className="mt-3 text-[var(--theme-muted)]">{activePet.description}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {pets.map((pet) => {
                const unlocked = customization.unlockedPets.includes(pet.id);
                const active = customization.selectedPet === pet.id;
                return (
                  <button
                    key={pet.id}
                    className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
                      active ? "border-[var(--theme-accent)] bg-white/15" : "border-[var(--theme-border)] bg-[var(--theme-card-strong)]"
                    }`}
                    onClick={() => unlocked && onEquipPet(pet.id)}
                  >
                    <div className="flex items-center justify-between">
                      <PetPreview petId={pet.id} className="h-16 w-16" robotColors={customization.robotColors} />
                      {active ? <Check size={18} className="text-[var(--theme-accent)]" /> : !unlocked && <Lock size={18} className="text-[var(--theme-muted)]" />}
                    </div>
                    <p className="mt-3 font-black text-[var(--theme-text)]">{pet.name}</p>
                    <p className="mt-1 text-sm text-[var(--theme-muted)]">{unlocked ? pet.personality : `${pet.cost} XP`}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 sm:p-6">
        <p className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--theme-accent)]">
          <Palette size={16} />
          Cores do robo
        </p>
        <RobotColorPanel colors={customization.robotColors} onChange={onUpdateRobotColors} />
      </div>

      <div className="glass rounded-2xl p-5 sm:p-6">
        <p className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--theme-accent)]">
          <Shirt size={16} />
          Oculos equipaveis
        </p>
        <AccessorySelector customization={customization} onEquipAccessory={onEquipAccessory} />
      </div>

      <div className="glass rounded-2xl p-5 sm:p-6">
        <p className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--theme-accent)]">
          <Palette size={16} />
          Temas do app
        </p>
        <ThemeSelector customization={customization} onEquipTheme={onEquipTheme} />
      </div>

      <div className="glass rounded-2xl p-5 sm:p-6">
        <p className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--theme-accent)]">
          <Palette size={16} />
          Efeitos visuais
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <EffectToggle
            label="Brilho do pet"
            description="Mantem a aura luminosa ao redor do personagem."
            checked={customization.visualEffects.glow}
            onChange={() => onToggleVisualEffect("glow")}
          />
          <EffectToggle
            label="Comemoracao ao concluir"
            description="Faz o pet reagir quando uma tarefa vira XP."
            checked={customization.visualEffects.bounceOnComplete}
            onChange={() => onToggleVisualEffect("bounceOnComplete")}
          />
        </div>
      </div>
    </section>
  );
}

const robotColorPresets = [
  { id: "original", name: "Roxo original", colors: { primary: "#7c5cff", secondary: "#5eead4", body: "#f8f4e8", screen: "#3b2477", shadow: "#241b3f", outline: "#d8d0bd" } },
  { id: "cyber-blue", name: "Azul cyberpunk", colors: { primary: "#2563eb", secondary: "#22d3ee", body: "#f8fafc", screen: "#172554", shadow: "#0f172a", outline: "#cbd5e1" } },
  { id: "neon-green", name: "Verde neon", colors: { primary: "#22c55e", secondary: "#bef264", body: "#f7fee7", screen: "#052e16", shadow: "#022c22", outline: "#d9f99d" } },
  { id: "red", name: "Vermelho agressivo", colors: { primary: "#ef4444", secondary: "#fca5a5", body: "#fff1f2", screen: "#450a0a", shadow: "#1f0a0a", outline: "#fecaca" } },
  { id: "gold", name: "Dourado premium", colors: { primary: "#f59e0b", secondary: "#fde68a", body: "#fffbeb", screen: "#451a03", shadow: "#271300", outline: "#fef3c7" } },
  { id: "pink", name: "Rosa futurista", colors: { primary: "#ec4899", secondary: "#67e8f9", body: "#fdf2f8", screen: "#4a044e", shadow: "#251028", outline: "#fbcfe8" } },
];

function RobotColorPanel({ colors, onChange }) {
  const colorFields = [
    { key: "primary", label: "Principal" },
    { key: "secondary", label: "Secundaria" },
    { key: "screen", label: "Tela" },
    { key: "body", label: "Corpo" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {robotColorPresets.map((preset) => (
          <button
            key={preset.id}
            className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card-strong)] p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/10"
            onClick={() => onChange(preset.colors)}
          >
            <div className="flex gap-1">
              {["primary", "secondary", "screen", "body"].map((key) => (
                <span key={key} className="h-6 flex-1 rounded-full border border-white/20" style={{ background: preset.colors[key] }} />
              ))}
            </div>
            <p className="mt-3 font-black text-[var(--theme-text)]">{preset.name}</p>
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {colorFields.map((field) => (
          <label key={field.key} className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card-strong)] p-4">
            <span className="text-sm font-bold text-[var(--theme-muted)]">{field.label}</span>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="color"
                value={colors?.[field.key] || "#7c5cff"}
                onChange={(event) => onChange({ [field.key]: event.target.value })}
                className="h-11 w-14 cursor-pointer rounded-xl border border-white/20 bg-transparent"
              />
              <span className="font-mono text-sm font-bold text-[var(--theme-text)]">{colors?.[field.key]}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

function EffectToggle({ label, description, checked, onChange }) {
  return (
    <button
      className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
        checked ? "border-[var(--theme-accent)] bg-white/15" : "border-[var(--theme-border)] bg-[var(--theme-card-strong)]"
      }`}
      onClick={onChange}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-black text-[var(--theme-text)]">{label}</p>
          <p className="mt-1 text-sm text-[var(--theme-muted)]">{description}</p>
        </div>
        <span className={`h-7 w-12 rounded-full p-1 transition ${checked ? "bg-[var(--theme-accent)]" : "bg-white/20"}`}>
          <span className={`block h-5 w-5 rounded-full bg-white transition ${checked ? "translate-x-5" : ""}`} />
        </span>
      </div>
    </button>
  );
}
