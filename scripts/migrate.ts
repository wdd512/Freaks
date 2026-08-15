import { connectDatabase, migrate } from "@/db";

const db = connectDatabase();
migrate(db);
db.$client.close();
console.log("Database migrated.");
