import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { getSession } from "@/services/game/queries";
import { ShareCard } from "@/components/session/ShareCard";

export const dynamic="force-dynamic";
export default async function SharePage({params}:{params:Promise<{sessionId:string}>}){const {sessionId}=await params;const data=getSession(getDb(),sessionId);if(!data)notFound();return <main className="share-shell"><div><ShareCard data={data}/><div className="actions" style={{justifyContent:"center"}}><Link className="button secondary" href={`/freaks/${data.freak.tokenId}`}>VIEW CAREER</Link><Link className="button" href={`/terminal?tokenId=${data.freak.tokenId}`}>TRADE AGAIN</Link></div></div></main>}
