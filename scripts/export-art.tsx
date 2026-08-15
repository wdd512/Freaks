import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import { generateCollection } from "@/domain/rarity/generator";
import { CAREER_LEVELS, MOODS, type CareerLevel, type Mood } from "@/domain/types";
import { buildRenderSpec } from "@/art/renderer/build-render-spec";
import { buildRenderSignature } from "@/art/renderer/render-signature";
import { PixelCanvas } from "@/components/freak/art/PixelCanvas";

type ExportFormat = "svg" | "png";

function argument(name: string): string | undefined {
  const prefix = `--${name}=`;
  const inline = process.argv.find((value) => value.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const count = Number(argument("count") ?? 50);
const career = (argument("career") ?? "INTERN") as CareerLevel;
const mood = (argument("mood") ?? "NEUTRAL") as Mood;
const format = (argument("format") ?? "svg").toLowerCase() as ExportFormat;
const seed = argument("seed") ?? "pnl-freaks-art-v1";
if (!Number.isInteger(count) || count < 1 || count > 4444) throw new Error("--count must be an integer from 1 to 4444");
if (!CAREER_LEVELS.includes(career)) throw new Error(`--career must be one of: ${CAREER_LEVELS.join(", ")}`);
if (!MOODS.includes(mood)) throw new Error(`--mood must be one of: ${MOODS.join(", ")}`);
if (format !== "svg" && format !== "png") throw new Error("--format must be svg or png");

const outputDirectory = path.resolve(process.cwd(), argument("output") ?? "art-output");
await mkdir(outputDirectory, { recursive: true });
const collection = generateCollection(count, seed).freaks;
const manifest = [];

for (const freak of collection) {
  const spec = buildRenderSpec({ tokenId: freak.tokenId, dna: freak.dna, careerLevel: career, mood });
  const baseName = String(freak.tokenId).padStart(4, "0");
  const file = `${baseName}.${format}`;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>${renderToStaticMarkup(<PixelCanvas spec={spec} size={512} />)}`;
  const target = path.join(outputDirectory, file);
  if (format === "svg") await writeFile(target, svg, "utf8");
  else await sharp(Buffer.from(svg)).resize(512, 512, { kernel: "nearest", fit: "fill" }).png().toFile(target);
  manifest.push({
    tokenId: freak.tokenId,
    dna: freak.dna,
    renderSignature: buildRenderSignature(spec),
    career,
    mood,
    file,
  });
}

await writeFile(path.join(outputDirectory, "manifest.json"), `${JSON.stringify({ seed, format, count, career, mood, freaks: manifest }, null, 2)}\n`, "utf8");
console.log(`Exported ${count} deterministic ${format.toUpperCase()} artworks to ${outputDirectory}`);

