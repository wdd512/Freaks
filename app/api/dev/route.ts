import { asc, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { seedDatabase, type SeedMode } from "@/db/seed";
import { gameConfig, sessions } from "@/db/schema";
import { MARKET_SCENARIOS, type MarketScenario } from "@/domain/types";
import { DevelopmentClock } from "@/services/clock";
import { gameContext } from "@/services/game/context";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Development controls are disabled" }, { status: 404 });
  try {
    const body = await request.json() as { action?: string; value?: unknown };
    const context = gameContext();
    const devClock = context.clock instanceof DevelopmentClock ? context.clock : new DevelopmentClock(context.db);
    if (body.action === "scenario") {
      if (!MARKET_SCENARIOS.includes(body.value as MarketScenario)) throw new Error("Invalid scenario");
      context.db.insert(gameConfig).values({ key: "marketScenario", value: String(body.value) }).onConflictDoUpdate({ target: gameConfig.key, set: { value: String(body.value) } }).run();
      return NextResponse.json({ ok: true, scenario: body.value });
    }
    if (body.action === "advance") {
      const seconds = Number(body.value);
      return NextResponse.json({ ok: true, now: devClock.advance(seconds * 1000) });
    }
    if (body.action === "align-crash") {
      const nowSeconds = Math.floor(devClock.now().getTime() / 1000);
      const cycleSecond = ((nowSeconds % 900) + 900) % 900;
      const advanceSeconds = (370 - cycleSecond + 900) % 900;
      return NextResponse.json({ ok: true, now: devClock.advance(advanceSeconds * 1000) });
    }
    if (body.action === "finish") {
      const next = context.db.select().from(sessions).where(inArray(sessions.status, ["ACTIVE", "EXPIRED"])).orderBy(asc(sessions.expiresAt)).get();
      if (next) devClock.advance(Math.max(0, next.expiresAt.getTime() - devClock.now().getTime() + 10_000));
      const settled = await gameContext().sessions.settleExpired();
      return NextResponse.json({ ok: true, settled: settled.length, sessionId: settled[0]?.id });
    }
    if (body.action === "settle") {
      const settled = await context.sessions.settleExpired();
      return NextResponse.json({ ok: true, settled: settled.length });
    }
    if (body.action === "seed") {
      const mode = body.value as SeedMode;
      if (mode !== "fresh" && mode !== "demo") throw new Error("Invalid seed mode");
      seedDatabase(context.db, mode);
      return NextResponse.json({ ok: true, mode });
    }
    if (body.action === "reset-clock") {
      devClock.reset();
      return NextResponse.json({ ok: true });
    }
    throw new Error("Unknown development action");
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Development action failed" }, { status: 400 });
  }
}
