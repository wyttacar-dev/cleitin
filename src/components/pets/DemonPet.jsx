import React from "react";
import { PetBase } from "./PetBase";

export default function DemonPet({ mood = "neutral" }) {
  return <PetBase mood={mood} kind="demon" body="#fb7185" belly="#ffe4e6" accent="#be123c" horns />;
}
