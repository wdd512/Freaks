import type { ArtSlot } from "@/art/renderer/types";

export const ART_LAYER_ORDER: readonly ArtSlot[] = [
  "background", "environment", "workstation", "screens", "body", "outfit", "neck",
  "head", "hair", "eyes", "mouth", "prop", "effects", "frame",
] as const;

