import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { sessions } from "@/db/schema";
import { listFreaks, getActiveSession } from "@/services/game/queries";
import { gameContext } from "@/services/game/context";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { db, clock, market, scenario } = gameContext();
  const url = new URL(request.url);
  const tokenId = Number(url.searchParams.get("tokenId") ?? 0);
  const freaks = listFreaks(db);
  const selected = freaks.find((freak) => freak.tokenId === tokenId) ?? freaks[0];
  const active = selected ? getActiveSession(db, selected.tokenId) : undefined;
  const latestSession = selected ? db.select().from(sessions).where(eq(sessions.tokenId, selected.tokenId)).orderBy(desc(sessions.openedAt)).get() : undefined;
  const [btc, eth] = await Promise.all([market.getCurrentPrice("BTC"), market.getCurrentPrice("ETH")]);
  return NextResponse.json({ now: clock.now(), scenario, development: process.env.NODE_ENV !== "production", freaks, selectedTokenId: selected?.tokenId, active, latestSession, prices: { BTC: btc, ETH: eth } });
}
