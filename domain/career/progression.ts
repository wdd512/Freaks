import { GAME_CONFIG } from "@/domain/config/game-config";
import type { SessionDuration, SessionResult } from "@/domain/types";

export function resolveMood(results: SessionResult[]): "EUPHORIC" | "HAPPY" | "FOCUSED" | "NEUTRAL" | "TILTED" | "MELTDOWN" {
  const recent = results.slice(0, 3).map((result) => result === "LIQUIDATED" ? "LOSS" : result);
  if (recent.length === 0) return "NEUTRAL";
  const wins = recent.filter((result) => result === "WIN").length;
  const losses = recent.filter((result) => result === "LOSS").length;
  if (recent.length === 3 && wins === 3) return "EUPHORIC";
  if (recent.length === 3 && losses === 3) return "MELTDOWN";
  if (wins >= 2) return "HAPPY";
  if (losses >= 2) return "TILTED";
  if (wins === 1 && losses === 1) return "FOCUSED";
  return "NEUTRAL";
}

export function sessionXp(duration: SessionDuration, sessionSkill: number): number {
  return GAME_CONFIG.xp[duration] + Math.round(Math.max(0, Math.min(1, sessionSkill)) * 15);
}

export function seasonRating(skillTotal: number, settledSessions: number): number {
  if (settledSessions === 0) return 1000;
  const average = skillTotal / settledSessions;
  return 1000 + 400 * average * Math.sqrt(settledSessions / (settledSessions + 20));
}
