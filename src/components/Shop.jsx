import React, { useState } from "react";
import { Check, Lock, ShoppingBag, Sparkles } from "lucide-react";
import { accessories } from "../data/accessories";
import { pets } from "../data/pets";
import { themes } from "../data/themes";
import { AccessoryPreview } from "./accessories/index.jsx";
import { PetPreview } from "./pets/index.jsx";

export function Shop({ customization, walletXp, onBuy }) {
  const [message, setMessage] = useState("");

  function buy(type, item) {
    const result = onBuy(type, item);
    setMessage(result.message);
  }

  return (
    <section className="space-y-5">
      <div className="glass rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-[var(--theme-accent)]">
              <ShoppingBag size={16} />
              Loja
            </p>
            <h2 className="mt-1 text-3xl font-black text-[var(--theme-text)]">Gaste XP com estilo</h2>
          </div>
          <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card-strong)] px-5 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--theme-muted)]">Saldo</p>
            <p className="text-2xl font-black text-[var(--theme-text)]">{walletXp} XP</p>
          </div>
        </div>
        {message && (
          <div className="mt-4 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card-strong)] p-4 font-bold text-[var(--theme-text)]">
            {message}
          </div>
        )}
      </div>

      <ShopSection title="Pets" items={pets} type="pet" unlockedIds={customization.unlockedPets} onBuy={buy} />
      <ShopSection title="Oculos" items={accessories.filter((item) => !item.aliasOf)} type="accessory" unlockedIds={customization.unlockedAccessories} onBuy={buy} />
      <ShopSection title="Temas" items={themes} type="theme" unlockedIds={customization.unlockedThemes} onBuy={buy} />
    </section>
  );
}

function ShopSection({ title, items, type, unlockedIds, onBuy }) {
  return (
    <div className="glass rounded-2xl p-5 sm:p-6">
      <p className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--theme-accent)]">
        <Sparkles size={16} />
        {title}
      </p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const unlocked = unlockedIds.includes(item.id);
          return (
            <article key={item.id} className={`glasses-card rounded-2xl border p-4 transition ${unlocked ? "border-[var(--theme-accent)] bg-white/10" : "border-[var(--theme-border)] bg-[var(--theme-card-strong)] hover:-translate-y-0.5"}`}>
              <div className="flex items-center justify-between gap-3">
                <ItemPreview type={type} item={item} />
                {unlocked ? <Check className="text-[var(--theme-accent)]" size={20} /> : <Lock className="text-[var(--theme-muted)]" size={20} />}
              </div>
              <h3 className="mt-4 text-lg font-black text-[var(--theme-text)]">{item.name}</h3>
              <p className="mt-1 min-h-10 text-sm text-[var(--theme-muted)]">{item.description || item.tier || item.category || "Tema visual completo"}</p>
              <button
                className="soft-button mt-4 w-full bg-[var(--theme-button)] text-[var(--theme-button-text)]"
                disabled={unlocked}
                onClick={() => onBuy(type, item)}
              >
                {unlocked ? (type === "accessory" ? "Comprado" : "Desbloqueado") : `Comprar por ${item.cost} XP`}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function ItemPreview({ type, item }) {
  if (type === "pet") return <PetPreview petId={item.id} className="h-16 w-16" />;
  if (type === "accessory") return <AccessoryPreview item={item} />;

  return (
    <div className="h-14 w-20 rounded-xl border border-white/10 bg-[var(--theme-background)] shadow-inner">
      <div className="h-full w-full rounded-xl bg-[var(--theme-card-strong)]" />
    </div>
  );
}
