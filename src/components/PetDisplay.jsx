import React from "react";
import { Flame, Heart, Meh, PartyPopper, ShieldAlert, Smile, Sparkles } from "lucide-react";
import { getPetById } from "../data/pets";
import { AccessoryLayer } from "./accessories/index.jsx";
import { petComponents, PetFallback } from "./pets/index.jsx";

const moodMeta = {
  happy: { label: "feliz", icon: Heart, className: "pet-happy" },
  neutral: { label: "neutro", icon: Meh, className: "pet-neutral" },
  angry: { label: "bravo", icon: Flame, className: "pet-angry" },
  disappointed: { label: "decepcionado", icon: ShieldAlert, className: "pet-disappointed" },
  excited: { label: "animado", icon: PartyPopper, className: "pet-excited" },
  debochado: { label: "debochado", icon: Smile, className: "pet-happy" },
};

export function PetDisplay({
  petId = "cleitin",
  mood = "neutral",
  accessories = {},
  visualEffects = { glow: true },
  robotColors,
  compact = false,
  celebrationKey = 0,
}) {
  const pet = getPetById(petId);
  const currentMood = moodMeta[mood] ?? moodMeta.neutral;
  const Icon = currentMood.icon;
  const PetBase = petComponents[petId] ?? PetFallback;

  return (
    <div
      key={`${petId}-${celebrationKey}`}
      className={`relative mx-auto ${compact ? "w-36" : "w-full max-w-[250px]"} ${currentMood.className}`}
      style={{ "--pet-color": pet.mainColor }}
    >
      {visualEffects.glow && <div className="absolute inset-x-8 bottom-2 h-12 rounded-full bg-[var(--pet-color)] opacity-35 blur-2xl" />}
      <div className={`pet-wrapper pet-anchor-${petId} relative aspect-square overflow-hidden rounded-[2rem] border border-white/15 bg-[var(--theme-card-strong)] p-5 shadow-glow backdrop-blur-2xl`}>
        <div className="absolute left-5 top-5 z-30 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-[var(--theme-muted)]">
          {pet.name}
        </div>
        <div className="pet-stage relative flex h-full items-center justify-center rounded-[1.6rem] bg-gradient-to-br from-white/12 to-black/10">
          <PetBase
            mood={mood}
            primaryColor={robotColors?.primary}
            secondaryColor={robotColors?.secondary}
            bodyColor={robotColors?.body}
            screenColor={robotColors?.screen}
            shadowColor={robotColors?.shadow}
            outlineColor={robotColors?.outline}
          />
          <AccessoryLayer accessories={accessories} />
        </div>
      </div>

      <div className="absolute right-1 top-4 z-40 rounded-full border border-white/20 bg-slate-950/70 p-2 text-white backdrop-blur">
        <Icon size={20} />
      </div>
      <div className="absolute -bottom-2 left-1/2 z-40 inline-flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/15 bg-slate-950/80 px-3 py-1 text-xs font-black text-white backdrop-blur">
        <Sparkles size={13} style={{ color: pet.mainColor }} />
        {currentMood.label}
      </div>
    </div>
  );
}
