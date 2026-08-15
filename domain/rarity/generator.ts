import { createHash } from "node:crypto";
import { PERSONALITIES, type FreakDNA, type Personality, type RarityTier } from "@/domain/types";
import { TRAIT_MANIFEST, type TraitSlot, type WeightedTrait } from "@/domain/rarity/trait-manifest";

export type GeneratedFreak = {
  tokenId: number;
  name: string;
  dna: FreakDNA;
  personality: Personality;
  rarityScore: number;
  rarityTier: RarityTier;
  dnaHash: string;
};

export type GenerationReport = {
  seed: string;
  totalGenerated: number;
  rerolls: number;
  duplicateCount: number;
  traitFrequencies: Record<string, Record<string, number>>;
  actualProbabilities: Record<string, Record<string, number>>;
  personalityCounts: Record<string, number>;
  rarityDistribution: Record<string, number>;
  dnaHashes: string[];
  collectionHash: string;
};

function seedToInt(seed: string): number {
  return Number.parseInt(createHash("sha256").update(seed).digest("hex").slice(0, 8), 16) >>> 0;
}

export function createSeededRng(seed: string): () => number {
  let state = seedToInt(seed);
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function pick(options: readonly WeightedTrait[], rng: () => number): string {
  const roll = rng();
  let cumulative = 0;
  for (const option of options) {
    cumulative += option.weight;
    if (roll < cumulative) return option.name;
  }
  return options[options.length - 1].name;
}

const dnaKey = (dna: FreakDNA): string => [dna.body, dna.skin, dna.head, dna.eyes, dna.mouth, dna.hair].join("|");
const shortHash = (value: string): string => createHash("sha256").update(value).digest("hex").slice(0, 16);

export function scoreDna(dna: FreakDNA): number {
  const scoredSlots: Exclude<TraitSlot, "skin">[] = ["body", "head", "eyes", "mouth", "hair"];
  return scoredSlots.reduce((total, slot) => {
    const trait = TRAIT_MANIFEST[slot].find((entry) => entry.name === dna[slot]);
    if (!trait) throw new Error(`Invalid ${slot} trait: ${dna[slot]}`);
    return total - Math.log2(trait.weight);
  }, 0);
}

function rarityCounts(count: number): Record<RarityTier, number> {
  if (count === 4444) return { MYTHIC: 44, EPIC: 89, RARE: 311, UNCOMMON: 889, COMMON: 3111 };
  if (count < 4) return { MYTHIC: count > 0 ? 1 : 0, EPIC: 0, RARE: 0, UNCOMMON: 0, COMMON: Math.max(0, count - 1) };
  const mythic = Math.max(1, Math.round(count * 44 / 4444));
  const epic = Math.max(1, Math.round(count * 89 / 4444));
  const rare = Math.max(1, Math.round(count * 311 / 4444));
  const uncommon = Math.max(1, Math.round(count * 889 / 4444));
  return { MYTHIC: mythic, EPIC: epic, RARE: rare, UNCOMMON: uncommon, COMMON: count - mythic - epic - rare - uncommon };
}

function assignRarity(freaks: Omit<GeneratedFreak, "rarityTier">[]): GeneratedFreak[] {
  const counts = rarityCounts(freaks.length);
  const sorted = [...freaks].sort((a, b) => b.rarityScore - a.rarityScore || a.tokenId - b.tokenId);
  const queue: RarityTier[] = [];
  for (const tier of ["MYTHIC", "EPIC", "RARE", "UNCOMMON", "COMMON"] as const) queue.push(...Array(counts[tier]).fill(tier));
  const byId = new Map(sorted.map((freak, index) => [freak.tokenId, queue[index]]));
  return freaks.map((freak) => ({ ...freak, rarityTier: byId.get(freak.tokenId) ?? "COMMON" }));
}

export function generateCollection(count: number, seed: string): { freaks: GeneratedFreak[]; report: GenerationReport } {
  if (!Number.isInteger(count) || count < 1 || count > 4444) throw new Error("Count must be between 1 and 4444");
  const rng = createSeededRng(seed);
  const seen = new Set<string>();
  let rerolls = 0;
  const raw: Omit<GeneratedFreak, "rarityTier">[] = [];
  for (let index = 0; index < count; index += 1) {
    let dna: FreakDNA;
    let key: string;
    do {
      dna = {
        body: pick(TRAIT_MANIFEST.body, rng),
        skin: pick(TRAIT_MANIFEST.skin, rng),
        head: pick(TRAIT_MANIFEST.head, rng),
        eyes: pick(TRAIT_MANIFEST.eyes, rng),
        mouth: pick(TRAIT_MANIFEST.mouth, rng),
        hair: pick(TRAIT_MANIFEST.hair, rng),
      };
      key = dnaKey(dna);
      if (seen.has(key)) rerolls += 1;
    } while (seen.has(key));
    seen.add(key);
    raw.push({
      tokenId: index + 1,
      name: `Freak ${String(index + 1).padStart(4, "0")}`,
      dna,
      personality: PERSONALITIES[index % PERSONALITIES.length],
      rarityScore: scoreDna(dna),
      dnaHash: shortHash(key),
    });
  }
  // Seeded Fisher-Yates keeps personality totals balanced but placement unpredictable.
  const personalities = raw.map((freak) => freak.personality);
  for (let index = personalities.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1));
    [personalities[index], personalities[swap]] = [personalities[swap], personalities[index]];
  }
  raw.forEach((freak, index) => { freak.personality = personalities[index]; });
  const freaks = assignRarity(raw);
  const traitFrequencies: Record<string, Record<string, number>> = {};
  for (const slot of Object.keys(TRAIT_MANIFEST) as TraitSlot[]) {
    traitFrequencies[slot] = {};
    for (const freak of freaks) traitFrequencies[slot][freak.dna[slot]] = (traitFrequencies[slot][freak.dna[slot]] ?? 0) + 1;
  }
  const actualProbabilities = Object.fromEntries(Object.entries(traitFrequencies).map(([slot, values]) => [
    slot,
    Object.fromEntries(Object.entries(values).map(([trait, frequency]) => [trait, frequency / count])),
  ]));
  const personalityCounts = Object.fromEntries(PERSONALITIES.map((personality) => [personality, freaks.filter((freak) => freak.personality === personality).length]));
  const rarityDistribution = Object.fromEntries(["COMMON", "UNCOMMON", "RARE", "EPIC", "MYTHIC"].map((tier) => [tier, freaks.filter((freak) => freak.rarityTier === tier).length]));
  const dnaHashes = freaks.map((freak) => freak.dnaHash);
  const report: GenerationReport = {
    seed,
    totalGenerated: freaks.length,
    rerolls,
    duplicateCount: freaks.length - new Set(dnaHashes).size,
    traitFrequencies,
    actualProbabilities,
    personalityCounts,
    rarityDistribution,
    dnaHashes,
    collectionHash: shortHash(dnaHashes.join("")),
  };
  if (report.duplicateCount !== 0 || freaks.length !== count || PERSONALITIES.some((p) => personalityCounts[p] === 0 && count >= 8)) {
    throw new Error("Collection validation failed");
  }
  return { freaks, report };
}
