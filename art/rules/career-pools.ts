import type { CareerLevel } from "@/domain/types";
import type { DynamicSlot } from "@/art/manifest/dynamic";

export const CAREER_ART_POOLS: Record<CareerLevel, Record<DynamicSlot, readonly string[]>> = {
  REKT: {
    outfit: ["Stained Tee", "Bathrobe", "Basic Tee"], workstation: ["Floor Setup", "Cardboard Desk", "Folding Desk"],
    screens: ["Phone Only", "Cracked Laptop", "CRT"], prop: ["Cold Pizza", "Energy Drink", "Phone"],
    environment: ["Basement", "Shared Room", "Factory Break Room"],
  },
  INTERN: {
    outfit: ["Basic Tee", "Cheap Hoodie"], workstation: ["Folding Desk", "IKEA Desk"], screens: ["Cracked Laptop", "Single Monitor"],
    prop: ["Coffee", "Calculator", "Phone"], environment: ["Cheap Office", "Shared Room", "Bedroom"],
  },
  GRINDER: {
    outfit: ["Oversized Hoodie", "Track Jacket", "Cheap Hoodie"], workstation: ["Office Desk", "Gaming Desk", "IKEA Desk"],
    screens: ["Dual Monitor", "Single Monitor"], prop: ["Energy Drink", "Calculator", "Coffee"], environment: ["Bedroom", "Trading Office", "Cheap Office"],
  },
  PROFITABLE: {
    outfit: ["Office Shirt", "Tech Vest", "Oversized Hoodie"], workstation: ["Standing Desk", "Gaming Desk", "Office Desk"],
    screens: ["Triple Monitor", "Ultrawide", "Dual Monitor"], prop: ["Ledger", "Coffee", "Phone"], environment: ["Trading Office", "Neon Window", "Bedroom"],
  },
  WHALE: {
    outfit: ["Half Suit", "Luxury Coat", "Tech Vest"], workstation: ["Institutional Desk", "Standing Desk"],
    screens: ["Ultrawide", "Wall of Screens", "Triple Monitor"], prop: ["Champagne", "Phone", "Ledger"], environment: ["Penthouse", "Travel Jet", "Trading Office"],
  },
  MARKET_GOD: {
    outfit: ["Luxury Coat", "Half Suit"], workstation: ["Institutional Desk"], screens: ["Wall of Screens"],
    prop: ["Champagne", "Ledger"], environment: ["Penthouse", "Bunker", "Travel Jet"],
  },
};
