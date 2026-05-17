import React from "react";
import { PetBase } from "./PetBase";

export default function CatPet({ mood = "neutral" }) {
  return <PetBase mood={mood} kind="cat" body="#f472b6" belly="#fce7f3" accent="#be185d" ears />;
}
