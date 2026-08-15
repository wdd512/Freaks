import { createHash } from "node:crypto";
import type { Clock } from "@/services/clock";
import { MARKET_SCENARIOS, type Asset, type MarketPrice, type MarketScenario } from "@/domain/types";

export interface MarketDataProvider {
  getCurrentPrice(asset: Asset): Promise<MarketPrice>;
  getSettlementPrice(asset: Asset, targetTimestamp: Date): Promise<MarketPrice>;
}

function unitHash(seed: string): number {
  return Number.parseInt(createHash("sha256").update(seed).digest("hex").slice(0, 8), 16) / 0xffffffff;
}

export class DeterministicMockMarketDataProvider implements MarketDataProvider {
  constructor(
    private readonly clock: Clock,
    private readonly scenario: MarketScenario = "VOLATILE",
    private readonly seed = "pnl-freaks-v0",
  ) {}

  private priceAt(asset: Asset, target: Date): MarketPrice {
    const tickMs = 10_000;
    const timestampMs = Math.ceil(target.getTime() / tickMs) * tickMs;
    const t = timestampMs / 1000;
    const base = asset === "BTC" ? 6_700_000 : 340_000;
    const phase = unitHash(`${this.seed}:${asset}`) * Math.PI * 2;
    const slow = Math.sin(t / 180 + phase);
    const fast = Math.sin(t / 37 + phase * 2);
    const discreteNoise = unitHash(`${this.seed}:${asset}:${timestampMs}`) - 0.5;
    const periodic = 0.012 * slow + 0.004 * fast + 0.002 * discreteNoise;
    const cycle = (t % 900) / 900;
    let factor: number;
    switch (this.scenario) {
      case "BULL_TREND": factor = 1 + periodic * 0.25 + cycle * 0.08; break;
      case "BEAR_TREND": factor = 1 + periodic * 0.25 - cycle * 0.08; break;
      case "SIDEWAYS": factor = 1 + periodic * 0.2; break;
      case "VOLATILE": factor = 1 + periodic * 1.8; break;
      case "CRASH": factor = 1 + periodic * 0.2 - (cycle > 0.42 ? (cycle - 0.42) * 0.42 : 0); break;
      case "PUMP": factor = 1 + periodic * 0.2 + (cycle > 0.42 ? (cycle - 0.42) * 0.42 : 0); break;
    }
    return { asset, priceCents: Math.max(1, Math.round(base * factor)), timestamp: new Date(timestampMs), source: `MOCK:${this.scenario}` };
  }

  getCurrentPrice(asset: Asset): Promise<MarketPrice> { return Promise.resolve(this.priceAt(asset, this.clock.now())); }
  getSettlementPrice(asset: Asset, targetTimestamp: Date): Promise<MarketPrice> { return Promise.resolve(this.priceAt(asset, targetTimestamp)); }
}

export function selectedScenario(value = process.env.MARKET_SCENARIO): MarketScenario {
  return MARKET_SCENARIOS.includes(value as MarketScenario) ? value as MarketScenario : "VOLATILE";
}

export const createMarketProvider = (clock: Clock, scenario?: MarketScenario): MarketDataProvider =>
  new DeterministicMockMarketDataProvider(clock, scenario ?? selectedScenario(), process.env.MARKET_SEED ?? "pnl-freaks-v0");
