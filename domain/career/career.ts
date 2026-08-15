import { GAME_CONFIG } from "@/domain/config/game-config";
import { CAREER_LEVELS, type CareerLevel, type SessionResult } from "@/domain/types";
import { clamp } from "@/domain/session/engine";

export const careerReturn = (equityCents: number): number => equityCents / GAME_CONFIG.startingEquityCents - 1;

export function applyEquity(equityCents: number, pnlPpm: number): number {
  if (!Number.isSafeInteger(equityCents) || equityCents < 0) throw new Error("Invalid equity");
  return Math.max(0, Math.round(equityCents * (1 + pnlPpm / GAME_CONFIG.returnScale)));
}

export function updateDrawdown(previousPeakCents: number, previousMaxDrawdownPpm: number, equityCents: number) {
  const equityPeakCents = Math.max(previousPeakCents, equityCents);
  const currentDrawdownPpm = equityPeakCents === 0 ? 0 : Math.round((1 - equityCents / equityPeakCents) * GAME_CONFIG.returnScale);
  return { equityPeakCents, currentDrawdownPpm, maxDrawdownPpm: Math.max(previousMaxDrawdownPpm, currentDrawdownPpm) };
}

export function winRate(wins: number, losses: number): number {
  return wins + losses === 0 ? 0.5 : wins / (wins + losses);
}

export function updateStreak(previous: number, result: SessionResult): number {
  if (result === "SCRATCH") return 0;
  if (result === "WIN") return previous > 0 ? previous + 1 : 1;
  return previous < 0 ? previous - 1 : -1;
}

export function calculateCareerScore(input: {
  careerReturn: number;
  winRate: number;
  settledSessions: number;
  maxDrawdown: number;
  currentStreak: number;
  achievementPoints: number;
}): number {
  const { careerReturn: r, winRate: w, settledSessions: n, maxDrawdown: dd, currentStreak: s } = input;
  const a = clamp(input.achievementPoints, 0, 100);
  return clamp(
    300
      + 280 * Math.tanh(r / 0.5)
      + 120 * (2 * w - 1) * Math.min(1, Math.sqrt(n / 30))
      + 100 * (0.4 - dd)
      + 100 * (1 - Math.exp(-n / 40))
      + 8 * clamp(s, -10, 10)
      + a,
    0,
    1000,
  );
}

export function baseLevel(score: number): CareerLevel {
  if (score >= 850) return "MARKET_GOD";
  if (score >= 700) return "WHALE";
  if (score >= 550) return "PROFITABLE";
  if (score >= 400) return "GRINDER";
  if (score >= 250) return "INTERN";
  return "REKT";
}

export function transitionCareerLevel(previous: CareerLevel, score: number): CareerLevel {
  let index = CAREER_LEVELS.indexOf(previous);
  while (index < CAREER_LEVELS.length - 1) {
    const next = CAREER_LEVELS[index + 1];
    if (score < GAME_CONFIG.levelThresholds[next]) break;
    index += 1;
  }
  while (index > 0) {
    const current = CAREER_LEVELS[index];
    if (score >= GAME_CONFIG.levelThresholds[current] - GAME_CONFIG.demotionHysteresis) break;
    index -= 1;
  }
  return CAREER_LEVELS[index];
}
