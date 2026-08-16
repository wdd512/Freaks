import type { GeneratedFreak } from "@/domain/rarity/generator";
import { CAREER_LEVELS, type CareerLevel, type FreakDNA, type Personality, type RarityTier } from "@/domain/types";
import { buildRenderSpec } from "@/art/renderer/build-render-spec";
import { buildRenderSignature } from "@/art/renderer/render-signature";
import { buildVisualFingerprint, buildVisualFingerprintHash } from "@/art/renderer/visual-fingerprint";
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
  visualFingerprint: string;
  visualFingerprintHash: string;
  imageAssetPaths: string[];
  svgFallbackIds: string[];
};

export type MiniCollectionQaReport = {
  seed: string;
  generatedCount: number;
  traitFrequencies: Record<string, Record<string, number>>;
  duplicateVisualFingerprintCount: number;
  duplicateVisualFingerprints: { visualFingerprint: string; tokenIds: number[] }[];
  nearDuplicateWarnings: { tokenIds: [number, number]; differingTraitSlots: MiniCollectionTraitSlot[] }[];
  similarityWarnings: { tokenIds: [number, number]; differingTraitSlots: MiniCollectionTraitSlot[] }[];
  missingImageLayers: string[];
  imageAssetReferenceCount: number;
  svgFallbackInstanceCount: number;
  svgFallbackUsage: { assetId: string; count: number; tokenIds: number[] }[];
};

export function miniCollectionCareer(tokenId: number): CareerLevel {
  return CAREER_LEVELS[(tokenId - 1) % CAREER_LEVELS.length];
}

export function createMiniCollectionEntry(freak: GeneratedFreak): MiniCollectionEntry {
  const careerLevel = miniCollectionCareer(freak.tokenId);
  const spec = buildRenderSpec({ tokenId: freak.tokenId, dna: freak.dna, careerLevel, mood: "NEUTRAL", active: false });
  const renderSignature = buildRenderSignature(spec);
  const visualFingerprint = buildVisualFingerprint(spec);
  return {
    tokenId: freak.tokenId,
    name: freak.name,
    dna: freak.dna,
    rarityTier: freak.rarityTier,
    personality: freak.personality,
    careerLevel,
    dynamic: spec.dynamic,
    renderSignature,
    visualFingerprint,
    visualFingerprintHash: buildVisualFingerprintHash(visualFingerprint),
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

const VISUAL_TRAIT_SLOTS: MiniCollectionTraitSlot[] = ["body", "skin", "head", "eyes", "mouth", "hair", "outfit", "workstation", "screens", "prop", "environment"];

function differingVisualTraitSlots(left: MiniCollectionEntry, right: MiniCollectionEntry): MiniCollectionTraitSlot[] {
  return VISUAL_TRAIT_SLOTS.filter((slot) => miniCollectionTraitValue(left, slot) !== miniCollectionTraitValue(right, slot));
}

export function buildMiniCollectionQaReport(entries: readonly MiniCollectionEntry[], missingImageLayers: readonly string[] = [], seed = MINI_COLLECTION_V1_SEED): MiniCollectionQaReport {
  const byFingerprint = new Map<string, number[]>();
  const fallbackUsage = new Map<string, number[]>();
  let imageAssetReferenceCount = 0;
  for (const entry of entries) {
    byFingerprint.set(entry.visualFingerprint, [...(byFingerprint.get(entry.visualFingerprint) ?? []), entry.tokenId]);
    imageAssetReferenceCount += entry.imageAssetPaths.length;
    for (const assetId of entry.svgFallbackIds) fallbackUsage.set(assetId, [...(fallbackUsage.get(assetId) ?? []), entry.tokenId]);
  }
  const duplicateVisualFingerprints = [...byFingerprint.entries()]
    .filter(([, tokenIds]) => tokenIds.length > 1)
    .map(([visualFingerprint, tokenIds]) => ({ visualFingerprint, tokenIds }));

  const nearDuplicateWarnings: MiniCollectionQaReport["nearDuplicateWarnings"] = [];
  const similarityWarnings: MiniCollectionQaReport["similarityWarnings"] = [];
  for (let left = 0; left < entries.length; left += 1) {
    for (let right = left + 1; right < entries.length; right += 1) {
      const differingTraitSlots = differingVisualTraitSlots(entries[left], entries[right]);
      if (differingTraitSlots.length === 1) nearDuplicateWarnings.push({ tokenIds: [entries[left].tokenId, entries[right].tokenId], differingTraitSlots });
      else if (differingTraitSlots.length === 2) similarityWarnings.push({ tokenIds: [entries[left].tokenId, entries[right].tokenId], differingTraitSlots });
    }
  }

  const svgFallbackUsage = [...fallbackUsage.entries()]
    .map(([assetId, tokenIds]) => ({ assetId, count: tokenIds.length, tokenIds }))
    .sort((left, right) => right.count - left.count || left.assetId.localeCompare(right.assetId));
  return {
    seed,
    generatedCount: entries.length,
    traitFrequencies: buildTraitFrequencies(entries),
    duplicateVisualFingerprintCount: duplicateVisualFingerprints.reduce((total, duplicate) => total + duplicate.tokenIds.length - 1, 0),
    duplicateVisualFingerprints,
    nearDuplicateWarnings,
    similarityWarnings,
    missingImageLayers: [...new Set(missingImageLayers)].sort(),
    imageAssetReferenceCount,
    svgFallbackInstanceCount: svgFallbackUsage.reduce((total, fallback) => total + fallback.count, 0),
    svgFallbackUsage,
  };
}
