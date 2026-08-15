import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, inArray, lte } from "drizzle-orm";
import { z } from "zod";
import type { GameDatabase } from "@/db";
import {
  achievements, careerLevelHistory, careerStates, equityHistory, freakAchievements, freaks,
  priceSnapshots, seasonStates, sessions,
} from "@/db/schema";
import { ACHIEVEMENTS, achievementPoints, evaluateAchievements } from "@/domain/achievement/achievements";
import { applyEquity, calculateCareerScore, careerReturn, transitionCareerLevel, updateDrawdown, updateStreak, winRate } from "@/domain/career/career";
import { resolveMood, seasonRating, sessionXp } from "@/domain/career/progression";
import { durationSeconds } from "@/domain/config/game-config";
import { calculateSession, calculateSessionSkill } from "@/domain/session/engine";
import {
  ASSETS, DIRECTIONS, DURATIONS, RISK_MODES,
  type Asset, type CareerLevel, type Direction, type Personality, type RiskMode, type SessionDuration, type SessionResult,
} from "@/domain/types";
import type { Clock } from "@/services/clock";
import { isDevelopmentTime } from "@/services/clock";
import type { MarketDataProvider } from "@/services/market-data";
import { gameLog } from "@/services/logging";

const openSchema = z.object({
  tokenId: z.number().int().positive(), asset: z.enum(ASSETS), direction: z.enum(DIRECTIONS),
  riskMode: z.enum(RISK_MODES), duration: z.enum(DURATIONS),
});

export type OpenSessionInput = z.infer<typeof openSchema>;

export class SessionService {
  constructor(private readonly db: GameDatabase, private readonly market: MarketDataProvider, private readonly clock: Clock) {}

  async openSession(untrusted: OpenSessionInput) {
    const input = openSchema.parse(untrusted);
    const freak = this.db.select().from(freaks).where(eq(freaks.tokenId, input.tokenId)).get();
    if (!freak) throw new Error("Freak not found");
    const active = this.db.select().from(sessions).where(and(eq(sessions.tokenId, input.tokenId), inArray(sessions.status, ["PENDING", "ACTIVE", "EXPIRED"]))).get();
    if (active) throw new Error("This Freak already has an active session");
    const entry = await this.market.getCurrentPrice(input.asset);
    if (entry.priceCents <= 0 || !Number.isSafeInteger(entry.priceCents)) throw new Error("Invalid entry market data");
    const now = this.clock.now();
    const expiresAt = new Date(now.getTime() + durationSeconds(input.duration, isDevelopmentTime()) * 1000);
    const id = randomUUID();
    this.db.transaction((tx) => {
      tx.insert(sessions).values({
        id, tokenId: input.tokenId, asset: input.asset, direction: input.direction, riskMode: input.riskMode,
        duration: input.duration, status: "ACTIVE", entryPriceCents: entry.priceCents,
        entryPriceTimestamp: entry.timestamp, openedAt: now, expiresAt, createdAt: now, updatedAt: now,
      }).run();
      tx.insert(priceSnapshots).values({ sessionId: id, kind: "ENTRY", asset: input.asset, priceCents: entry.priceCents, timestamp: entry.timestamp, source: entry.source }).run();
    });
    gameLog("SESSION_OPENED", { sessionId: id, tokenId: input.tokenId, asset: input.asset, direction: input.direction });
    return this.db.select().from(sessions).where(eq(sessions.id, id)).get();
  }

  async settleSession(sessionId: string) {
    const original = this.db.select().from(sessions).where(eq(sessions.id, sessionId)).get();
    if (!original) throw new Error("Session not found");
    if (original.status === "SETTLED") return original;
    if (!original.expiresAt || this.clock.now() < original.expiresAt) throw new Error("Session has not expired");
    const exit = await this.market.getSettlementPrice(original.asset as Asset, original.expiresAt);
    if (exit.priceCents <= 0 || exit.timestamp < original.expiresAt) throw new Error("Invalid settlement market data");

    return this.db.transaction((tx) => {
      const session = tx.select().from(sessions).where(eq(sessions.id, sessionId)).get();
      if (!session) throw new Error("Session not found");
      if (session.status === "SETTLED") return session;
      const career = tx.select().from(careerStates).where(eq(careerStates.tokenId, session.tokenId)).get();
      const season = tx.select().from(seasonStates).where(eq(seasonStates.tokenId, session.tokenId)).get();
      const freak = tx.select().from(freaks).where(eq(freaks.tokenId, session.tokenId)).get();
      if (!career || !season || !freak) throw new Error("Inconsistent Freak state");
      const calculation = calculateSession({
        entryPriceCents: session.entryPriceCents, exitPriceCents: exit.priceCents,
        direction: session.direction as Direction, risk: session.riskMode as RiskMode,
        duration: session.duration as SessionDuration, personality: freak.personality as Personality,
      });
      const skill = calculateSessionSkill(session.asset as Asset, session.direction as Direction, session.entryPriceCents, exit.priceCents);
      const equityAfter = applyEquity(career.equityCents, calculation.finalPnlPpm);
      const dd = updateDrawdown(career.equityPeakCents, career.maxDrawdownPpm, equityAfter);
      const result = calculation.result;
      const wins = career.wins + (result === "WIN" ? 1 : 0);
      const losses = career.losses + (result === "LOSS" || result === "LIQUIDATED" ? 1 : 0);
      const scratches = career.scratches + (result === "SCRATCH" ? 1 : 0);
      const liquidations = career.liquidations + (result === "LIQUIDATED" ? 1 : 0);
      const settled = career.settledSessions + 1;
      const winningShorts = career.winningShorts + (result === "WIN" && session.direction === "SHORT" ? 1 : 0);
      const streak = updateStreak(career.currentStreak, result);
      const xp = sessionXp(session.duration as SessionDuration, skill);
      const seasonSettled = season.settledSessions + 1;
      const skillTotal = season.skillTotal + skill;
      const rating = seasonRating(skillTotal, seasonSettled);
      const granted = tx.select({ code: freakAchievements.code }).from(freakAchievements).where(eq(freakAchievements.tokenId, session.tokenId)).all();
      const existing = new Set(granted.map((row) => row.code));
      const oldPoints = achievementPoints(existing);
      const preliminaryScore = calculateCareerScore({
        careerReturn: careerReturn(equityAfter), winRate: winRate(wins, losses), settledSessions: settled,
        maxDrawdown: dd.maxDrawdownPpm / 1_000_000, currentStreak: streak, achievementPoints: oldPoints,
      });
      const preliminaryLevel = transitionCareerLevel(career.careerLevel as CareerLevel, preliminaryScore);
      const hasBeenRekt = career.hasBeenRekt || preliminaryLevel === "REKT";
      const hasBeenWhale = career.hasBeenWhale || preliminaryLevel === "WHALE" || preliminaryLevel === "MARKET_GOD";
      const newlyGranted = evaluateAchievements({
        existing, result, direction: session.direction as Direction, risk: session.riskMode as RiskMode,
        duration: session.duration as SessionDuration, sessionSkill: skill, wins, winningShorts, settledSessions: settled,
        currentStreak: streak, currentLevel: preliminaryLevel, hasBeenRekt, hasBeenWhale,
      });
      const newPoints = oldPoints + achievementPoints(newlyGranted);
      const careerScore = calculateCareerScore({
        careerReturn: careerReturn(equityAfter), winRate: winRate(wins, losses), settledSessions: settled,
        maxDrawdown: dd.maxDrawdownPpm / 1_000_000, currentStreak: streak, achievementPoints: newPoints,
      });
      const level = transitionCareerLevel(career.careerLevel as CareerLevel, careerScore);
      const recent = tx.select({ result: sessions.result }).from(sessions)
        .where(and(eq(sessions.tokenId, session.tokenId), eq(sessions.status, "SETTLED")))
        .orderBy(desc(sessions.settledAt)).limit(2).all()
        .map((row) => row.result as SessionResult);
      const mood = resolveMood([result, ...recent]);
      const now = this.clock.now();

      tx.update(sessions).set({ status: "SETTLED", exitPriceCents: exit.priceCents, exitPriceTimestamp: exit.timestamp,
        rawPnlPpm: calculation.rawPnlPpm, finalPnlPpm: calculation.finalPnlPpm, result, sessionSkill: skill, settledAt: now, updatedAt: now,
      }).where(and(eq(sessions.id, session.id), inArray(sessions.status, ["ACTIVE", "EXPIRED"]))).run();
      tx.insert(priceSnapshots).values({ sessionId: session.id, kind: "EXIT", asset: session.asset, priceCents: exit.priceCents, timestamp: exit.timestamp, source: exit.source }).run();
      tx.update(careerStates).set({ equityCents: equityAfter, equityPeakCents: dd.equityPeakCents, maxDrawdownPpm: dd.maxDrawdownPpm,
        wins, losses, scratches, liquidations, settledSessions: settled, winningShorts, currentStreak: streak,
        bestPnlPpm: career.bestPnlPpm === null ? calculation.finalPnlPpm : Math.max(career.bestPnlPpm, calculation.finalPnlPpm),
        worstPnlPpm: career.worstPnlPpm === null ? calculation.finalPnlPpm : Math.min(career.worstPnlPpm, calculation.finalPnlPpm),
        careerScore, careerLevel: level, mood, lifetimeXp: career.lifetimeXp + xp,
        hasBeenRekt: hasBeenRekt || level === "REKT", hasBeenWhale: hasBeenWhale || level === "WHALE" || level === "MARKET_GOD", updatedAt: now,
      }).where(eq(careerStates.tokenId, session.tokenId)).run();
      tx.update(seasonStates).set({ settledSessions: seasonSettled, skillTotal, rating, xp: season.xp + xp }).where(eq(seasonStates.tokenId, session.tokenId)).run();
      for (const code of newlyGranted) {
        const achievement = ACHIEVEMENTS[code];
        tx.insert(freakAchievements).values({ tokenId: session.tokenId, code, sessionId: session.id, grantedAt: now }).onConflictDoNothing().run();
        gameLog("ACHIEVEMENT_UNLOCKED", { tokenId: session.tokenId, code, name: achievement.name });
      }
      if (level !== career.careerLevel) {
        tx.insert(careerLevelHistory).values({ tokenId: session.tokenId, sessionId: session.id, fromLevel: career.careerLevel, toLevel: level, careerScore, timestamp: now }).run();
        gameLog(CAREER_RANK(level) > CAREER_RANK(career.careerLevel as CareerLevel) ? "CAREER_PROMOTED" : "CAREER_DEMOTED", { tokenId: session.tokenId, from: career.careerLevel, to: level });
      }
      tx.insert(equityHistory).values({ tokenId: session.tokenId, sessionId: session.id, equityBeforeCents: career.equityCents,
        equityAfterCents: equityAfter, careerReturnPpm: Math.round(careerReturn(equityAfter) * 1_000_000),
        drawdownPpm: dd.currentDrawdownPpm, careerScore, careerLevel: level, timestamp: now,
      }).run();
      const settledRow = tx.select().from(sessions).where(eq(sessions.id, session.id)).get();
      gameLog(calculation.liquidated ? "SESSION_LIQUIDATED" : "SESSION_SETTLED", { sessionId, tokenId: session.tokenId, finalPnlPpm: calculation.finalPnlPpm });
      return settledRow;
    });
  }

  async settleExpired() {
    const now = this.clock.now();
    const expired = this.db.select({ id: sessions.id }).from(sessions)
      .where(and(inArray(sessions.status, ["ACTIVE", "EXPIRED"]), lte(sessions.expiresAt, now))).orderBy(asc(sessions.expiresAt)).all();
    const results = [];
    for (const row of expired) results.push(await this.settleSession(row.id));
    return results;
  }
}

const CAREER_RANK = (level: CareerLevel): number => ["REKT", "INTERN", "GRINDER", "PROFITABLE", "WHALE", "MARKET_GOD"].indexOf(level);

export function seedAchievementDefinitions(db: GameDatabase): void {
  for (const [code, item] of Object.entries(ACHIEVEMENTS)) {
    db.insert(achievements).values({ code, ...item }).onConflictDoUpdate({ target: achievements.code, set: item }).run();
  }
}
