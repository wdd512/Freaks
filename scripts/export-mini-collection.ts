import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { generateCollection } from "@/domain/rarity/generator";
import {
  buildMiniCollectionQaReport,
  buildMiniCollectionSpec,
  createMiniCollection,
  MINI_COLLECTION_V1_COUNT,
  MINI_COLLECTION_V1_SEED,
} from "@/art/qa/mini-collection";
import { findMissingMiniCollectionImageLayers } from "@/art/qa/mini-collection-files";
import { renderStaticSvg } from "@/art/renderer/render-static-svg";
import { inlineLocalArtAssets } from "@/scripts/lib/inline-art-assets";
import { generateProductionOnlySample, PRODUCTION_ONLY_V1_SEED } from "@/art/qa/production-only-sample";

function argument(name: string): string | undefined {
  const prefix = `--${name}=`;
  const inline = process.argv.find((value) => value.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const productionOnly = process.argv.includes("--production-only") || argument("production-only") === "true";
const outputDirectory = path.resolve(process.cwd(), argument("output") ?? (productionOnly ? "art-output/mini-collection-production-v1" : "art-output/mini-collection-v1"));
const perCard = process.argv.includes("--per-card") || argument("per-card") === "true";
const cellSize = Number(argument("cell-size") ?? 256);
if (!Number.isInteger(cellSize) || cellSize < 128 || cellSize > 1024) throw new Error("--cell-size must be an integer from 128 to 1024");

const columns = 10;
const rows = Math.ceil(MINI_COLLECTION_V1_COUNT / columns);
const gutter = Math.max(4, Math.round(cellSize / 32));
const sheetWidth = columns * cellSize + (columns + 1) * gutter;
const sheetHeight = rows * cellSize + (rows + 1) * gutter;
const cardsDirectory = path.join(outputDirectory, "cards");
await mkdir(outputDirectory, { recursive: true });
if (perCard) await mkdir(cardsDirectory, { recursive: true });

const seed = productionOnly ? PRODUCTION_ONLY_V1_SEED : MINI_COLLECTION_V1_SEED;
const generated = productionOnly
  ? generateProductionOnlySample(MINI_COLLECTION_V1_COUNT, seed)
  : generateCollection(MINI_COLLECTION_V1_COUNT, seed).freaks;
const entries = createMiniCollection(generated);
const missingImageLayers = await findMissingMiniCollectionImageLayers(entries);
const cards: Buffer[] = [];
const renderFailures: { tokenId: number; error: string }[] = [];

for (const entry of entries) {
  let card: Buffer;
  try {
    const svg = renderStaticSvg(buildMiniCollectionSpec(entry));
    card = await sharp(Buffer.from(await inlineLocalArtAssets(svg)))
      .resize(cellSize, cellSize, { kernel: "nearest", fit: "fill" })
      .png({ compressionLevel: 9, palette: false })
      .toBuffer();
  } catch (error) {
    renderFailures.push({ tokenId: entry.tokenId, error: error instanceof Error ? error.message : "Unknown render failure" });
    card = await sharp({ create: { width: cellSize, height: cellSize, channels: 4, background: "#210d11" } }).png().toBuffer();
  }
  cards.push(card);
  if (perCard) await writeFile(path.join(cardsDirectory, `${String(entry.tokenId).padStart(4, "0")}.png`), card);
}

const contactSheet = await sharp({ create: { width: sheetWidth, height: sheetHeight, channels: 4, background: "#070b0a" } })
  .composite(cards.map((input, index) => ({
    input,
    left: gutter + (index % columns) * (cellSize + gutter),
    top: gutter + Math.floor(index / columns) * (cellSize + gutter),
  })))
  .png({ compressionLevel: 9, palette: false })
  .toBuffer();
await writeFile(path.join(outputDirectory, "contact-sheet.png"), contactSheet);

const qaReport = {
  ...buildMiniCollectionQaReport(entries, missingImageLayers, seed),
  rendersCompleted: entries.length - renderFailures.length,
  renderFailureCount: renderFailures.length,
  renderFailures,
  contactSheet: { file: "contact-sheet.png", width: sheetWidth, height: sheetHeight, columns, rows, cellSize, gutter },
};
const manifest = {
  version: productionOnly ? "mini-collection-production-v1" : "mini-collection-v1",
  seed,
  productionOnly,
  count: entries.length,
  perCard,
  contactSheet: qaReport.contactSheet,
  freaks: entries.map((entry) => ({
    tokenId: entry.tokenId,
    name: entry.name,
    rarityTier: entry.rarityTier,
    personality: entry.personality,
    careerLevel: entry.careerLevel,
    immutable: entry.dna,
    dynamic: entry.dynamic,
    renderSignature: entry.renderSignature,
    visualFingerprint: entry.visualFingerprint,
    visualFingerprintHash: entry.visualFingerprintHash,
    imageAssets: entry.imageAssetPaths,
    svgFallbacks: entry.svgFallbackIds,
    file: perCard ? `cards/${String(entry.tokenId).padStart(4, "0")}.png` : undefined,
  })),
};
await writeFile(path.join(outputDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
await writeFile(path.join(outputDirectory, "qa-report.json"), `${JSON.stringify(qaReport, null, 2)}\n`, "utf8");

console.log(`${productionOnly ? "Production-only Mini Collection V1" : "Mini Collection V1"}: ${qaReport.rendersCompleted}/${entries.length} renders completed`);
console.log(`Contact sheet: ${path.join(outputDirectory, "contact-sheet.png")}`);
console.log(`Missing IMAGE layers: ${qaReport.missingImageLayers.length}`);
console.log(`Duplicate visual fingerprints: ${qaReport.duplicateVisualFingerprintCount}`);
console.log(`One-trait near duplicates: ${qaReport.nearDuplicateWarnings.length}`);
console.log(`Two-trait similarity warnings: ${qaReport.similarityWarnings.length}`);
console.log(`SVG fallback instances: ${qaReport.svgFallbackInstanceCount}`);
