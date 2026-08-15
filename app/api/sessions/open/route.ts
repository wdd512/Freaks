import { NextResponse } from "next/server";
import { gameContext } from "@/services/game/context";

export async function POST(request: Request) {
  try {
    const body = await request.json() as unknown;
    const session = await gameContext().sessions.openSession(body as never);
    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to open session" }, { status: 400 });
  }
}
