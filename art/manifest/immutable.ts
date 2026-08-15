import { TRAIT_MANIFEST, type TraitSlot } from "@/domain/rarity/trait-manifest";
import type { ArtLayerAsset } from "@/art/renderer/types";

export const IMMUTABLE_TRAITS = Object.fromEntries(
  Object.entries(TRAIT_MANIFEST).map(([slot, traits]) => [slot, traits.map((trait) => trait.name)]),
) as Record<TraitSlot, string[]>;

export const IMMUTABLE_ART_ASSETS: ArtLayerAsset[] = Object.entries(IMMUTABLE_TRAITS).flatMap(
  ([slot, values]) => values.map((value) => ({
    id: `v1:${slot}:${value.toLowerCase().replaceAll(" ", "-")}`,
    slot: slot === "skin" ? "head" : slot === "hair" ? "hair" : slot as ArtLayerAsset["slot"],
    sourceType: "SVG_COMPONENT" as const,
  })),
);

export const BODY_GEOMETRY = {
  Average: { x: 42, y: 78, width: 44, height: 36, neckY: 69, neckHeight: 12, armDrop: 8 },
  Lanky: { x: 50, y: 76, width: 28, height: 39, neckY: 66, neckHeight: 13, armDrop: 13 },
  Compact: { x: 38, y: 84, width: 52, height: 29, neckY: 72, neckHeight: 14, armDrop: 6 },
  Heavy: { x: 33, y: 78, width: 62, height: 38, neckY: 69, neckHeight: 12, armDrop: 8 },
  Hunched: { x: 36, y: 82, width: 57, height: 33, neckY: 72, neckHeight: 13, armDrop: 7 },
  "Long Arms": { x: 42, y: 78, width: 44, height: 34, neckY: 69, neckHeight: 12, armDrop: 17 },
  "Tiny Torso": { x: 50, y: 87, width: 29, height: 25, neckY: 72, neckHeight: 17, armDrop: 7 },
  "Wide Shoulders": { x: 29, y: 80, width: 70, height: 35, neckY: 69, neckHeight: 13, armDrop: 8 },
} as const;

export type BodyName = keyof typeof BODY_GEOMETRY;

export const HEAD_POINTS: Record<string, readonly [number, number][]> = {
  Round: [[49, 42], [55, 36], [73, 36], [80, 43], [81, 61], [74, 72], [55, 72], [47, 61]],
  Square: [[48, 38], [79, 38], [82, 70], [47, 70]],
  Long: [[53, 31], [75, 31], [79, 68], [72, 76], [55, 76], [49, 68]],
  Potato: [[51, 35], [75, 38], [82, 51], [77, 70], [59, 74], [47, 65], [45, 48]],
  "Big Brain": [[45, 37], [50, 27], [78, 27], [84, 38], [80, 64], [72, 72], [55, 72], [48, 63]],
  "Tiny Chin": [[47, 37], [81, 37], [80, 58], [70, 72], [63, 76], [56, 70], [48, 58]],
  "Wide Jaw": [[52, 36], [77, 37], [80, 51], [86, 68], [76, 75], [51, 74], [43, 66], [48, 51]],
  Crooked: [[54, 33], [78, 38], [80, 62], [70, 74], [48, 68], [45, 45]],
  "Flat Skull": [[46, 35], [82, 35], [81, 62], [75, 72], [52, 72], [46, 61]],
  Melted: [[50, 35], [77, 37], [82, 55], [78, 70], [71, 68], [67, 77], [60, 70], [53, 75], [47, 61]],
};

