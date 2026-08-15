import type { ArtLayerAsset, DynamicArtState } from "@/art/renderer/types";

export const DYNAMIC_TRAITS = {
  outfit: ["Stained Tee", "Bathrobe", "Basic Tee", "Cheap Hoodie", "Oversized Hoodie", "Track Jacket", "Office Shirt", "Tech Vest", "Half Suit", "Luxury Coat"],
  workstation: ["Floor Setup", "Cardboard Desk", "Folding Desk", "IKEA Desk", "Office Desk", "Gaming Desk", "Standing Desk", "Institutional Desk"],
  screens: ["Phone Only", "Cracked Laptop", "CRT", "Single Monitor", "Dual Monitor", "Triple Monitor", "Ultrawide", "Wall of Screens"],
  prop: ["Cold Pizza", "Energy Drink", "Phone", "Coffee", "Calculator", "Ledger", "Champagne"],
  environment: ["Basement", "Shared Room", "Factory Break Room", "Cheap Office", "Bedroom", "Trading Office", "Neon Window", "Penthouse", "Travel Jet", "Bunker"],
} as const;

export type DynamicSlot = keyof DynamicArtState;

export const DYNAMIC_ART_ASSETS: ArtLayerAsset[] = Object.entries(DYNAMIC_TRAITS).flatMap(
  ([slot, values]) => values.map((value) => ({
    id: `v1:${slot}:${value.toLowerCase().replaceAll(" ", "-")}`,
    slot: slot === "screens" ? "screens" : slot as ArtLayerAsset["slot"],
    sourceType: "SVG_COMPONENT" as const,
  })),
);
