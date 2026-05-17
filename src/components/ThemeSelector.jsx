import React from "react";
import { Check, Lock } from "lucide-react";
import { themes } from "../data/themes";

export function ThemeSelector({ customization, onEquipTheme }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {themes.map((theme) => {
        const unlocked = customization.unlockedThemes.includes(theme.id);
        const active = customization.selectedTheme === theme.id;
        return (
          <button
            key={theme.id}
            className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
              active ? "border-[var(--theme-accent)] bg-white/15" : "border-[var(--theme-border)] bg-[var(--theme-card-strong)]"
            }`}
            onClick={() => unlocked && onEquipTheme(theme.id)}
          >
            <div className="h-16 rounded-xl border border-white/10" style={{ background: theme.background }} />
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="font-black text-[var(--theme-text)]">{theme.name}</span>
              {active ? <Check size={18} className="text-[var(--theme-accent)]" /> : !unlocked && <Lock size={18} className="text-[var(--theme-muted)]" />}
            </div>
            <p className="mt-1 text-sm text-[var(--theme-muted)]">{unlocked ? "Disponivel" : `${theme.cost} XP`}</p>
          </button>
        );
      })}
    </div>
  );
}
