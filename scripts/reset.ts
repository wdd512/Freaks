import { connectDatabase } from "@/db";
import { clearDatabase } from "@/db/seed";

const db = connectDatabase();
clearDatabase(db);
db.$client.close();
console.log("Database reset. Run a seed command next.");
