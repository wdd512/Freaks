export const ART_PROBLEM_FLAGS = [
  "STRONG",
  "MID",
  "WEAK",
  "CLUTTERED",
  "TOO EMPTY",
  "TOO SIMILAR",
  "BAD FACE",
  "BAD HAIR",
  "BAD PROP COMBO",
] as const;

export type ArtProblemFlag = (typeof ART_PROBLEM_FLAGS)[number];
export type ArtProblemFlagMap = Record<string, ArtProblemFlag>;

export const ART_FLAG_COLLECTIONS = ["MINI_COLLECTION_V1", "PRODUCTION_ONLY_V1"] as const;
export type ArtFlagCollection = (typeof ART_FLAG_COLLECTIONS)[number];

export function artProblemFlagKey(collection: ArtFlagCollection, tokenId: number): string {
  return `${collection}:${tokenId}`;
}
