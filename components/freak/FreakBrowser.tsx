"use client";

import { useMemo, useState } from "react";
import { FreakCard } from "@/components/freak/FreakCard";
import type { FreakListItem } from "@/services/game/queries";

export function FreakBrowser({ freaks }: { freaks: FreakListItem[] }) {
  const [level,setLevel]=useState("ALL"), [personality,setPersonality]=useState("ALL"), [rarity,setRarity]=useState("ALL"), [activity,setActivity]=useState("ALL"), [sort,setSort]=useState("TOKEN");
  const shown = useMemo(() => freaks.filter((freak) =>
    (level === "ALL" || freak.careerLevel === level) && (personality === "ALL" || freak.personality === personality) &&
    (rarity === "ALL" || freak.rarityTier === rarity) && (activity === "ALL" || freak.active === (activity === "ACTIVE"))
  ).sort((a,b) => sort === "PNL" ? b.careerReturnPpm-a.careerReturnPpm : sort === "SCORE" ? b.careerScore-a.careerScore : sort === "RATING" ? b.rating-a.rating : sort === "RARITY" ? b.rarityScore-a.rarityScore : a.tokenId-b.tokenId),[freaks,level,personality,rarity,activity,sort]);
  const options = (values:string[]) => ["ALL",...values];
  return <><div className="controls"><select aria-label="Career level" value={level} onChange={e=>setLevel(e.target.value)}>{options([...new Set(freaks.map(f=>f.careerLevel))]).map(v=><option key={v}>{v}</option>)}</select><select aria-label="Personality" value={personality} onChange={e=>setPersonality(e.target.value)}>{options([...new Set(freaks.map(f=>f.personality))]).map(v=><option key={v}>{v}</option>)}</select><select aria-label="Rarity" value={rarity} onChange={e=>setRarity(e.target.value)}>{options([...new Set(freaks.map(f=>f.rarityTier))]).map(v=><option key={v}>{v}</option>)}</select><select aria-label="Activity" value={activity} onChange={e=>setActivity(e.target.value)}><option>ALL</option><option>ACTIVE</option><option>INACTIVE</option></select><select aria-label="Sort" value={sort} onChange={e=>setSort(e.target.value)}><option value="TOKEN">TOKEN ID</option><option value="PNL">CAREER PNL</option><option value="SCORE">CAREER SCORE</option><option value="RATING">RATING</option><option value="RARITY">RARITY</option></select></div><p className="muted">{shown.length} FREAKS FOUND</p><div className="freak-grid">{shown.map(freak=><FreakCard key={freak.tokenId} freak={freak} terminal/>)}</div></>;
}
