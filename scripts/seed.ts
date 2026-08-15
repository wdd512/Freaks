import { connectDatabase } from "@/db";
import { seedDatabase, type SeedMode } from "@/db/seed";

const mode = (process.argv[2] ?? "demo") as SeedMode;
if (mode !== "fresh" && mode !== "demo") throw new Error("Usage: npm run seed:fresh or npm run seed:demo");
const db = connectDatabase();
seedDatabase(db, mode);
db.$client.close();
console.log(`Seeded 20 Freaks in ${mode} mode.`);
