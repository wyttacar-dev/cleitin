import React from "react";
import { PetBase } from "./PetBase";

export default function CleitinPet({ mood = "neutral" }) {
  return <PetBase mood={mood} kind="cleitin" body="#5eead4" belly="#ccfbf1" accent="#0f766e" crownMark />;
}
