import { z } from "zod";
import type { Asset, CareerLevel, RiskMode, SessionDuration } from "@/domain/types";

const gameConfigSchema = z.object({
  startingEquityCents: z.number().int().positive(),
  returnScale: z.number().int().positive(),
  riskMultipliers: z.record(z.string(), z.number().positive()),
  productionDurationsSeconds: z.record(z.string(), z.number().int().positive()),
  developmentDurationsSeconds: z.record(z.string(), z.number().int().positive()),
  liquidationThresholdPpm: z.record(z.string(), z.number().int()),
  liquidationFinalPpm: z.record(z.string(), z.number().int()),
  pnlClampPpm: z.number().int().positive(),
  resultThresholdPpm: z.number().int().positive(),
  levelThresholds: z.record(z.string(), z.number().min(0).max(1000)),
  demotionHysteresis: z.number().positive(),
  volatility: z.record(z.string(), z.number().positive()),
  xp: z.record(z.string(), z.number().int().nonnegative()),
});

export const GAME_CONFIG = gameConfigSchema.parse({
  startingEquityCents: 1_000_000,
  returnScale: 1_000_000,
  riskMultipliers: { SAFE: 0.75, NORMAL: 1, DEGEN: 1.5, FULL_SEND: 2 },
  productionDurationsSeconds: { "1H": 3_600, "4H": 14_400, "8H": 28_800 },
  developmentDurationsSeconds: { "1H": 60, "4H": 240, "8H": 480 },
  liquidationThresholdPpm: { DEGEN: -150_000, FULL_SEND: -100_000 },
  liquidationFinalPpm: { DEGEN: -180_000, FULL_SEND: -200_000 },
  pnlClampPpm: 200_000,
  resultThresholdPpm: 1_000,
  levelThresholds: { REKT: 0, INTERN: 250, GRINDER: 400, PROFITABLE: 550, WHALE: 700, MARKET_GOD: 850 },
  demotionHysteresis: 30,
  volatility: { BTC: 0.02, ETH: 0.027 },
  xp: { "1H": 10, "4H": 20, "8H": 30 },
});

export function durationSeconds(duration: SessionDuration, development: boolean): number {
  const source = development ? GAME_CONFIG.developmentDurationsSeconds : GAME_CONFIG.productionDurationsSeconds;
  return source[duration];
}

export const riskMultiplier = (risk: RiskMode): number => GAME_CONFIG.riskMultipliers[risk];
export const expectedVolatility = (asset: Asset): number => GAME_CONFIG.volatility[asset];
export const levelThreshold = (level: CareerLevel): number => GAME_CONFIG.levelThresholds[level];
