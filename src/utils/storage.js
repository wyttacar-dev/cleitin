export const defaultCustomization = {
  selectedPet: "robot",
  selectedTheme: "dark-neon",
  equippedAccessories: {
    glasses: null,
  },
  unlockedPets: ["cleitin", "robot"],
  unlockedAccessories: ["juliet-silver", "juliet"],
  unlockedThemes: ["dark-neon"],
  visualEffects: {
    bounceOnComplete: true,
    glow: true,
  },
  robotColors: {
    primary: "#7c5cff",
    secondary: "#5eead4",
    body: "#f8f4e8",
    screen: "#3b2477",
    shadow: "#241b3f",
    outline: "#d8d0bd",
  },
};

export function mergeCustomization(saved) {
  const equippedAccessories = {
    glasses: saved?.equippedAccessories?.glasses === "juliet" ? "juliet-silver" : saved?.equippedAccessories?.glasses ?? defaultCustomization.equippedAccessories.glasses,
  };

  return {
    ...defaultCustomization,
    ...(saved || {}),
    selectedPet: saved?.robotColors ? (saved?.selectedPet || defaultCustomization.selectedPet) : defaultCustomization.selectedPet,
    equippedAccessories,
    visualEffects: {
      ...defaultCustomization.visualEffects,
      ...(saved?.visualEffects || {}),
    },
    robotColors: {
      ...defaultCustomization.robotColors,
      ...(saved?.robotColors || {}),
    },
    unlockedPets: Array.from(new Set([...(saved?.unlockedPets || defaultCustomization.unlockedPets), "robot"])),
    unlockedAccessories: Array.from(new Set([...(saved?.unlockedAccessories || defaultCustomization.unlockedAccessories), "juliet-silver", "juliet"])),
    unlockedThemes: saved?.unlockedThemes || defaultCustomization.unlockedThemes,
  };
}
