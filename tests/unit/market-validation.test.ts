import { describe, expect, it } from "vitest";
import type { MarketPrice } from "@/domain/types";
import { validateEntryMarketPrice, validateSettlementMarketPrice } from "@/services/market-data/validation";

const priceAt = (timestamp: string, priceCents = 100_000): MarketPrice => ({
  asset: "BTC",
  priceCents,
  timestamp: new Date(timestamp),
  source: "TEST",
});

describe("market data timestamp validation", () => {
  const now = new Date("2026-01-01T00:01:00.000Z");

  it("accepts a current entry tick within clock tolerance", () => {
    expect(() => validateEntryMarketPrice(priceAt("2026-01-01T00:01:10.000Z"), "BTC", now)).not.toThrow();
  });

  it("rejects stale and future entry ticks", () => {
    expect(() => validateEntryMarketPrice(priceAt("2025-12-31T23:59:59.999Z"), "BTC", now)).toThrow("stale");
    expect(() => validateEntryMarketPrice(priceAt("2026-01-01T00:01:15.001Z"), "BTC", now)).toThrow("future");
  });

  it("accepts the first settlement tick at or shortly after expiry", () => {
    const expiry = new Date("2026-01-01T01:00:00.000Z");
    expect(() => validateSettlementMarketPrice(priceAt("2026-01-01T01:00:00.000Z"), "BTC", expiry)).not.toThrow();
    expect(() => validateSettlementMarketPrice(priceAt("2026-01-01T01:00:10.000Z"), "BTC", expiry)).not.toThrow();
  });

  it("rejects early, excessively delayed, invalid, and mismatched settlement ticks", () => {
    const expiry = new Date("2026-01-01T01:00:00.000Z");
    expect(() => validateSettlementMarketPrice(priceAt("2026-01-01T00:59:59.999Z"), "BTC", expiry)).toThrow("precedes expiry");
    expect(() => validateSettlementMarketPrice(priceAt("2026-01-01T01:00:15.001Z"), "BTC", expiry)).toThrow("too far");
    expect(() => validateSettlementMarketPrice(priceAt("2026-01-01T01:00:00.000Z", 0), "BTC", expiry)).toThrow("positive");
    expect(() => validateSettlementMarketPrice({ ...priceAt("2026-01-01T01:00:00.000Z"), asset: "ETH" }, "BTC", expiry)).toThrow("asset mismatch");
  });
});
