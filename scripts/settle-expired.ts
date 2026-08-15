import { connectDatabase } from "@/db";
import { createClock } from "@/services/clock";
import { createMarketProvider } from "@/services/market-data";
import { SessionService } from "@/services/settlement/session-service";

const db = connectDatabase();
const clock = createClock(db);
const service = new SessionService(db, createMarketProvider(clock), clock);
const settled = await service.settleExpired();
for (const session of settled) console.log(`${session?.id}: ${session?.result} ${session?.finalPnlPpm}ppm`);
console.log(`Settled ${settled.length} expired session(s).`);
db.$client.close();
