import Link from "next/link";
import type { FreakListItem } from "@/services/game/queries";
import type { CareerLevel, Mood } from "@/domain/types";
import { FreakArt } from "@/components/freak/FreakArt";
import { formatPercentPpm, labelize } from "@/components/ui/format";

export function FreakCard({ freak, terminal = false }: { freak: FreakListItem; terminal?: boolean }) {
  return (
    <article className="freak-card">
      <Link href={`/freaks/${freak.tokenId}`}><FreakArt tokenId={freak.tokenId} dna={freak.dna} careerLevel={freak.careerLevel as CareerLevel} mood={freak.mood as Mood} active={freak.active}/></Link>
      <div className="card-copy">
        <div className="eyebrow"><span>#{freak.tokenId}</span><span className={`rarity rarity-${freak.rarityTier.toLowerCase()}`}>{freak.rarityTier}</span></div>
        <h3><Link href={`/freaks/${freak.tokenId}`}>{freak.name}</Link></h3>
        <p>{labelize(freak.personality)} · {labelize(freak.careerLevel)}</p>
        <div className="stat-line"><strong className={freak.careerReturnPpm >= 0 ? "positive" : "negative"}>{formatPercentPpm(freak.careerReturnPpm)}</strong><span>RTG {Math.round(freak.rating)}</span></div>
        {terminal && <Link className="button small" href={`/terminal?tokenId=${freak.tokenId}`}>{freak.active ? "VIEW SESSION" : "TRADE"}</Link>}
      </div>
    </article>
  );
}
