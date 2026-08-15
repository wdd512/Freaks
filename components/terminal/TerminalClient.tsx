"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FreakArt } from "@/components/freak/FreakArt";
import { formatPercentPpm, formatPrice, formatSim, labelize, timeLeft } from "@/components/ui/format";
import type { FreakListItem } from "@/services/game/queries";
import type { Asset, CareerLevel, Direction, MarketScenario, Mood, RiskMode, SessionDuration } from "@/domain/types";
import { MARKET_SCENARIOS } from "@/domain/types";

type ApiSession = {
  id:string; tokenId:number; asset:Asset; direction:Direction; riskMode:RiskMode; duration:SessionDuration; status:string;
  entryPriceCents:number; entryPriceTimestamp:string; openedAt:string; expiresAt:string; exitPriceCents:number|null;
  finalPnlPpm:number|null; result:string|null;
};
type StatePayload = {
  now:string; scenario:MarketScenario; development:boolean; freaks:FreakListItem[]; selectedTokenId:number;
  active:ApiSession|null; latestSession:ApiSession|null; prices:Record<Asset,{priceCents:number;timestamp:string;source:string}>;
};

const RISKS:RiskMode[]=["SAFE","NORMAL","DEGEN","FULL_SEND"];
const RISK_LABEL:Record<RiskMode,string>={SAFE:"SAFE ×0.75",NORMAL:"NORMAL ×1",DEGEN:"DEGEN ×1.5",FULL_SEND:"FULL SEND ×2"};

export function TerminalClient({ initialTokenId }: { initialTokenId?: number }) {
  const router=useRouter();
  const [tokenId,setTokenId]=useState(initialTokenId??0),[state,setState]=useState<StatePayload>(),[asset,setAsset]=useState<Asset>("BTC"),[direction,setDirection]=useState<Direction>("LONG"),[risk,setRisk]=useState<RiskMode>("NORMAL"),[duration,setDuration]=useState<SessionDuration>("1H"),[error,setError]=useState(""),[busy,setBusy]=useState(false),[tick,setTick]=useState(0);
  const selected=state?.freaks.find(f=>f.tokenId===state.selectedTokenId);
  const active=state?.active;

  const load = useCallback(async (id=tokenId) => {
    const response=await fetch(`/api/state${id?`?tokenId=${id}`:""}`,{cache:"no-store"});
    if(!response.ok) throw new Error("Could not load terminal state");
    const payload=await response.json() as StatePayload;
    setState(payload); setTick(new Date(payload.now).getTime()); if(!id) setTokenId(payload.selectedTokenId);
  }, [tokenId]);
  useEffect(()=>{
    // The effect synchronizes this client terminal with the server-owned game state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(tokenId).catch(err=>setError(err instanceof Error?err.message:"Load failed"));
    const timer=setInterval(()=>{setTick(Date.now());void load(tokenId);},5000);
    return()=>clearInterval(timer);
  },[load,tokenId]);

  async function openSession(){setBusy(true);setError("");try{const response=await fetch("/api/sessions/open",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tokenId:state?.selectedTokenId,asset,direction,riskMode:risk,duration})});const result=await response.json() as {error?:string};if(!response.ok)throw new Error(result.error??"Open failed");await load();}catch(err){setError(err instanceof Error?err.message:"Open failed");}finally{setBusy(false)}}
  async function settle(){if(!active)return;setBusy(true);setError("");try{const response=await fetch(`/api/sessions/${active.id}/settle`,{method:"POST"});const result=await response.json() as {error?:string};if(!response.ok)throw new Error(result.error??"Settlement failed");router.push(`/share/${active.id}`);}catch(err){setError(err instanceof Error?err.message:"Settlement failed");}finally{setBusy(false)}}
  async function devAction(action:string,value?:unknown){setBusy(true);setError("");try{const response=await fetch("/api/dev",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,value})});const result=await response.json() as {error?:string;sessionId?:string};if(!response.ok)throw new Error(result.error??"Dev action failed");if(action==="finish"&&result.sessionId)router.push(`/share/${result.sessionId}`);else await load();}catch(err){setError(err instanceof Error?err.message:"Dev action failed");}finally{setBusy(false)}}
  const currentPrice=active&&state?state.prices[active.asset].priceCents:0;
  const underlyingPpm=active?Math.round((currentPrice/active.entryPriceCents-1)*1_000_000):0;
  const expired=active?new Date(active.expiresAt).getTime()<=new Date(state?.now??tick).getTime():false;
  if(!state||!selected)return <div className="empty">BOOTING TERMINAL_</div>;
  return <div className="terminal-layout">
    <aside className="panel terminal-character"><FreakArt tokenId={selected.tokenId} dna={selected.dna} careerLevel={selected.careerLevel as CareerLevel} mood={selected.mood as Mood} active={Boolean(active)}/><div><select aria-label="Selected Freak" value={state.selectedTokenId} onChange={e=>setTokenId(Number(e.target.value))} style={{width:"100%",background:"#080d0c",border:"1px solid var(--line)",padding:10,color:"var(--ink)"}}>{state.freaks.map(f=><option value={f.tokenId} key={f.tokenId}>#{f.tokenId} {f.name}{f.active?" • ACTIVE":""}</option>)}</select><div className="stat-line"><span>LEVEL</span><strong>{labelize(selected.careerLevel)}</strong></div><div className="stat-line"><span>MOOD</span><strong>{selected.mood}</strong></div><div className="stat-line"><span>EQUITY</span><strong>{formatSim(selected.equityCents)}</strong></div><div className="stat-line"><span>CAREER</span><strong className={selected.careerReturnPpm>=0?"positive":"negative"}>{formatPercentPpm(selected.careerReturnPpm)}</strong></div><div className="stat-line"><span>SCORE / RTG</span><strong>{Math.round(selected.careerScore)} / {Math.round(selected.rating)}</strong></div></div></aside>
    <section className="panel terminal-main"><div className="kicker">{`MARKET TERMINAL // ${state.scenario}`}</div><h1>{active?"POSITION LOCKED":"OPEN A SESSION"}</h1>{error&&<div className="error">{error}</div>}
      {active?<div className="session-screen"><div className="eyebrow"><span>FREAK #{selected.tokenId}</span><span>{active.status}</span></div><h2 style={{fontSize:32,marginTop:14}}>{active.asset} {active.direction}<br/><span className="muted">{RISK_LABEL[active.riskMode]} · {active.duration}</span></h2><div className="session-grid"><div className="stat"><label>ENTRY</label><strong>{formatPrice(active.entryPriceCents)}</strong></div><div className="stat"><label>CURRENT</label><strong>{formatPrice(currentPrice)}</strong></div><div className="stat"><label>UNDERLYING MOVE</label><strong className={underlyingPpm>=0?"positive":"negative"}>{formatPercentPpm(underlyingPpm)}</strong></div><div className="stat"><label>TIME LEFT</label><strong>{timeLeft(active.expiresAt,tick)}</strong></div></div><div className="locked">{"SESSION LOCKED // LIVE WITH IT"}</div>{expired&&<button className="button" style={{width:"100%",marginTop:14}} onClick={()=>void settle()} disabled={busy}>SETTLE AT EXPIRY PRICE</button>}</div>
      :<><label className="terminal-label">MARKET</label><div className="option-grid cols-2">{(["BTC","ETH"] as Asset[]).map(v=><button className={`option ${asset===v?"selected":""}`} key={v} onClick={()=>setAsset(v)}>{v}<br/><small>{formatPrice(state.prices[v].priceCents)}</small></button>)}</div><label className="terminal-label">DIRECTION</label><div className="option-grid cols-2">{(["LONG","SHORT"] as Direction[]).map(v=><button className={`option ${v.toLowerCase()} ${direction===v?"selected":""}`} key={v} onClick={()=>setDirection(v)}>{v}</button>)}</div><label className="terminal-label">RISK</label><div className="option-grid">{RISKS.map(v=><button className={`option risk ${risk===v?"selected":""}`} key={v} onClick={()=>setRisk(v)}>{RISK_LABEL[v]}</button>)}</div><label className="terminal-label">DURATION</label><div className="option-grid">{(["1H","4H","8H"] as SessionDuration[]).map(v=><button className={`option ${duration===v?"selected":""}`} key={v} onClick={()=>setDuration(v)}>{v}</button>)}</div><div className="order-summary">{`FREAK #${selected.tokenId} // ${asset} ${direction}`}<br/>{`${RISK_LABEL[risk]} // ${duration}`}<br/>NO EARLY CLOSE. ENTRY AND EXIT PRICES ARE SERVER-OWNED. NO PROJECTED PROFIT.</div><button data-testid="open-session" className="button" style={{width:"100%"}} onClick={()=>void openSession()} disabled={busy}>{busy?"LOCKING_":"OPEN SESSION"}</button></>}
    </section>
    <aside className="terminal-side"><div className="panel"><div className="panel-title">MARKET TAPE</div>{(["BTC","ETH"] as Asset[]).map(v=><div className="stat-line" key={v}><span>{v} / SIM</span><strong>{formatPrice(state.prices[v].priceCents)}</strong></div>)}<p className="muted" style={{fontSize:10,marginTop:18}}>DETERMINISTIC MOCK FEED<br/>{state.prices.BTC.source}</p></div>{state.development&&<details className="panel dev-panel" style={{marginTop:16}} open><summary>⚠ DEV ONLY CONTROLS</summary><div className="dev-actions"><select value={state.scenario} onChange={e=>void devAction("scenario",e.target.value)}>{MARKET_SCENARIOS.map(s=><option key={s}>{s}</option>)}</select><button onClick={()=>void devAction("advance",60)} disabled={busy}>ADVANCE 60S</button><button data-testid="finish-session" onClick={()=>void devAction("finish")} disabled={busy||!active}>FINISH + SETTLE</button><button onClick={()=>void devAction("settle")} disabled={busy}>SETTLE EXPIRED</button><button onClick={()=>void devAction("seed","demo")} disabled={busy}>RESET + DEMO SEED</button><button onClick={()=>void devAction("seed","fresh")} disabled={busy}>RESET + FRESH SEED</button><button onClick={()=>void devAction("reset-clock")} disabled={busy}>RESET CLOCK</button></div></details>}</aside>
  </div>;
}
