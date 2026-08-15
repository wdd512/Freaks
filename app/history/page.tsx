import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { freaks, sessions } from "@/db/schema";
import { formatPercentPpm, formatPrice } from "@/components/ui/format";

export const dynamic="force-dynamic";
export default function HistoryPage(){const rows=getDb().select({session:sessions,name:freaks.name}).from(sessions).innerJoin(freaks,eq(sessions.tokenId,freaks.tokenId)).orderBy(desc(sessions.openedAt)).limit(100).all();return <main className="shell"><div className="section-heading"><div><div className="kicker">COMPLETE TAPE</div><h1 className="page-title">CAREER HISTORY</h1></div></div>{rows.length?<div className="table-wrap"><table className="data-table"><thead><tr><th>FREAK</th><th>OPENED</th><th>POSITION</th><th>RISK</th><th>ENTRY</th><th>EXIT</th><th>RESULT</th><th>PNL</th></tr></thead><tbody>{rows.map(({session,name})=><tr key={session.id}><td><Link href={`/freaks/${session.tokenId}`}>#{session.tokenId} {name}</Link></td><td>{session.openedAt.toLocaleString()}</td><td>{session.asset} {session.direction} · {session.duration}</td><td>{session.riskMode}</td><td>{formatPrice(session.entryPriceCents)}</td><td>{session.exitPriceCents?formatPrice(session.exitPriceCents):"LOCKED"}</td><td className={session.result==="WIN"?"positive":session.result?"negative":""}>{session.result??session.status}</td><td>{session.finalPnlPpm===null?"—":formatPercentPpm(session.finalPnlPpm)}</td></tr>)}</tbody></table></div>:<div className="empty">NO HISTORY. THE MARKET IS WAITING.</div>}</main>}
