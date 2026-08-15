import { NextResponse } from "next/server";
import { gameContext } from "@/services/game/context";

export async function POST(_request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;
    const session = await gameContext().sessions.settleSession(sessionId);
    return NextResponse.json({ session });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to settle session" }, { status: 400 });
  }
}
