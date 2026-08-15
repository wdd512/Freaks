import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const freaks = sqliteTable("freaks", {
  tokenId: integer("token_id").primaryKey(),
  name: text("name").notNull(),
  personality: text("personality").notNull(),
  rarityScore: real("rarity_score").notNull(),
  rarityTier: text("rarity_tier").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const freakDna = sqliteTable("freak_dna", {
  tokenId: integer("token_id").primaryKey().references(() => freaks.tokenId, { onDelete: "cascade" }),
  body: text("body").notNull(), skin: text("skin").notNull(), head: text("head").notNull(),
  eyes: text("eyes").notNull(), mouth: text("mouth").notNull(), hair: text("hair").notNull(),
  dnaHash: text("dna_hash").notNull().unique(),
});

export const careerStates = sqliteTable("career_states", {
  tokenId: integer("token_id").primaryKey().references(() => freaks.tokenId, { onDelete: "cascade" }),
  equityCents: integer("equity_cents").notNull(),
  equityPeakCents: integer("equity_peak_cents").notNull(),
  maxDrawdownPpm: integer("max_drawdown_ppm").notNull().default(0),
  wins: integer("wins").notNull().default(0), losses: integer("losses").notNull().default(0),
  scratches: integer("scratches").notNull().default(0), liquidations: integer("liquidations").notNull().default(0),
  settledSessions: integer("settled_sessions").notNull().default(0),
  winningShorts: integer("winning_shorts").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  bestPnlPpm: integer("best_pnl_ppm"), worstPnlPpm: integer("worst_pnl_ppm"),
  careerScore: real("career_score").notNull(), careerLevel: text("career_level").notNull(),
  mood: text("mood").notNull(), lifetimeXp: integer("lifetime_xp").notNull().default(0),
  hasBeenRekt: integer("has_been_rekt", { mode: "boolean" }).notNull().default(false),
  hasBeenWhale: integer("has_been_whale", { mode: "boolean" }).notNull().default(false),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const seasonStates = sqliteTable("season_states", {
  tokenId: integer("token_id").primaryKey().references(() => freaks.tokenId, { onDelete: "cascade" }),
  seasonId: text("season_id").notNull().default("V0"),
  settledSessions: integer("settled_sessions").notNull().default(0),
  skillTotal: real("skill_total").notNull().default(0),
  rating: real("rating").notNull().default(1000),
  xp: integer("xp").notNull().default(0),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  tokenId: integer("token_id").notNull().references(() => freaks.tokenId, { onDelete: "cascade" }),
  asset: text("asset").notNull(), direction: text("direction").notNull(), riskMode: text("risk_mode").notNull(),
  duration: text("duration").notNull(), status: text("status").notNull(),
  entryPriceCents: integer("entry_price_cents").notNull(),
  entryPriceTimestamp: integer("entry_price_timestamp", { mode: "timestamp_ms" }).notNull(),
  openedAt: integer("opened_at", { mode: "timestamp_ms" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  exitPriceCents: integer("exit_price_cents"),
  exitPriceTimestamp: integer("exit_price_timestamp", { mode: "timestamp_ms" }),
  rawPnlPpm: integer("raw_pnl_ppm"), finalPnlPpm: integer("final_pnl_ppm"),
  result: text("result"), sessionSkill: real("session_skill"),
  settledAt: integer("settled_at", { mode: "timestamp_ms" }),
  failureReason: text("failure_reason"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const priceSnapshots = sqliteTable("price_snapshots", {
  id: integer("id").primaryKey({ autoIncrement: true }), sessionId: text("session_id").notNull().references(() => sessions.id),
  kind: text("kind").notNull(), asset: text("asset").notNull(), priceCents: integer("price_cents").notNull(),
  timestamp: integer("timestamp", { mode: "timestamp_ms" }).notNull(), source: text("source").notNull(),
});

export const achievements = sqliteTable("achievements", {
  code: text("code").primaryKey(), name: text("name").notNull(), description: text("description").notNull(), points: integer("points").notNull(),
});

export const freakAchievements = sqliteTable("freak_achievements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tokenId: integer("token_id").notNull().references(() => freaks.tokenId, { onDelete: "cascade" }),
  code: text("code").notNull().references(() => achievements.code),
  sessionId: text("session_id").references(() => sessions.id),
  grantedAt: integer("granted_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => ({ uniqueGrant: uniqueIndex("freak_achievement_unique").on(table.tokenId, table.code) }));

export const careerLevelHistory = sqliteTable("career_level_history", {
  id: integer("id").primaryKey({ autoIncrement: true }), tokenId: integer("token_id").notNull().references(() => freaks.tokenId),
  sessionId: text("session_id").references(() => sessions.id), fromLevel: text("from_level"), toLevel: text("to_level").notNull(),
  careerScore: real("career_score").notNull(), timestamp: integer("timestamp", { mode: "timestamp_ms" }).notNull(),
});

export const equityHistory = sqliteTable("equity_history", {
  id: integer("id").primaryKey({ autoIncrement: true }), tokenId: integer("token_id").notNull().references(() => freaks.tokenId),
  sessionId: text("session_id").references(() => sessions.id), equityBeforeCents: integer("equity_before_cents").notNull(),
  equityAfterCents: integer("equity_after_cents").notNull(), careerReturnPpm: integer("career_return_ppm").notNull(),
  drawdownPpm: integer("drawdown_ppm").notNull(), careerScore: real("career_score").notNull(), careerLevel: text("career_level").notNull(),
  timestamp: integer("timestamp", { mode: "timestamp_ms" }).notNull(),
}, (table) => ({ onePerSession: uniqueIndex("equity_history_session_unique").on(table.sessionId) }));

export const gameConfig = sqliteTable("game_config", { key: text("key").primaryKey(), value: text("value").notNull() });
