import type { FreakDNA, Mood } from "@/domain/types";
import type { CompatibilityPresentation, DynamicArtState } from "@/art/renderer/types";
import type { HeadTrait } from "@/art/manifest/immutable";

export function resolveHeadwearFit(mode: CompatibilityPresentation["headwearMode"], head: HeadTrait): { x: number; y: number } {
  switch (mode) {
    case "NONE": case "HAIR": return { x: 0, y: 0 };
    case "HOOD": return { x: head === "Crooked" ? 1 : head === "Big Brain" ? -2 : 0, y: head === "Big Brain" || head === "Long" ? -2 : 0 };
    case "CAP": return { x: head === "Crooked" ? 1 : 0, y: head === "Long" ? -3 : 0 };
    case "HEADPHONES": return { x: head === "Wide Jaw" ? -1 : 0, y: head === "Wide Jaw" ? 1 : 0 };
    case "VISOR": return { x: head === "Crooked" ? 2 : 0, y: head === "Crooked" ? 1 : 0 };
    case "HAT": return { x: 0, y: head === "Big Brain" ? -3 : head === "Flat Skull" ? 1 : 0 };
  }
}

export function resolveCompatibility(dna: FreakDNA, dynamic: DynamicArtState, mood: Mood): CompatibilityPresentation {
  const headwearMode: CompatibilityPresentation["headwearMode"] = dna.hair === "Bald" ? "NONE"
    : dna.hair === "Hoodie Up" ? "HOOD"
      : dna.hair === "Trading Cap" ? "CAP"
        : dna.hair === "Headphones" ? "HEADPHONES"
          : dna.hair === "Visor" ? "VISOR"
            : dna.hair === "Beanie" || dna.hair === "Foil Hat" ? "HAT" : "HAIR";
  return {
    deskY: dynamic.workstation === "Floor Setup" ? 108 : dynamic.workstation === "Old Laptop Desk" ? 103 : dynamic.workstation === "Standing Desk" || dynamic.workstation === "Executive Trading Setup" ? 94 : 99,
    headOffsetY: (dna.body === "Hunched" ? 4 : 0) + (mood === "MELTDOWN" ? 3 : mood === "TILTED" ? 1 : 0),
    headwearMode,
    mouthPose: mood === "MELTDOWN" ? "MELTDOWN_ACCENT" : mood === "HAPPY" || mood === "EUPHORIC" ? "SMILE_ACCENT" : mood === "FOCUSED" ? "FOCUSED_ACCENT" : "DNA",
    screenMode: dynamic.screens === "Phone Only" ? "PHONE" : dynamic.screens === "Wall of Screens" || dynamic.screens === "Premium Chart Wall" ? "WALL" : "DESKTOP",
    wallFrame: (dynamic.screens === "Wall of Screens" && ["Penthouse", "Bunker", "Travel Jet", "Trading Office"].includes(dynamic.environment)) || (dynamic.screens === "Premium Chart Wall" && dynamic.environment === "Luxury Night Office"),
  };
}
