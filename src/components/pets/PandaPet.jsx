import React from "react";
import { PetBase } from "./PetBase";

export default function PandaPet({ mood = "neutral" }) {
  return <PetBase mood={mood} kind="panda" body="#f8fafc" belly="#dcfce7" accent="#111827" ears />;
}
