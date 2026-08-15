import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ART_PROBLEM_FLAGS, type ArtProblemFlagMap } from "@/art/qa/problem-flags";
import { MINI_COLLECTION_V1_COUNT, MINI_COLLECTION_V1_SEED } from "@/art/qa/mini-collection";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const FLAG_FILE = path.resolve(process.cwd(), "data", "art-lab-flags.json");
const updateSchema = z.object({
  tokenId: z.number().int().min(1).max(MINI_COLLECTION_V1_COUNT),
  flag: z.enum(ART_PROBLEM_FLAGS).nullable(),
});
const fileSchema = z.object({
  version: z.literal(1),
  seed: z.literal(MINI_COLLECTION_V1_SEED),
  flags: z.record(z.string(), z.enum(ART_PROBLEM_FLAGS)),
});

type FlagFile = z.infer<typeof fileSchema>;

function emptyFlagFile(): FlagFile {
  return { version: 1, seed: MINI_COLLECTION_V1_SEED, flags: {} };
}

async function readFlagFile(): Promise<FlagFile> {
  try {
    return fileSchema.parse(JSON.parse(await readFile(FLAG_FILE, "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptyFlagFile();
    throw error;
  }
}

function devOnly(): NextResponse | undefined {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Art flags are available only in development" }, { status: 404 });
}

export async function GET() {
  const blocked = devOnly();
  if (blocked) return blocked;
  try {
    return NextResponse.json(await readFlagFile(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not read art flags" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const blocked = devOnly();
  if (blocked) return blocked;
  try {
    const update = updateSchema.parse(await request.json());
    const current = await readFlagFile();
    const flags: ArtProblemFlagMap = { ...current.flags };
    if (update.flag === null) delete flags[String(update.tokenId)];
    else flags[String(update.tokenId)] = update.flag;
    const next: FlagFile = { ...current, flags };
    await mkdir(path.dirname(FLAG_FILE), { recursive: true });
    await writeFile(FLAG_FILE, `${JSON.stringify(next, null, 2)}\n`, "utf8");
    return NextResponse.json(next, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update art flag" }, { status: 400 });
  }
}

