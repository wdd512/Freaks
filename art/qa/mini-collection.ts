import type { GeneratedFreak } from "@/domain/rarity/generator";
import { CAREER_LEVELS, type CareerLevel, type FreakDNA, type Personality, type RarityTier } from "@/domain/types";
import { buildRenderSpec } from "@/art/renderer/build-render-spec";
import { buildRenderSignature } from "@/art/renderer/render-signature";
import { dnaSeed, stableHash } from "@/art/renderer/deterministic";
import type { DynamicArtState, FreakRenderSpec } from "@/art/renderer/types";

export const MINI_COLLECTION_V1_SEED = "pnl-freaks-art-v1";
export const MINI_COLLECTION_V1_COUNT = 50;

export type MiniCollectionTraitSlot = keyof FreakDNA | keyof DynamicArtState;

export type MiniCollectionEntry = {
  tokenId: number;
  name: string;
  dna: FreakDNA;
  rarityTier: RarityTier;
  personality: Personality;
  careerLevel: CareerLevel;
  dynamic: DynamicArtState;
  renderSignature: string;
  visualHash: string;
  imageAssetPaths: string[];
  svgFallbackIds: string[];
};

export type MiniCollectionQaReport = {
  seed: string;
  generatedCount: number;
  traitFrequencies: Record<string, Record<string, number>>;
  duplicateRenderSignatureCount: number;
  duplicateRenderSignatures: { renderSignature: string; tokenIds: number[] }[];
  nearDuplicateWarnings: { tokenIds: [number, number]; differingDynamicSlots: string[] }[];
  missingImageLayers: string[];
  imageAssetReferenceCount: number;
  svgFallbackInstanceCount: number;
  svgFallbackUsage: { assetId: string; count: number; tokenIds: number[] }[];
};

export function miniCollectionCareer(tokenId: number): CareerLevel {
  return CAREER_LEVELS[(tokenId - 1) % CAREER_LEVELS.length];
}

function visualHash(signature: string): string {
  return stableHash(signature).toString(16).padStart(8, "0");
}

export function createMiniCollectionEntry(freak: GeneratedFreak): MiniCollectionEntry {
  const careerLevel = miniCollectionCareer(freak.tokenId);
  const spec = buildRenderSpec({ tokenId: freak.tokenId, dna: freak.dna, careerLevel, mood: "NEUTRAL", active: false });
  const renderSignature = buildRenderSignature(spec);
  return {
    tokenId: freak.tokenId,
    name: freak.name,
    dna: freak.dna,
    rarityTier: freak.rarityTier,
    personality: freak.personality,
    careerLevel,
    dynamic: spec.dynamic,
    renderSignature,
    visualHash: visualHash(renderSignature),
    imageAssetPaths: spec.assets.filter((asset) => asset.sourceType === "IMAGE").map((asset) => asset.assetPath),
    svgFallbackIds: spec.assets.filter((asset) => asset.sourceType === "SVG_COMPONENT").map((asset) => asset.id),
  };
}

export function createMiniCollection(freaks: readonly GeneratedFreak[]): MiniCollectionEntry[] {
  return freaks.map(createMiniCollectionEntry);
}

export function buildMiniCollectionSpec(entry: MiniCollectionEntry): FreakRenderSpec {
  return buildRenderSpec({ tokenId: entry.tokenId, dna: entry.dna, careerLevel: entry.careerLevel, mood: "NEUTRAL", active: false });
}

export function miniCollectionTraitValue(entry: MiniCollectionEntry, slot: MiniCollectionTraitSlot): string {
  if (slot in entry.dna) return entry.dna[slot as keyof FreakDNA];
  return entry.dynamic[slot as keyof DynamicArtState];
}

function buildTraitFrequencies(entries: readonly MiniCollectionEntry[]): Record<string, Record<string, number>> {
  const frequencies: Record<string, Record<string, number>> = {};
  for (const entry of entries) {
    for (const [slot, value] of [...Object.entries(entry.dna), ...Object.entries(entry.dynamic)]) {
      frequencies[slot] ??= {};
      frequencies[slot][value] = (frequencies[slot][value] ?? 0) + 1;
    }
  }
  return frequencies;
}

export function buildMiniCollectionQaReport(entries: readonly MiniCollectionEntry[], missingImageLayers: readonly string[] = []): MiniCollectionQaReport {
  const bySignature = new Map<string, number[]>();
  const fallbackUsage = new Map<string, number[]>();
  let imageAssetReferenceCount = 0;
  for (const entry of entries) {
    bySignature.set(entry.renderSignature, [...(bySignature.get(entry.renderSignature) ?? []), entry.tokenId]);
    imageAssetReferenceCount += entry.imageAssetPaths.length;
    for (const assetId of entry.svgFallbackIds) fallbackUsage.set(assetId, [...(fallbackUsage.get(assetId) ?? []), entry.tokenId]);
  }
  const duplicateRenderSignatures = [...bySignature.entries()]
    .filter(([, tokenIds]) => tokenIds.length > 1)
    .map(([renderSignature, tokenIds]) => ({ renderSignature, tokenIds }));

  const nearDuplicateWarnings: MiniCollectionQaReport["nearDuplicateWarnings"] = [];
  const byDna = new Map<string, MiniCollectionEntry[]>();
  for (const entry of entries) byDna.set(dnaSeed(entry.dna), [...(byDna.get(dnaSeed(entry.dna)) ?? []), entry]);
  for (const group of byDna.values()) {
    for (let left = 0; left < group.length; left += 1) {
      for (let right = left + 1; right < group.length; right += 1) {
        const differingDynamicSlots = Object.keys(group[left].dynamic).filter((slot) =>
          group[left].dynamic[slot as keyof DynamicArtState] !== group[right].dynamic[slot as keyof DynamicArtState]);
        if (differingDynamicSlots.length <= 1) nearDuplicateWarnings.push({ tokenIds: [group[left].tokenId, group[right].tokenId], differingDynamicSlots });
      }
    }
  }

  const svgFallbackUsage = [...fallbackUsage.entries()]
    .map(([assetId, tokenIds]) => ({ assetId, count: tokenIds.length, tokenIds }))
    .sort((left, right) => right.count - left.count || left.assetId.localeCompare(right.assetId));
  return {
    seed: MINI_COLLECTION_V1_SEED,
    generatedCount: entries.length,
    traitFrequencies: buildTraitFrequencies(entries),
    duplicateRenderSignatureCount: duplicateRenderSignatures.reduce((total, duplicate) => total + duplicate.tokenIds.length - 1, 0),
    duplicateRenderSignatures,
    nearDuplicateWarnings,
    missingImageLayers: [...new Set(missingImageLayers)].sort(),
    imageAssetReferenceCount,
    svgFallbackInstanceCount: svgFallbackUsage.reduce((total, fallback) => total + fallback.count, 0),
    svgFallbackUsage,
  };
}

