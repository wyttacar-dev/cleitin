import React from "react";
import { PetBase } from "./PetBase";

export default function FrogPet({ mood = "neutral" }) {
  return <PetBase mood={mood} kind="frog" body="#22c55e" belly="#bbf7d0" accent="#15803d" />;
}
