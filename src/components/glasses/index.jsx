import React from "react";
import JulietSilver from "./JulietSilver";
import JulietBlack from "./JulietBlack";
import JulietGold from "./JulietGold";
import JulietBlue from "./JulietBlue";
import JulietRed from "./JulietRed";
import PixelGlasses from "./PixelGlasses";
import CyberpunkGlasses from "./CyberpunkGlasses";
import FutureNeonGlasses from "./FutureNeonGlasses";
import HeartGlasses from "./HeartGlasses";
import ExecutiveGlasses from "./ExecutiveGlasses";
import GamerRgbGlasses from "./GamerRgbGlasses";
import MatrixGlasses from "./MatrixGlasses";
import RetroGlasses from "./RetroGlasses";
import ClearGlasses from "./ClearGlasses";
import SmokeGlasses from "./SmokeGlasses";
import RaveGlasses from "./RaveGlasses";
import HolographicGlasses from "./HolographicGlasses";
import VillainGlasses from "./VillainGlasses";
import SportGlasses from "./SportGlasses";
import MinimalPremiumGlasses from "./MinimalPremiumGlasses";

export const glassesComponents = {
  "juliet-silver": JulietSilver,
  juliet: JulietSilver,
  "juliet-black": JulietBlack,
  "juliet-gold": JulietGold,
  "juliet-blue": JulietBlue,
  "juliet-red": JulietRed,
  "pixel-glasses": PixelGlasses,
  "cyberpunk-glasses": CyberpunkGlasses,
  "future-neon-glasses": FutureNeonGlasses,
  "heart-glasses": HeartGlasses,
  "executive-glasses": ExecutiveGlasses,
  "gamer-rgb-glasses": GamerRgbGlasses,
  "matrix-glasses": MatrixGlasses,
  "retro-glasses": RetroGlasses,
  "clear-glasses": ClearGlasses,
  "smoke-glasses": SmokeGlasses,
  "rave-glasses": RaveGlasses,
  "holographic-glasses": HolographicGlasses,
  "villain-glasses": VillainGlasses,
  "sport-glasses": SportGlasses,
  "minimal-premium-glasses": MinimalPremiumGlasses,
};

export function Glasses({ id }) {
  if (!id) return null;
  const Component = glassesComponents[id] || glassesComponents["juliet-silver"];
  return (
    <div className="glasses-layer">
      <Component />
    </div>
  );
}

export function GlassesPreview({ id, className = "" }) {
  const Component = glassesComponents[id] || glassesComponents["juliet-silver"];
  return (
    <div className={`glasses-preview ${className}`}>
      <Component />
    </div>
  );
}
