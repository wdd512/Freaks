import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import * as schema from "@/db/schema";

export type GameDatabase = BetterSQLite3Database<typeof schema> & { $client: Database.Database };

export function resolveDatabasePath(): string {
  const configured = process.env.DATABASE_PATH;
  return configured
    ? path.resolve(/*turbopackIgnore: true*/ process.cwd(), configured)
    : path.join(process.cwd(), "data", "pnl-freaks.db");
}

export function connectDatabase(filename = resolveDatabasePath()): GameDatabase {
  if (filename !== ":memory:") fs.mkdirSync(path.dirname(filename), { recursive: true });
  const sqlite = new Database(filename);
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("busy_timeout = 5000");
  return drizzle(sqlite, { schema }) as GameDatabase;
}

let singleton: GameDatabase | undefined;
export function getDb(): GameDatabase {
  singleton ??= connectDatabase();
  return singleton;
}

export function migrate(db: GameDatabase): void {
  const sql = fs.readFileSync(path.resolve(process.cwd(), "db/migrations/0000_initial.sql"), "utf8");
  db.$client.exec(sql);
}

export function closeDb(): void {
  singleton?.$client.close();
  singleton = undefined;
}
