import type { FreakDNA } from "@/domain/types";

export function stableHash(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function deterministicIndex(seed: string, length: number): number {
  if (length < 1) throw new Error("Cannot select from an empty art pool");
  return stableHash(seed) % length;
}

export function dnaSeed(dna: FreakDNA): string {
  return [dna.body, dna.skin, dna.head, dna.eyes, dna.mouth, dna.hair].join("|");
}

export function slug(value: string): string {
  return value.toLowerCase().replaceAll(" ", "-").replaceAll("_", "-");
}

