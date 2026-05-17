import React from "react";
import { PetBase } from "./PetBase";

export default function SkullPet({ mood = "neutral" }) {
  return <PetBase mood={mood} kind="skull" body="#e5e7eb" belly="#f8fafc" accent="#64748b" skull />;
}
