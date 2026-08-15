import { describe, expect, test } from "vitest";
import { generateCollection } from "@/domain/rarity/generator";
import { CAREER_LEVELS } from "@/domain/types";
import {
  buildMiniCollectionQaReport,
  createMiniCollection,
  MINI_COLLECTION_V1_COUNT,
  MINI_COLLECTION_V1_SEED,
  miniCollectionCareer,
} from "@/art/qa/mini-collection";
import { findMissingMiniCollectionImageLayers } from "@/art/qa/mini-collection-files";

const entries = createMiniCollection(generateCollection(MINI_COLLECTION_V1_COUNT, MINI_COLLECTION_V1_SEED).freaks);

describe("Mini Collection V1 QA", () => {
  test("builds the same 50 balanced career previews deterministically", () => {
    const again = createMiniCollection(generateCollection(MINI_COLLECTION_V1_COUNT, MINI_COLLECTION_V1_SEED).freaks);
    expect(entries).toHaveLength(50);
    expect(again).toEqual(entries);
    expect(entries.every((entry) => entry.careerLevel === miniCollectionCareer(entry.tokenId))).toBe(true);
    for (const career of CAREER_LEVELS) expect(entries.filter((entry) => entry.careerLevel === career).length).toBeGreaterThanOrEqual(8);
  });

  test("uses real dynamic IMAGE layers while reporting immutable SVG fallbacks", () => {
    expect(entries.every((entry) => entry.imageAssetPaths.length >= 5)).toBe(true);
    expect(entries.every((entry) => entry.svgFallbackIds.every((assetId) => /^v1:(body|skin|head|eyes|mouth|hair):/.test(assetId)))).toBe(true);
    expect(entries.some((entry) => entry.svgFallbackIds.length > 0)).toBe(true);
  });

  test("reports frequencies, signatures, near duplicates, and missing files", async () => {
    const missing = await findMissingMiniCollectionImageLayers(entries);
    const report = buildMiniCollectionQaReport(entries, missing);
    expect(missing).toEqual([]);
    expect(report.generatedCount).toBe(50);
    expect(report.duplicateRenderSignatureCount).toBe(0);
    expect(report.nearDuplicateWarnings).toEqual([]);
    expect(report.svgFallbackInstanceCount).toBeGreaterThan(0);
    for (const frequencies of Object.values(report.traitFrequencies)) {
      expect(Object.values(frequencies).reduce((total, count) => total + count, 0)).toBe(50);
    }
  });

  test("warns when duplicate signatures and trivial same-DNA scenes are introduced", () => {
    const duplicate = { ...entries[0], tokenId: 9999 };
    const report = buildMiniCollectionQaReport([entries[0], duplicate]);
    expect(report.duplicateRenderSignatureCount).toBe(1);
    expect(report.nearDuplicateWarnings).toEqual([{ tokenIds: [entries[0].tokenId, 9999], differingDynamicSlots: [] }]);
  });
});

