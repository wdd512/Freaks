import type { FreakDNA, Mood } from "@/domain/types";
import type { CompatibilityPresentation, DynamicArtState } from "@/art/renderer/types";

export function resolveCompatibility(dna: FreakDNA, dynamic: DynamicArtState, mood: Mood): CompatibilityPresentation {
  const headwearMode: CompatibilityPresentation["headwearMode"] = dna.hair === "Bald" ? "NONE"
    : dna.hair === "Hoodie Up" ? "HOOD"
      : dna.hair === "Trading Cap" ? "CAP"
        : dna.hair === "Headphones" ? "HEADPHONES"
          : dna.hair === "Visor" ? "VISOR"
            : dna.hair === "Beanie" || dna.hair === "Foil Hat" ? "HAT" : "HAIR";
  return {
    deskY: dynamic.workstation === "Floor Setup" ? 108 : dynamic.workstation === "Standing Desk" ? 92 : 99,
    headOffsetY: (dna.body === "Hunched" ? 4 : 0) + (mood === "MELTDOWN" ? 3 : mood === "TILTED" ? 1 : 0),
    headwearMode,
    mouthPose: mood === "MELTDOWN" ? "MELTDOWN_ACCENT" : mood === "HAPPY" || mood === "EUPHORIC" ? "SMILE_ACCENT" : mood === "FOCUSED" ? "FOCUSED_ACCENT" : "DNA",
    screenMode: dynamic.screens === "Phone Only" ? "PHONE" : dynamic.screens === "Wall of Screens" ? "WALL" : "DESKTOP",
    wallFrame: dynamic.screens === "Wall of Screens" && ["Penthouse", "Bunker", "Travel Jet", "Trading Office"].includes(dynamic.environment),
  };
}
