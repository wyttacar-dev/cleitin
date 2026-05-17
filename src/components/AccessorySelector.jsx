import React from "react";
import { Check, Glasses, Lock, X } from "lucide-react";
import { accessories } from "../data/accessories";
import { GlassesPreview } from "./glasses/index.jsx";

export function AccessorySelector({ customization, onEquipAccessory }) {
  const equipped = customization.equippedAccessories.glasses;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-black text-[var(--theme-text)]">Oculos</h3>
        <button
          className="inline-flex items-center gap-1 rounded-xl border border-[var(--theme-border)] px-3 py-2 text-sm font-bold text-[var(--theme-muted)] hover:bg-white/10"
          onClick={() => onEquipAccessory("glasses", null)}
        >
          <X size={15} />
          Remover
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <button
          className={`glasses-card rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
            !equipped ? "border-[var(--theme-accent)] bg-white/15" : "border-[var(--theme-border)] bg-[var(--theme-card-strong)]"
          }`}
          onClick={() => onEquipAccessory("glasses", null)}
        >
          <div className="flex items-center justify-between">
            <div className="glasses-preview">
              <Glasses size={34} className="text-[var(--theme-muted)] opacity-50" />
              <X size={18} className="absolute text-rose-300" />
            </div>
            {!equipped && <Check size={18} className="text-[var(--theme-accent)]" />}
          </div>
          <p className="mt-3 font-black text-[var(--theme-text)]">Sem oculos</p>
          <p className="text-sm text-[var(--theme-muted)]">Remover do robo</p>
        </button>
        {accessories.filter((item) => !item.aliasOf).map((item) => {
          const unlocked = customization.unlockedAccessories.includes(item.id);
          const active = equipped === item.id || (equipped === "juliet" && item.id === "juliet-silver");
          return (
            <button
              key={item.id}
              className={`glasses-card rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
                active ? "border-[var(--theme-accent)] bg-white/15" : "border-[var(--theme-border)] bg-[var(--theme-card-strong)]"
              }`}
              onClick={() => unlocked && onEquipAccessory("glasses", item.id)}
            >
              <div className="flex items-center justify-between">
                <GlassesPreview id={item.id} />
                {active ? <Check size={18} className="text-[var(--theme-accent)]" /> : !unlocked && <Lock size={18} className="text-[var(--theme-muted)]" />}
              </div>
              <p className="mt-3 font-black text-[var(--theme-text)]">{item.name}</p>
              <p className="text-sm text-[var(--theme-muted)]">{unlocked ? "Equipavel" : `${item.cost} XP`}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
