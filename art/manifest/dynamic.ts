import type { ArtLayerAsset } from "@/art/renderer/types";

export const DYNAMIC_TRAITS = {
  outfit: ["Stained Tee", "Bathrobe", "Basic Tee", "Cheap Hoodie", "Oversized Hoodie", "Track Jacket", "Office Shirt", "Tech Vest", "Half Suit", "Luxury Coat", "Torn Hoodie", "Clean Hoodie", "Pattern Hoodie"],
  workstation: ["Floor Setup", "Cardboard Desk", "Folding Desk", "IKEA Desk", "Office Desk", "Gaming Desk", "Standing Desk", "Institutional Desk", "Old Laptop Desk", "Single Monitor Desk", "Dual Monitor Setup", "Executive Trading Setup"],
  screens: ["Phone Only", "Cracked Laptop", "CRT", "Single Monitor", "Dual Monitor", "Triple Monitor", "Ultrawide", "Wall of Screens", "Red Dump Chart", "Green Uptrend Chart", "Two Mixed Charts", "Premium Chart Wall"],
  prop: ["Cold Pizza", "Energy Drink", "Phone", "Coffee", "Calculator", "Ledger", "Champagne", "Coffee Mug", "Purple Crystal", "Gold Crypto Trophy"],
  environment: ["Basement", "Shared Room", "Factory Break Room", "Cheap Office", "Bedroom", "Trading Office", "Neon Window", "Penthouse", "Travel Jet", "Bunker", "Poor Room", "Basic Trading Room", "Clean Crypto Office", "Luxury Night Office"],
} as const;

export type DynamicSlot = keyof typeof DYNAMIC_TRAITS;
export type DynamicArtState = { [Slot in DynamicSlot]: (typeof DYNAMIC_TRAITS)[Slot][number] };

export const DYNAMIC_ART_ASSETS: ArtLayerAsset[] = Object.entries(DYNAMIC_TRAITS).flatMap(
  ([slot, values]) => values.map((value) => ({
    id: `v1:${slot}:${value.toLowerCase().replaceAll(" ", "-")}`,
    slot: slot === "screens" ? "screens" : slot as ArtLayerAsset["slot"],
    sourceType: "SVG_COMPONENT" as const,
  })),
);
