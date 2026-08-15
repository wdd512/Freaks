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

