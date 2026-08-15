import fs from "node:fs";
import path from "node:path";
import { generateCollection } from "@/domain/rarity/generator";

const getArg = (name: string, fallback: string): string => {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : fallback;
};
const count = Number(getArg("count", "20"));
const seed = getArg("seed", "pnl-freaks-genesis-v0");
const { report } = generateCollection(count, seed);
fs.writeFileSync(path.resolve(process.cwd(), "generation-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Generated ${report.totalGenerated} unique Freaks (${report.rerolls} rerolls).`);
console.log(`Collection hash: ${report.collectionHash}`);
console.log(`Rarity: ${JSON.stringify(report.rarityDistribution)}`);
console.log("Wrote generation-report.json");
