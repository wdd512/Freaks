import type { ArtLayerAsset, ArtSlot, ImageArtLayerAsset } from "@/art/renderer/types";
import { artAssetId } from "@/art/renderer/assets";

export const PRODUCTION_CHARACTER_TEMPLATE_V1 = {
  canvas: { width: 128, height: 128 },
  anchors: {
    head: { x: 45, y: 27, width: 40, height: 50 },
    body: { x: 29, y: 76, width: 70, height: 43 },
    eyes: { x: 48, y: 43, width: 35, height: 18 },
    mouth: { x: 54, y: 62, width: 22, height: 10 },
    hair: { x: 43, y: 25, width: 43, height: 48 },
    outfit: { x: 34, y: 75, width: 61, height: 43 },
    workstation: { x: 3, y: 94, width: 122, height: 34 },
    screens: { x: 3, y: 18, width: 122, height: 82 },
    prop: { x: 92, y: 77, width: 26, height: 25 },
    environment: { x: 0, y: 0, width: 128, height: 128 },
  },
  referenceAsset: "/art/v1/template/production-character-template-v1.png",
} as const;

const image = (traitSlot: string, value: string, slot: ArtSlot, file: string): ImageArtLayerAsset => ({
  id: artAssetId(traitSlot, value), slot, sourceType: "IMAGE", assetPath: `/art/v1/${traitSlot}/${file}.png`,
  placement: { x: 0, y: 0, width: 128, height: 128 },
});

export const PRODUCTION_PACK_V1_ASSETS: ArtLayerAsset[] = [
  image("body", "Average", "body", "average"), image("body", "Lanky", "body", "lanky"), image("body", "Wide Shoulders", "body", "wide-shoulders"),
  image("head", "Round", "head", "round"), image("head", "Potato", "head", "potato"), image("head", "Long", "head", "long"),
  image("eyes", "Sleepy", "eyes", "sleepy"), image("eyes", "Lazy Eye", "eyes", "half-lidded"), image("eyes", "Laser Focus", "eyes", "focused"), image("eyes", "Dead", "eyes", "dead-inside"),
  image("mouth", "Flat", "mouth", "flat"), image("mouth", "Smirk", "mouth", "smirk"), image("mouth", "Lip Bite", "mouth", "tiny-frown"),
  image("hair", "Buzz Cut", "hair", "buzz-cut"), image("hair", "Bald", "hair", "shaved"), image("hair", "Messy Fringe", "hair", "short-messy"), image("hair", "Hoodie Up", "hair", "hood-up"),
  image("skin", "Warm Light", "head", "warm-light"), image("skin", "Bronze", "head", "bronze"), image("skin", "Olive", "head", "olive-tan"), image("skin", "Deep", "head", "deep-brown"),
  image("outfit", "Torn Hoodie", "outfit", "torn-hoodie"), image("outfit", "Clean Hoodie", "outfit", "clean-hoodie"), image("outfit", "Pattern Hoodie", "outfit", "pattern-hoodie"), image("outfit", "Luxury Coat", "outfit", "luxury-coat"),
  image("environment", "Poor Room", "environment", "poor-room"), image("environment", "Basic Trading Room", "environment", "basic-trading-room"), image("environment", "Clean Crypto Office", "environment", "clean-crypto-office"), image("environment", "Luxury Night Office", "environment", "luxury-night-office"),
  image("workstation", "Old Laptop Desk", "workstation", "old-laptop-desk"), image("workstation", "Single Monitor Desk", "workstation", "single-monitor-desk"), image("workstation", "Dual Monitor Setup", "workstation", "dual-monitor-setup"), image("workstation", "Executive Trading Setup", "workstation", "executive-trading-setup"),
  image("screens", "Red Dump Chart", "screens", "red-dump-chart"), image("screens", "Green Uptrend Chart", "screens", "green-uptrend-chart"), image("screens", "Two Mixed Charts", "screens", "two-mixed-charts"), image("screens", "Premium Chart Wall", "screens", "premium-chart-wall"),
  image("prop", "Coffee Mug", "prop", "coffee-mug"), image("prop", "Energy Drink", "prop", "energy-drink"), image("prop", "Purple Crystal", "prop", "purple-crystal"), image("prop", "Gold Crypto Trophy", "prop", "gold-crypto-trophy"),
];

export const PRODUCTION_PACK_V1_ASSET_IDS = new Set(PRODUCTION_PACK_V1_ASSETS.map((asset) => asset.id));

