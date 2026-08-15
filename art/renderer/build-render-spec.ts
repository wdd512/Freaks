import type { CareerLevel, FreakDNA, Mood } from "@/domain/types";
import { ART_VERSION } from "@/art/version";
import { CAREER_ART_POOLS } from "@/art/rules/career-pools";
import { resolveCompatibility } from "@/art/rules/compatibility";
import { buildPalette, DYNAMIC_ART_ASSETS, IMMUTABLE_ART_ASSETS } from "@/art/manifest";
import { toImmutableArtIdentity } from "@/art/manifest/immutable";
import type { DynamicArtState, DynamicSlot } from "@/art/manifest/dynamic";
import type { ArtLayerAsset, FreakRenderSpec } from "@/art/renderer/types";
import { deterministicIndex, dnaSeed } from "@/art/renderer/deterministic";
import { artAssetId, validateArtLayerAsset } from "@/art/renderer/assets";

const DYNAMIC_SLOTS: readonly DynamicSlot[] = ["outfit", "workstation", "screens", "prop", "environment"];

export function selectDynamicSlot(tokenId: number, dna: FreakDNA, careerLevel: CareerLevel, slot: DynamicSlot): string {
  const pool = CAREER_ART_POOLS[careerLevel][slot];
  const seed = `${ART_VERSION}|${tokenId}|${dnaSeed(dna)}|${careerLevel}|${slot}`;
  return pool[deterministicIndex(seed, pool.length)];
}

export function buildDynamicState(tokenId: number, dna: FreakDNA, careerLevel: CareerLevel): DynamicArtState {
  return Object.fromEntries(DYNAMIC_SLOTS.map((slot) => [slot, selectDynamicSlot(tokenId, dna, careerLevel, slot)])) as DynamicArtState;
}

function findAsset(slot: string, value: string, assets: ArtLayerAsset[]): ArtLayerAsset {
  const found = assets.find((asset) => asset.id === artAssetId(slot, value));
  if (!found) throw new Error(`Missing V1 art descriptor for ${slot}:${value}`);
  return validateArtLayerAsset(found);
}

export function buildRenderSpec(input: {
  tokenId: number;
  dna: FreakDNA;
  careerLevel: CareerLevel;
  mood: Mood;
  active?: boolean;
  recentAchievements?: readonly string[];
}): FreakRenderSpec {
  const immutable = toImmutableArtIdentity(input.dna);
  const dynamic = buildDynamicState(input.tokenId, immutable, input.careerLevel);
  const effects: string[] = [];
  if (input.careerLevel === "MARKET_GOD") effects.push("GOLD_AURA");
  if (input.mood === "EUPHORIC") effects.push("GREEN_GLOW", "CELEBRATION_PIXELS");
  if (input.mood === "HAPPY") effects.push("POSITIVE_TICK");
  if (input.mood === "TILTED") effects.push("RED_ACCENT", "COFFEE_SPILL");
  if (input.mood === "MELTDOWN") effects.push("RED_STATIC", "SMOKE_PIXEL", "SCREEN_WARNING");
  if (input.active) effects.push("LIVE");
  if ((input.recentAchievements?.length ?? 0) > 0) effects.push("ACHIEVEMENT_SPARK");
  const immutableAssets = (Object.entries(immutable) as [keyof FreakDNA, string][]).map(([slot, value]) => findAsset(slot, value, IMMUTABLE_ART_ASSETS));
  const dynamicAssets = DYNAMIC_SLOTS.map((slot) => findAsset(slot, dynamic[slot], DYNAMIC_ART_ASSETS));
  return {
    version: ART_VERSION,
    tokenId: input.tokenId,
    immutable,
    dynamic,
    state: { careerLevel: input.careerLevel, mood: input.mood, active: input.active ?? false },
    effects,
    palette: buildPalette(immutable, input.tokenId),
    assets: [...immutableAssets, ...dynamicAssets],
    presentation: resolveCompatibility(immutable, dynamic, input.mood),
  };
}
