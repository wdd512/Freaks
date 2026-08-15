import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { gameConfig } from "@/db/schema";
import type { MarketScenario } from "@/domain/types";
import { createClock } from "@/services/clock";
import { createMarketProvider, selectedScenario } from "@/services/market-data";
import { SessionService } from "@/services/settlement/session-service";

export function gameContext() {
  const db = getDb();
  const clock = createClock(db);
  const stored = db.select().from(gameConfig).where(eq(gameConfig.key, "marketScenario")).get()?.value;
  const scenario = selectedScenario(stored) as MarketScenario;
  const market = createMarketProvider(clock, scenario);
  return { db, clock, market, scenario, sessions: new SessionService(db, market, clock) };
}
