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
  const migrationsDirectory = path.join(process.cwd(), "db", "migrations");
  const migrationFiles = fs.readdirSync(migrationsDirectory).filter((file) => file.endsWith(".sql")).sort();
  db.$client.exec("CREATE TABLE IF NOT EXISTS _game_migrations (name TEXT PRIMARY KEY, applied_at INTEGER NOT NULL)");
  const applied = new Set(
    (db.$client.prepare("SELECT name FROM _game_migrations").all() as { name: string }[]).map((row) => row.name),
  );
  for (const file of migrationFiles) {
    if (applied.has(file)) continue;
    const migrationSql = fs.readFileSync(path.join(migrationsDirectory, file), "utf8");
    db.$client.transaction(() => {
      db.$client.exec(migrationSql);
      db.$client.prepare("INSERT INTO _game_migrations (name, applied_at) VALUES (?, ?)").run(file, Date.now());
    })();
  }
}

export function closeDb(): void {
  singleton?.$client.close();
  singleton = undefined;
}
