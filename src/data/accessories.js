export const accessoryCategories = [
  { id: "glasses", label: "Oculos" },
];

export const accessories = [
  { id: "juliet-silver", name: "Juliete prata", category: "glasses", cost: 0, unlocked: true, tier: "gratis" },
  { id: "juliet", name: "Juliete prata classica", category: "glasses", cost: 0, unlocked: true, tier: "gratis", aliasOf: "juliet-silver" },
  { id: "juliet-black", name: "Juliete preta", category: "glasses", cost: 180, unlocked: false, tier: "street" },
  { id: "juliet-gold", name: "Juliete dourada", category: "glasses", cost: 500, unlocked: false, tier: "premium" },
  { id: "juliet-blue", name: "Juliete espelhada azul", category: "glasses", cost: 320, unlocked: false, tier: "premium" },
  { id: "juliet-red", name: "Juliete vermelha", category: "glasses", cost: 260, unlocked: false, tier: "street" },
  { id: "pixel-glasses", name: "Oculos pixel", category: "glasses", cost: 90, unlocked: false, tier: "gamer" },
  { id: "cyberpunk-glasses", name: "Oculos cyberpunk", category: "glasses", cost: 700, unlocked: false, tier: "neon" },
  { id: "future-neon-glasses", name: "Oculos futurista neon", category: "glasses", cost: 1000, unlocked: false, tier: "lendario" },
  { id: "heart-glasses", name: "Oculos coracao", category: "glasses", cost: 110, unlocked: false, tier: "fun" },
  { id: "executive-glasses", name: "Oculos executivo", category: "glasses", cost: 220, unlocked: false, tier: "premium" },
  { id: "gamer-rgb-glasses", name: "Oculos gamer RGB", category: "glasses", cost: 420, unlocked: false, tier: "gamer" },
  { id: "matrix-glasses", name: "Oculos matrix", category: "glasses", cost: 380, unlocked: false, tier: "cyber" },
  { id: "retro-glasses", name: "Oculos retro", category: "glasses", cost: 160, unlocked: false, tier: "street" },
  { id: "clear-glasses", name: "Oculos transparente", category: "glasses", cost: 130, unlocked: false, tier: "clean" },
  { id: "smoke-glasses", name: "Oculos fume", category: "glasses", cost: 240, unlocked: false, tier: "premium" },
  { id: "rave-glasses", name: "Oculos rave", category: "glasses", cost: 520, unlocked: false, tier: "neon" },
  { id: "holographic-glasses", name: "Oculos holografico", category: "glasses", cost: 650, unlocked: false, tier: "premium" },
  { id: "villain-glasses", name: "Oculos vilao", category: "glasses", cost: 360, unlocked: false, tier: "dark" },
  { id: "sport-glasses", name: "Oculos esportivo", category: "glasses", cost: 280, unlocked: false, tier: "sport" },
  { id: "minimal-premium-glasses", name: "Oculos minimalista premium", category: "glasses", cost: 450, unlocked: false, tier: "premium" },
];

export const glasses = accessories;

export function getAccessoryById(id) {
  return accessories.find((item) => item.id === id || item.aliasOf === id);
}
