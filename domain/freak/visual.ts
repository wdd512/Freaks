import type { CareerLevel, FreakDNA, Mood, VisualState } from "@/domain/types";

const VISUALS: Record<CareerLevel, Omit<VisualState, "effects">[]> = {
  REKT: [
    { outfit: "Stained Tee", workstation: "Floor Setup", screens: "Phone Only", prop: "Cold Pizza", environment: "Basement" },
    { outfit: "Bathrobe", workstation: "Cardboard Desk", screens: "Cracked Laptop", prop: "Energy Drink", environment: "Shared Room" },
  ],
  INTERN: [
    { outfit: "Basic Tee", workstation: "Folding Desk", screens: "Single Monitor", prop: "Coffee", environment: "Cheap Office" },
    { outfit: "Cheap Hoodie", workstation: "IKEA Desk", screens: "Cracked Laptop", prop: "Calculator", environment: "Shared Room" },
  ],
  GRINDER: [
    { outfit: "Oversized Hoodie", workstation: "Gaming Desk", screens: "Dual Monitor", prop: "Energy Drink", environment: "Bedroom" },
    { outfit: "Track Jacket", workstation: "Office Desk", screens: "Dual Monitor", prop: "Calculator", environment: "Trading Office" },
  ],
  PROFITABLE: [
    { outfit: "Office Shirt", workstation: "Standing Desk", screens: "Triple Monitor", prop: "Ledger", environment: "Trading Office" },
    { outfit: "Tech Vest", workstation: "Office Desk", screens: "Ultrawide", prop: "Coffee", environment: "Neon Window" },
  ],
  WHALE: [
    { outfit: "Half Suit", workstation: "Institutional Desk", screens: "Wall of Screens", prop: "Champagne", environment: "Penthouse" },
    { outfit: "Luxury Coat", workstation: "Standing Desk", screens: "Ultrawide", prop: "Phone", environment: "Travel Jet" },
  ],
  MARKET_GOD: [
    { outfit: "Luxury Coat", workstation: "Institutional Desk", screens: "Wall of Screens", prop: "Champagne", environment: "Penthouse" },
    { outfit: "Half Suit", workstation: "Institutional Desk", screens: "Wall of Screens", prop: "Ledger", environment: "Bunker" },
  ],
};

function dnaIndex(dna: FreakDNA): number {
  return [...`${dna.body}${dna.head}${dna.eyes}${dna.hair}`].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);
}

export function resolveVisualState(dna: FreakDNA, careerLevel: CareerLevel, mood: Mood, recentAchievements: string[] = []): VisualState {
  const choices = VISUALS[careerLevel];
  const base = choices[dnaIndex(dna) % choices.length];
  const effects: string[] = [];
  if (careerLevel === "MARKET_GOD") effects.push("GOLD_AURA");
  if (mood === "EUPHORIC") effects.push("GREEN_GLOW");
  if (mood === "MELTDOWN") effects.push("RED_STATIC");
  if (recentAchievements.length > 0) effects.push("ACHIEVEMENT_SPARK");
  return { ...base, effects };
}
