import { describe, expect, test } from "vitest";
import { generateCollection } from "@/domain/rarity/generator";
import { CAREER_LEVELS } from "@/domain/types";
import { dnaSeed } from "@/art/renderer/deterministic";
import {
  buildMiniCollectionQaReport,
  createMiniCollection,
  MINI_COLLECTION_V1_COUNT,
  MINI_COLLECTION_V1_SEED,
  miniCollectionCareer,
  type MiniCollectionEntry,
} from "@/art/qa/mini-collection";
import { findMissingMiniCollectionImageLayers } from "@/art/qa/mini-collection-files";
import { generateProductionOnlySample, PRODUCTION_ONLY_V1_SEED } from "@/art/qa/production-only-sample";

const genesisEntries = createMiniCollection(generateCollection(MINI_COLLECTION_V1_COUNT, MINI_COLLECTION_V1_SEED).freaks);
const productionFreaks = generateProductionOnlySample(MINI_COLLECTION_V1_COUNT, PRODUCTION_ONLY_V1_SEED);
const productionEntries = createMiniCollection(productionFreaks);

describe("Mini Collection V1 QA", () => {
  test("keeps the normal deterministic Genesis mini collection", () => {
    const again = createMiniCollection(generateCollection(MINI_COLLECTION_V1_COUNT, MINI_COLLECTION_V1_SEED).freaks);
    expect(genesisEntries).toHaveLength(50);
    expect(again).toEqual(genesisEntries);
    expect(generateCollection(50, MINI_COLLECTION_V1_SEED).report.collectionHash).toBe("e492e5ca1c39eb98");
    expect(genesisEntries.every((entry) => entry.careerLevel === miniCollectionCareer(entry.tokenId))).toBe(true);
    for (const career of CAREER_LEVELS) expect(genesisEntries.filter((entry) => entry.careerLevel === career).length).toBeGreaterThanOrEqual(8);
  });

  test("builds exactly 50 deterministic production-only Freaks with unique immutable DNA", () => {
    expect(productionFreaks).toHaveLength(50);
    expect(generateProductionOnlySample(50, PRODUCTION_ONLY_V1_SEED)).toEqual(productionFreaks);
    expect(new Set(productionFreaks.map((freak) => dnaSeed(freak.dna))).size).toBe(50);
  });

  test("production-only Freaks resolve all 11 trait layers through IMAGE assets", () => {
    expect(productionEntries).toHaveLength(50);
    expect(productionEntries.every((entry) => entry.imageAssetPaths.length === 11)).toBe(true);
    expect(productionEntries.every((entry) => entry.svgFallbackIds.length === 0)).toBe(true);
  });

  test("production-only IMAGE files exist and QA reports zero fallback instances", async () => {
    const missing = await findMissingMiniCollectionImageLayers(productionEntries);
    const report = buildMiniCollectionQaReport(productionEntries, missing, PRODUCTION_ONLY_V1_SEED);
    expect(missing).toEqual([]);
    expect(report.generatedCount).toBe(50);
    expect(report.missingImageLayers).toEqual([]);
    expect(report.imageAssetReferenceCount).toBe(550);
    expect(report.svgFallbackInstanceCount).toBe(0);
    expect(report.duplicateVisualFingerprintCount).toBe(0);
    for (const frequencies of Object.values(report.traitFrequencies)) {
      expect(Object.values(frequencies).reduce((total, count) => total + count, 0)).toBe(50);
    }
  });

  test("groups exact duplicates by visual fingerprint rather than token signature", () => {
    const duplicate = { ...productionEntries[0], tokenId: 9999, renderSignature: `${productionEntries[0].renderSignature}-different-token-signature` };
    const report = buildMiniCollectionQaReport([productionEntries[0], duplicate]);
    expect(report.duplicateVisualFingerprintCount).toBe(1);
    expect(report.duplicateVisualFingerprints[0].tokenIds).toEqual([productionEntries[0].tokenId, 9999]);
  });

  test("reports one-trait near duplicates and two-trait similarity warnings across different DNA", () => {
    const base = productionEntries[0];
    const otherBody = base.dna.body === "Average" ? "Lanky" : "Average";
    const otherSkin = base.dna.skin === "Bronze" ? "Olive" : "Bronze";
    const oneTrait: MiniCollectionEntry = { ...base, tokenId: 9001, dna: { ...base.dna, body: otherBody }, visualFingerprint: "one-trait", visualFingerprintHash: "00000001" };
    const twoTraits: MiniCollectionEntry = { ...base, tokenId: 9002, dna: { ...base.dna, body: otherBody, skin: otherSkin }, visualFingerprint: "two-traits", visualFingerprintHash: "00000002" };
    const report = buildMiniCollectionQaReport([base, oneTrait, twoTraits]);
    expect(report.nearDuplicateWarnings).toContainEqual({ tokenIds: [base.tokenId, 9001], differingTraitSlots: ["body"] });
    expect(report.similarityWarnings).toContainEqual({ tokenIds: [base.tokenId, 9002], differingTraitSlots: ["body", "skin"] });
  });
});

