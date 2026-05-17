import React from "react";
import CleitinPet from "./CleitinPet";
import RobotPet from "./RobotPet";
import AlienPet from "./AlienPet";
import CatPet from "./CatPet";
import PandaPet from "./PandaPet";
import FrogPet from "./FrogPet";
import DemonPet from "./DemonPet";
import SkullPet from "./SkullPet";
import { PetFallback } from "./PetBase";

export { PetFallback };

export const petComponents = {
  cleitin: CleitinPet,
  robot: RobotPet,
  alien: AlienPet,
  cat: CatPet,
  panda: PandaPet,
  frog: FrogPet,
  demon: DemonPet,
  skull: SkullPet,
};

export function PetPreview({ petId, mood = "happy", className = "", robotColors }) {
  const Component = petComponents[petId] ?? PetFallback;
  return (
    <div className={`relative aspect-square overflow-hidden rounded-2xl bg-white/10 ${className}`}>
      <Component
        mood={mood}
        primaryColor={robotColors?.primary}
        secondaryColor={robotColors?.secondary}
        bodyColor={robotColors?.body}
        screenColor={robotColors?.screen}
        shadowColor={robotColors?.shadow}
        outlineColor={robotColors?.outline}
      />
    </div>
  );
}
