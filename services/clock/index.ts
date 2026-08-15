import { eq } from "drizzle-orm";
import type { GameDatabase } from "@/db";
import { gameConfig } from "@/db/schema";

export interface Clock { now(): Date }

export class SystemClock implements Clock {
  now(): Date { return new Date(); }
}

export class DevelopmentClock implements Clock {
  constructor(private readonly db: GameDatabase, private readonly system = new SystemClock()) {}
  now(): Date {
    const row = this.db.select().from(gameConfig).where(eq(gameConfig.key, "clockOffsetMs")).get();
    return new Date(this.system.now().getTime() + Number(row?.value ?? 0));
  }
  advance(milliseconds: number): Date {
    if (!Number.isFinite(milliseconds) || milliseconds < 0 || milliseconds > 30 * 24 * 60 * 60 * 1000) throw new Error("Invalid clock advance");
    const current = this.now();
    const existing = this.db.select().from(gameConfig).where(eq(gameConfig.key, "clockOffsetMs")).get();
    const offset = Number(existing?.value ?? 0) + milliseconds;
    this.db.insert(gameConfig).values({ key: "clockOffsetMs", value: String(offset) }).onConflictDoUpdate({ target: gameConfig.key, set: { value: String(offset) } }).run();
    return new Date(current.getTime() + milliseconds);
  }
  reset(): void { this.db.delete(gameConfig).where(eq(gameConfig.key, "clockOffsetMs")).run(); }
}

export function isDevelopmentTime(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.DEVELOPMENT_TIME_MODE !== "false";
}

export const createClock = (db: GameDatabase): Clock => isDevelopmentTime() ? new DevelopmentClock(db) : new SystemClock();
