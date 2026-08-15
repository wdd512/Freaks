import { sql } from "drizzle-orm";
import type { GameDatabase } from "@/db";
import { migrate } from "@/db";
import {
  careerLevelHistory, careerStates, equityHistory, freakAchievements, freakDna, freaks, priceSnapshots, seasonStates, sessions,
} from "@/db/schema";
import { applyEquity, calculateCareerScore, careerReturn, transitionCareerLevel, updateDrawdown, updateStreak, winRate } from "@/domain/career/career";
import { resolveMood, seasonRating, sessionXp } from "@/domain/career/progression";
import { GAME_CONFIG } from "@/domain/config/game-config";
import { generateCollection } from "@/domain/rarity/generator";
import type { CareerLevel, Mood, SessionResult } from "@/domain/types";
import { seedAchievementDefinitions } from "@/services/settlement/session-service";

export type SeedMode = "fresh" | "demo";

const TOKEN_IDS = [7, 42, 69, 101, 207, 333, 404, 420, 512, 616, 707, 808, 911, 1001, 1111, 1200, 1337, 1444, 1777, 2020];
const NAMES = ["Exit Liquidity", "Candle Goblin", "Bagford", "Leverage Larry", "Satoshi's Intern", "Funding Fred", "Wick Hunter", "Chadlestick", "Paperhands Pete", "Basis Betty", "Slippage Steve", "Delta Debbie", "The Top Buyer", "Stoploss Sally", "Chart Crimes", "Panic Pablo", "Oracle Oliver", "Margin Marge", "Quant Quasimodo", "Perp Walken"];

const DEMO_SERIES: number[][] = [
  [], [], [], [0.01, -0.008], [-0.06, -0.08, -0.12, -0.18],
  [0.018, 0.012, -0.006], [0.025, -0.01, 0.022, 0.014], [0.03, 0.02, -0.012, 0.018],
  [0.035, 0.018, 0.02, -0.01, 0.024], [0.02, -0.008, 0.028, 0.016, 0.012],
  [0.045, 0.038, -0.012, 0.042, 0.03, 0.025], [0.05, 0.035, 0.04, -0.015, 0.045, 0.03],
  [0.06, 0.055, -0.02, 0.045, 0.05, 0.04, 0.035], [0.07, 0.055, 0.06, -0.018, 0.05, 0.045, 0.04],
  Array(12).fill(0).map((_, index) => index === 6 ? -0.025 : 0.055),
  Array(13).fill(0).map((_, index) => index === 5 ? -0.03 : 0.06),
  Array(30).fill(0).map((_, index) => index === 8 ? -0.025 : 0.065),
  [0.03, -0.01, 0.025, 0.02], [0.018, 0.022, -0.008, 0.025, 0.014], [0.04, 0.03, 0.025, -0.012, 0.035],
];

export function clearDatabase(db: GameDatabase): void {
  db.$client.exec("PRAGMA foreign_keys = OFF; DELETE FROM price_snapshots; DELETE FROM freak_achievements; DELETE FROM career_level_history; DELETE FROM equity_history; DELETE FROM sessions; DELETE FROM career_states; DELETE FROM season_states; DELETE FROM freak_dna; DELETE FROM freaks; DELETE FROM achievements; DELETE FROM game_config; PRAGMA foreign_keys = ON;");
}

export function seedDatabase(db: GameDatabase, mode: SeedMode, seed = "pnl-freaks-genesis-v0"): void {
  migrate(db);
  clearDatabase(db);
  seedAchievementDefinitions(db);
  const generated = generateCollection(20, seed).freaks;
  const now = Date.now();
  db.transaction((tx) => {
    generated.forEach((generatedFreak, index) => {
      const tokenId = TOKEN_IDS[index];
      const createdAt = new Date(now - 60 * 24 * 60 * 60 * 1000 + index * 1000);
      tx.insert(freaks).values({ tokenId, name: NAMES[index], personality: generatedFreak.personality, rarityScore: generatedFreak.rarityScore, rarityTier: generatedFreak.rarityTier, createdAt }).run();
      tx.insert(freakDna).values({ tokenId, ...generatedFreak.dna, dnaHash: generatedFreak.dnaHash }).run();
      tx.insert(careerStates).values({ tokenId, equityCents: GAME_CONFIG.startingEquityCents, equityPeakCents: GAME_CONFIG.startingEquityCents,
        careerScore: 340, careerLevel: "INTERN", mood: "NEUTRAL", updatedAt: createdAt }).run();
      tx.insert(seasonStates).values({ tokenId }).run();
      tx.insert(careerLevelHistory).values({ tokenId, fromLevel: null, toLevel: "INTERN", careerScore: 340, timestamp: createdAt }).run();
    });
  });
  if (mode === "demo") generated.forEach((_, index) => seedDemoHistory(db, TOKEN_IDS[index], DEMO_SERIES[index], now - (DEMO_SERIES[index].length + 2) * 60 * 60 * 1000));
}

function seedDemoHistory(db: GameDatabase, tokenId: number, returns: number[], startMs: number): void {
  if (returns.length === 0) return;
  let equity = GAME_CONFIG.startingEquityCents;
  let peak = equity;
  let maxDd = 0;
  let wins = 0, losses = 0, scratches = 0, streak = 0;
  let level: CareerLevel = "INTERN";
  let skillTotal = 0;
  let xp = 0;
  const results: SessionResult[] = [];
  returns.forEach((pnl, index) => {
    const id = `demo-${tokenId}-${index + 1}`;
    const openedAt = new Date(startMs + index * 60 * 60 * 1000);
    const expiresAt = new Date(openedAt.getTime() + 60 * 60 * 1000);
    const settledAt = new Date(expiresAt.getTime() + 10_000);
    const finalPnlPpm = Math.round(pnl * 1_000_000);
    const result: SessionResult = pnl > 0.001 ? "WIN" : pnl < -0.001 ? (pnl <= -0.18 ? "LIQUIDATED" : "LOSS") : "SCRATCH";
    const before = equity;
    equity = applyEquity(equity, finalPnlPpm);
    const drawdown = updateDrawdown(peak, maxDd, equity);
    peak = drawdown.equityPeakCents;
    maxDd = drawdown.maxDrawdownPpm;
    wins += result === "WIN" ? 1 : 0;
    losses += result === "LOSS" || result === "LIQUIDATED" ? 1 : 0;
    scratches += result === "SCRATCH" ? 1 : 0;
    streak = updateStreak(streak, result);
    results.unshift(result);
    const skill = Math.tanh(pnl / 0.02);
    skillTotal += skill;
    xp += sessionXp("1H", skill);
    const points = wins > 0 ? 5 : 0;
    const score = calculateCareerScore({ careerReturn: careerReturn(equity), winRate: winRate(wins, losses), settledSessions: index + 1,
      maxDrawdown: maxDd / 1_000_000, currentStreak: streak, achievementPoints: points + (result === "LIQUIDATED" ? 2 : 0) });
    const previousLevel = level;
    level = transitionCareerLevel(level, score);
    const entryPrice = 5_000_000;
    const exitPrice = Math.round(entryPrice * (1 + pnl));
    db.transaction((tx) => {
      tx.insert(sessions).values({ id, tokenId, asset: index % 3 === 0 ? "ETH" : "BTC", direction: "LONG", riskMode: result === "LIQUIDATED" ? "FULL_SEND" : "NORMAL",
        duration: "1H", status: "SETTLED", entryPriceCents: entryPrice, entryPriceTimestamp: openedAt, openedAt, expiresAt,
        exitPriceCents: exitPrice, exitPriceTimestamp: expiresAt, rawPnlPpm: finalPnlPpm, finalPnlPpm, result, sessionSkill: skill,
        settledAt, createdAt: openedAt, updatedAt: settledAt }).run();
      tx.insert(priceSnapshots).values([{ sessionId: id, kind: "ENTRY", asset: "BTC", priceCents: entryPrice, timestamp: openedAt, source: "DEMO" },
        { sessionId: id, kind: "EXIT", asset: "BTC", priceCents: exitPrice, timestamp: expiresAt, source: "DEMO" }]).run();
      tx.insert(equityHistory).values({ tokenId, sessionId: id, equityBeforeCents: before, equityAfterCents: equity,
        careerReturnPpm: Math.round(careerReturn(equity) * 1_000_000), drawdownPpm: drawdown.currentDrawdownPpm,
        careerScore: score, careerLevel: level, timestamp: settledAt }).run();
      if (level !== previousLevel) tx.insert(careerLevelHistory).values({ tokenId, sessionId: id, fromLevel: previousLevel, toLevel: level, careerScore: score, timestamp: settledAt }).run();
    });
  });
  const liquidations = returns.filter((value) => value <= -0.18).length;
  const finalScore = calculateCareerScore({ careerReturn: careerReturn(equity), winRate: winRate(wins, losses), settledSessions: returns.length,
    maxDrawdown: maxDd / 1_000_000, currentStreak: streak, achievementPoints: (wins > 0 ? 5 : 0) + (liquidations > 0 ? 2 : 0) });
  level = transitionCareerLevel(level, finalScore);
  const mood: Mood = resolveMood(results);
  db.update(careerStates).set({ equityCents: equity, equityPeakCents: peak, maxDrawdownPpm: maxDd, wins, losses, scratches, liquidations,
    settledSessions: returns.length, currentStreak: streak, bestPnlPpm: Math.max(...returns.map((v) => Math.round(v * 1_000_000))),
    worstPnlPpm: Math.min(...returns.map((v) => Math.round(v * 1_000_000))), careerScore: finalScore, careerLevel: level, mood,
    lifetimeXp: xp, hasBeenRekt: level === "REKT", hasBeenWhale: level === "WHALE" || level === "MARKET_GOD", updatedAt: new Date(),
  }).where(sql`${careerStates.tokenId} = ${tokenId}`).run();
  db.update(seasonStates).set({ settledSessions: returns.length, skillTotal, rating: seasonRating(skillTotal, returns.length), xp }).where(sql`${seasonStates.tokenId} = ${tokenId}`).run();
  if (wins > 0) db.insert(freakAchievements).values({ tokenId, code: "FIRST_BLOOD", sessionId: `demo-${tokenId}-1`, grantedAt: new Date() }).onConflictDoNothing().run();
  if (liquidations > 0) db.insert(freakAchievements).values({ tokenId, code: "REKT", sessionId: `demo-${tokenId}-${returns.length}`, grantedAt: new Date() }).onConflictDoNothing().run();
}
