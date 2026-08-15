import { GAME_CONFIG } from "@/domain/config/game-config";
import type { Asset, MarketPrice } from "@/domain/types";

function validatePriceShape(price: MarketPrice, expectedAsset: Asset, context: "entry" | "settlement"): void {
  if (price.asset !== expectedAsset) throw new Error(`Invalid ${context} market data: asset mismatch`);
  if (!Number.isSafeInteger(price.priceCents) || price.priceCents <= 0) {
    throw new Error(`Invalid ${context} market data: price must be a positive safe integer`);
  }
  if (!Number.isFinite(price.timestamp.getTime())) throw new Error(`Invalid ${context} market data: invalid timestamp`);
}

export function validateEntryMarketPrice(price: MarketPrice, expectedAsset: Asset, now: Date): void {
  validatePriceShape(price, expectedAsset, "entry");
  const { entryFutureToleranceMs, maxEntryAgeMs } = GAME_CONFIG.marketDataValidation;
  const timestampMs = price.timestamp.getTime();
  const nowMs = now.getTime();
  if (timestampMs > nowMs + entryFutureToleranceMs) throw new Error("Invalid entry market data: timestamp is in the future");
  if (nowMs - timestampMs > maxEntryAgeMs) throw new Error("Invalid entry market data: price is stale");
}

export function validateSettlementMarketPrice(price: MarketPrice, expectedAsset: Asset, expiry: Date): void {
  validatePriceShape(price, expectedAsset, "settlement");
  const timestampMs = price.timestamp.getTime();
  const expiryMs = expiry.getTime();
  if (timestampMs < expiryMs) throw new Error("Invalid settlement market data: timestamp precedes expiry");
  if (timestampMs > expiryMs + GAME_CONFIG.marketDataValidation.maxSettlementDelayMs) {
    throw new Error("Invalid settlement market data: timestamp is too far after expiry");
  }
}
