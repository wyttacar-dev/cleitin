import React from "react";
import { PetBase } from "./PetBase";

export default function AlienPet({ mood = "neutral" }) {
  return <PetBase mood={mood} kind="alien" body="#a3e635" belly="#ecfccb" accent="#4d7c0f" antenna />;
}
