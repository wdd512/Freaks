import type { CareerLevel, Direction, RiskMode, SessionDuration, SessionResult } from "@/domain/types";

export const ACHIEVEMENTS = {
  FIRST_BLOOD: { name: "First Blood", points: 5, description: "Win the first time." },
  REKT: { name: "REKT", points: 2, description: "Get liquidated." },
  DIAMOND_HANDS: { name: "Diamond Hands", points: 10, description: "Win an 8H Full Send session." },
  PERMABEAR: { name: "Permabear", points: 10, description: "Win 10 SHORT sessions." },
  GREEN_MACHINE: { name: "Green Machine", points: 10, description: "Win five in a row." },
  WALL_STREET_INTERN: { name: "Wall Street Intern", points: 10, description: "Settle 100 sessions." },
  GOD_CANDLE: { name: "God Candle", points: 15, description: "Post exceptional normalized skill." },
  FROM_ZERO_TO_HERO: { name: "From Zero to Hero", points: 20, description: "Climb from REKT to WHALE." },
  ROUND_TRIPPER: { name: "Round Tripper", points: 18, description: "Fall from WHALE to REKT." },
} as const;

export type AchievementCode = keyof typeof ACHIEVEMENTS;

export function evaluateAchievements(input: {
  existing: ReadonlySet<string>;
  result: SessionResult;
  direction: Direction;
  risk: RiskMode;
  duration: SessionDuration;
  sessionSkill: number;
  wins: number;
  winningShorts: number;
  settledSessions: number;
  currentStreak: number;
  currentLevel: CareerLevel;
  hasBeenRekt: boolean;
  hasBeenWhale: boolean;
}): AchievementCode[] {
  const candidates: AchievementCode[] = [];
  if (input.wins >= 1) candidates.push("FIRST_BLOOD");
  if (input.result === "LIQUIDATED") candidates.push("REKT");
  if (input.result === "WIN" && input.risk === "FULL_SEND" && input.duration === "8H") candidates.push("DIAMOND_HANDS");
  if (input.winningShorts >= 10) candidates.push("PERMABEAR");
  if (input.currentStreak >= 5) candidates.push("GREEN_MACHINE");
  if (input.settledSessions >= 100) candidates.push("WALL_STREET_INTERN");
  if (input.sessionSkill > 0.9) candidates.push("GOD_CANDLE");
  if (input.hasBeenRekt && (input.currentLevel === "WHALE" || input.currentLevel === "MARKET_GOD")) candidates.push("FROM_ZERO_TO_HERO");
  if (input.hasBeenWhale && input.currentLevel === "REKT") candidates.push("ROUND_TRIPPER");
  return candidates.filter((code) => !input.existing.has(code));
}

export function achievementPoints(codes: Iterable<string>): number {
  let points = 0;
  for (const code of codes) if (code in ACHIEVEMENTS) points += ACHIEVEMENTS[code as AchievementCode].points;
  return points;
}
