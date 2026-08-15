import { getDb } from "@/db";
import { FreakBrowser } from "@/components/freak/FreakBrowser";
import { listFreaks } from "@/services/game/queries";

export const dynamic = "force-dynamic";
export default function FreaksPage() { const freaks=listFreaks(getDb()); return <main className="shell"><div className="section-heading"><div><div className="kicker">20 SEEDED DEGENERATES</div><h1 className="page-title">FREAK BROWSER</h1></div></div><FreakBrowser freaks={freaks}/></main>; }
