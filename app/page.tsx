import Link from "next/link";
import { FreakArt } from "@/components/freak/FreakArt";
import { formatPercentPpm, formatSim } from "@/components/ui/format";
import type { CareerLevel, Mood } from "@/domain/types";
import { getDb } from "@/db";
import { listFreaks } from "@/services/game/queries";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const freaks = listFreaks(getDb());
  const hero = freaks.find((freak) => freak.tokenId === 1337) ?? freaks[0];
  const leaders = [...freaks].sort((a,b) => b.equityCents - a.equityCents).slice(0,5);
  return <main className="shell">
    <section className="hero"><div><div className="kicker">A SIMULATED TRADER CAREER GAME</div><h1>PNL<br/>FREAKS</h1><p className="hero-copy">4,444 TRADERS. ONE MARKET.<br/>EVERY BAD CALL LEAVES A SCAR.</p><p className="muted">Pick a side. Lock the session. Live with it. Build a glorious—or catastrophic—career in fictional SIM.</p><div className="actions"><Link className="button" href="/terminal">ENTER TERMINAL →</Link><Link className="button secondary" href="/freaks">VIEW FREAKS</Link></div></div>{hero && <div className="hero-art"><FreakArt tokenId={hero.tokenId} dna={hero.dna} careerLevel={hero.careerLevel as CareerLevel} mood={hero.mood as Mood}/></div>}</section>
    <section className="section"><div className="section-heading"><div><div className="kicker">HOW IT GOES WRONG</div><h2>THE LOOP</h2></div></div><div className="stats-grid">{["01 / CHOOSE A FREAK","02 / TAKE A SIDE","03 / LOCK THE SESSION","04 / BUILD A CAREER"].map((item,index)=><div className="stat" key={item}><label>STEP {index+1}</label><strong>{item.split(" / ")[1]}</strong></div>)}</div></section>
    <section className="section"><div className="section-heading"><div><div className="kicker">CAREER PNL</div><h2>LEADERBOARD</h2></div><Link href="/leaderboard" className="muted">VIEW ALL →</Link></div><div className="table-wrap"><table className="data-table"><thead><tr><th>RANK</th><th>FREAK</th><th>LEVEL</th><th>CAREER PNL</th><th>EQUITY</th><th>RATING</th></tr></thead><tbody>{leaders.map((freak,index)=><tr key={freak.tokenId}><td className={`rank-${index+1}`}>#{index+1}</td><td><Link href={`/freaks/${freak.tokenId}`}>#{freak.tokenId} {freak.name}</Link></td><td>{freak.careerLevel}</td><td className={freak.careerReturnPpm>=0?"positive":"negative"}>{formatPercentPpm(freak.careerReturnPpm)}</td><td>{formatSim(freak.equityCents)}</td><td>{Math.round(freak.rating)}</td></tr>)}</tbody></table></div></section>
  </main>;
}
