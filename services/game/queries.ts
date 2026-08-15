import { and, desc, eq, inArray } from "drizzle-orm";
import type { GameDatabase } from "@/db";
import { careerLevelHistory, careerStates, equityHistory, freakAchievements, freakDna, freaks, seasonStates, sessions } from "@/db/schema";
import { GAME_CONFIG } from "@/domain/config/game-config";
import type { FreakDNA } from "@/domain/types";

export type FreakListItem = ReturnType<typeof listFreaks>[number];

export function listFreaks(db: GameDatabase) {
  const rows = db.select().from(freaks)
    .innerJoin(freakDna, eq(freaks.tokenId, freakDna.tokenId))
    .innerJoin(careerStates, eq(freaks.tokenId, careerStates.tokenId))
    .innerJoin(seasonStates, eq(freaks.tokenId, seasonStates.tokenId)).all();
  const activeTokens = new Set(db.select({ tokenId: sessions.tokenId }).from(sessions).where(inArray(sessions.status, ["ACTIVE", "EXPIRED"])).all().map((row) => row.tokenId));
  return rows.map((row) => ({
    tokenId: row.freaks.tokenId, name: row.freaks.name, personality: row.freaks.personality,
    rarityScore: row.freaks.rarityScore, rarityTier: row.freaks.rarityTier,
    dna: { body: row.freak_dna.body, skin: row.freak_dna.skin, head: row.freak_dna.head, eyes: row.freak_dna.eyes, mouth: row.freak_dna.mouth, hair: row.freak_dna.hair } as FreakDNA,
    equityCents: row.career_states.equityCents,
    careerReturnPpm: Math.round((row.career_states.equityCents / GAME_CONFIG.startingEquityCents - 1) * 1_000_000),
    careerScore: row.career_states.careerScore, careerLevel: row.career_states.careerLevel, mood: row.career_states.mood,
    wins: row.career_states.wins, losses: row.career_states.losses, scratches: row.career_states.scratches,
    liquidations: row.career_states.liquidations, settledSessions: row.career_states.settledSessions,
    currentStreak: row.career_states.currentStreak, maxDrawdownPpm: row.career_states.maxDrawdownPpm,
    lifetimeXp: row.career_states.lifetimeXp, rating: row.season_states.rating,
    averageSkill: row.season_states.settledSessions ? row.season_states.skillTotal / row.season_states.settledSessions : 0,
    active: activeTokens.has(row.freaks.tokenId),
  }));
}

export function getFreak(db: GameDatabase, tokenId: number) {
  const freak = listFreaks(db).find((item) => item.tokenId === tokenId);
  if (!freak) return undefined;
  const history = db.select().from(sessions).where(eq(sessions.tokenId, tokenId)).orderBy(desc(sessions.openedAt)).all();
  const equity = db.select().from(equityHistory).where(eq(equityHistory.tokenId, tokenId)).orderBy(equityHistory.timestamp).all();
  const levels = db.select().from(careerLevelHistory).where(eq(careerLevelHistory.tokenId, tokenId)).orderBy(careerLevelHistory.timestamp).all();
  const unlocked = db.select().from(freakAchievements).where(eq(freakAchievements.tokenId, tokenId)).orderBy(desc(freakAchievements.grantedAt)).all();
  return { ...freak, sessions: history, equityHistory: equity, levelHistory: levels, achievements: unlocked };
}

export function getSession(db: GameDatabase, id: string) {
  const session = db.select().from(sessions).where(eq(sessions.id, id)).get();
  if (!session) return undefined;
  const freak = getFreak(db, session.tokenId);
  return freak ? { session, freak } : undefined;
}

export function getActiveSession(db: GameDatabase, tokenId: number) {
  return db.select().from(sessions).where(and(eq(sessions.tokenId, tokenId), inArray(sessions.status, ["ACTIVE", "EXPIRED"]))).get();
}
