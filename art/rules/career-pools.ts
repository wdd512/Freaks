import type { CareerLevel } from "@/domain/types";
import type { DynamicSlot } from "@/art/manifest/dynamic";

export const CAREER_ART_POOLS: Record<CareerLevel, Record<DynamicSlot, readonly string[]>> = {
  REKT: {
    outfit: ["Torn Hoodie"], workstation: ["Old Laptop Desk"], screens: ["Red Dump Chart"], prop: ["Coffee Mug"], environment: ["Poor Room"],
  },
  INTERN: {
    outfit: ["Clean Hoodie"], workstation: ["Single Monitor Desk"], screens: ["Green Uptrend Chart"], prop: ["Coffee Mug"], environment: ["Basic Trading Room"],
  },
  GRINDER: {
    outfit: ["Clean Hoodie"], workstation: ["Dual Monitor Setup"], screens: ["Two Mixed Charts"], prop: ["Energy Drink"], environment: ["Basic Trading Room", "Clean Crypto Office"],
  },
  PROFITABLE: {
    outfit: ["Pattern Hoodie"], workstation: ["Dual Monitor Setup"], screens: ["Green Uptrend Chart", "Premium Chart Wall"], prop: ["Purple Crystal"], environment: ["Clean Crypto Office"],
  },
  WHALE: {
    outfit: ["Luxury Coat"], workstation: ["Executive Trading Setup"], screens: ["Premium Chart Wall"], prop: ["Gold Crypto Trophy"], environment: ["Luxury Night Office"],
  },
  MARKET_GOD: {
    outfit: ["Market God Coat"], workstation: ["Executive Trading Setup"], screens: ["Premium Chart Wall"], prop: ["Gold Crypto Trophy"], environment: ["Luxury Night Office"],
  },
};
