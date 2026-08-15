import type { CareerLevel, FreakDNA, Mood, VisualState } from "@/domain/types";
import { buildRenderSpec } from "@/art/renderer/build-render-spec";

export function resolveVisualState(dna: FreakDNA, careerLevel: CareerLevel, mood: Mood, recentAchievements: string[] = []): VisualState {
  const spec = buildRenderSpec({ tokenId: 0, dna, careerLevel, mood, recentAchievements });
  return { ...spec.dynamic, effects: spec.effects };
}
