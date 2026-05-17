import React from "react";
import { Glasses, GlassesPreview } from "../glasses/index.jsx";

export function AccessoryLayer({ accessories = {} }) {
  return <Glasses id={accessories.glasses} />;
}

export function AccessoryPreview({ item }) {
  return <GlassesPreview id={item.id} />;
}
