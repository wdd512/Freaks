import type { GeneratedFreak } from "@/domain/rarity/generator";
import { PERSONALITIES, RARITY_TIERS, type FreakDNA } from "@/domain/types";
import type { ImmutableArtIdentity } from "@/art/manifest/immutable";
import { dnaSeed, stableHash } from "@/art/renderer/deterministic";

export const PRODUCTION_ONLY_V1_SEED = "pnl-freaks-production-only-v1";

export const PRODUCTION_ONLY_IMMUTABLE_TRAITS = {
  body: ["Average", "Lanky", "Wide Shoulders"],
  skin: ["Warm Light", "Bronze", "Olive", "Deep"],
  head: ["Round", "Potato", "Long"],
  eyes: ["Sleepy", "Lazy Eye", "Laser Focus", "Dead"],
  mouth: ["Flat", "Smirk", "Lip Bite"],
  hair: ["Buzz Cut", "Bald", "Messy Fringe", "Hoodie Up"],
} as const satisfies { [Slot in keyof ImmutableArtIdentity]: readonly ImmutableArtIdentity[Slot][] };

function createQaRng(seed: string): () => number {
  let state = stableHash(seed);
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function allProductionDna(): FreakDNA[] {
  const combinations: FreakDNA[] = [];
  for (const body of PRODUCTION_ONLY_IMMUTABLE_TRAITS.body)
    for (const skin of PRODUCTION_ONLY_IMMUTABLE_TRAITS.skin)
      for (const head of PRODUCTION_ONLY_IMMUTABLE_TRAITS.head)
        for (const eyes of PRODUCTION_ONLY_IMMUTABLE_TRAITS.eyes)
          for (const mouth of PRODUCTION_ONLY_IMMUTABLE_TRAITS.mouth)
            for (const hair of PRODUCTION_ONLY_IMMUTABLE_TRAITS.hair)
              combinations.push({ body, skin, head, eyes, mouth, hair });
  return combinations;
}

export function generateProductionOnlySample(count = 50, seed = PRODUCTION_ONLY_V1_SEED): GeneratedFreak[] {
  const combinations = allProductionDna();
  if (!Number.isInteger(count) || count < 1 || count > combinations.length) throw new Error(`Production-only count must be from 1 to ${combinations.length}`);
  const rng = createQaRng(seed);
  for (let index = combinations.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1));
    [combinations[index], combinations[swap]] = [combinations[swap], combinations[index]];
  }
  return combinations.slice(0, count).map((dna, index) => ({
    tokenId: index + 1,
    name: `Production Sample ${String(index + 1).padStart(4, "0")}`,
    dna,
    personality: PERSONALITIES[index % PERSONALITIES.length],
    rarityScore: 0,
    rarityTier: RARITY_TIERS[index % RARITY_TIERS.length],
    dnaHash: stableHash(dnaSeed(dna)).toString(16).padStart(8, "0"),
  }));
}

