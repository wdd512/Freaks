import { GAME_CONFIG, expectedVolatility, riskMultiplier } from "@/domain/config/game-config";
import type {
  Asset,
  Direction,
  Personality,
  RiskMode,
  SessionCalculation,
  SessionDuration,
  SessionResult,
} from "@/domain/types";

export const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export function marketReturn(entryPriceCents: number, exitPriceCents: number): number {
  if (!Number.isSafeInteger(entryPriceCents) || !Number.isSafeInteger(exitPriceCents) || entryPriceCents <= 0 || exitPriceCents <= 0) {
    throw new Error("Prices must be positive safe integers");
  }
  return exitPriceCents / entryPriceCents - 1;
}

export const directionSign = (direction: Direction): 1 | -1 => (direction === "LONG" ? 1 : -1);

export function personalityMultiplier(
  personality: Personality,
  direction: Direction,
  risk: RiskMode,
  duration: SessionDuration,
  absoluteMarketMove: number,
): number {
  switch (personality) {
    case "BULL_BRAIN": return direction === "LONG" ? 1.04 : 0.96;
    case "PERMABEAR": return direction === "SHORT" ? 1.04 : 0.96;
    case "DEGEN": return risk === "SAFE" ? 0.95 : risk === "DEGEN" || risk === "FULL_SEND" ? 1.05 : 1;
    case "RISK_MANAGER": return risk === "SAFE" || risk === "NORMAL" ? 1.04 : risk === "FULL_SEND" ? 0.96 : 1;
    case "SCALPER": return duration === "1H" ? 1.04 : duration === "8H" ? 0.96 : 1;
    case "SWINGER": return duration === "8H" ? 1.04 : duration === "1H" ? 0.96 : 1;
    case "VOLATILITY_ADDICT": return absoluteMarketMove >= 0.02 ? 1.04 : absoluteMarketMove < 0.005 ? 0.97 : 1;
    case "BORING_QUANT": return absoluteMarketMove < 0.005 ? 1.03 : absoluteMarketMove >= 0.03 ? 0.97 : 1;
  }
}

export function classifyResult(finalPnlPpm: number): SessionResult {
  if (finalPnlPpm > GAME_CONFIG.resultThresholdPpm) return "WIN";
  if (finalPnlPpm < -GAME_CONFIG.resultThresholdPpm) return "LOSS";
  return "SCRATCH";
}

export function calculateSession(input: {
  entryPriceCents: number;
  exitPriceCents: number;
  direction: Direction;
  risk: RiskMode;
  duration: SessionDuration;
  personality: Personality;
}): SessionCalculation {
  const underlying = marketReturn(input.entryPriceCents, input.exitPriceCents);
  const modifier = personalityMultiplier(input.personality, input.direction, input.risk, input.duration, Math.abs(underlying));
  const rawPnlPpm = Math.round(underlying * directionSign(input.direction) * riskMultiplier(input.risk) * modifier * GAME_CONFIG.returnScale);
  const threshold = GAME_CONFIG.liquidationThresholdPpm[input.risk];
  const liquidated = threshold !== undefined && rawPnlPpm <= threshold;
  const finalPnlPpm = liquidated
    ? GAME_CONFIG.liquidationFinalPpm[input.risk]
    : clamp(rawPnlPpm, -GAME_CONFIG.pnlClampPpm, GAME_CONFIG.pnlClampPpm);
  return {
    marketReturnPpm: Math.round(underlying * GAME_CONFIG.returnScale),
    personalityMultiplier: modifier,
    rawPnlPpm,
    finalPnlPpm,
    result: liquidated ? "LIQUIDATED" : classifyResult(finalPnlPpm),
    liquidated,
  };
}

export function calculateSessionSkill(asset: Asset, direction: Direction, entryPriceCents: number, exitPriceCents: number): number {
  const edge = directionSign(direction) * Math.log(exitPriceCents / entryPriceCents);
  return Math.tanh(edge / expectedVolatility(asset));
}
