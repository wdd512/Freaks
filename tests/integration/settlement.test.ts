import { beforeEach, describe, expect, it } from "vitest";
import { connectDatabase, migrate, type GameDatabase } from "@/db";
import { seedDatabase } from "@/db/seed";
import { careerStates, equityHistory, freakAchievements, sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Asset, MarketPrice } from "@/domain/types";
import type { Clock } from "@/services/clock";
import type { MarketDataProvider } from "@/services/market-data";
import { SessionService } from "@/services/settlement/session-service";

class FixedClock implements Clock { constructor(public current=new Date("2026-01-01T00:00:00Z")){} now(){return new Date(this.current)} advance(ms:number){this.current=new Date(this.current.getTime()+ms)} }
class FixedMarket implements MarketDataProvider { public settlementTargets:Date[]=[]; constructor(public entry=100_000,public exit=110_000){} price(asset:Asset,value:number,time:Date):MarketPrice{return{asset,priceCents:value,timestamp:new Date(Math.ceil(time.getTime()/10000)*10000),source:"TEST"}} getCurrentPrice(asset:Asset){return Promise.resolve(this.price(asset,this.entry,new Date("2026-01-01T00:00:00Z")))} getSettlementPrice(asset:Asset,target:Date){this.settlementTargets.push(target);return Promise.resolve(this.price(asset,this.exit,target))} }
let db:GameDatabase,clock:FixedClock,market:FixedMarket,service:SessionService;
beforeEach(()=>{db=connectDatabase(":memory:");migrate(db);seedDatabase(db,"fresh","integration");clock=new FixedClock();market=new FixedMarket();service=new SessionService(db,market,clock)});

describe("session lifecycle integration",()=>{
  it("opens, expires, and settles atomically using the expiry price",async()=>{const opened=await service.openSession({tokenId:7,asset:"BTC",direction:"LONG",riskMode:"NORMAL",duration:"1H"});expect(opened?.status).toBe("ACTIVE");clock.advance(61_000);const settled=await service.settleSession(opened!.id);expect(settled?.result).toBe("WIN");expect(settled?.finalPnlPpm).toBeGreaterThan(0);expect(market.settlementTargets[0]).toEqual(opened?.expiresAt);expect(db.select().from(equityHistory).where(eq(equityHistory.sessionId,opened!.id)).all()).toHaveLength(1)});
  it("blocks a second active session and settling before expiry",async()=>{const opened=await service.openSession({tokenId:7,asset:"BTC",direction:"LONG",riskMode:"NORMAL",duration:"1H"});await expect(service.openSession({tokenId:7,asset:"ETH",direction:"SHORT",riskMode:"SAFE",duration:"4H"})).rejects.toThrow("active session");await expect(service.settleSession(opened!.id)).rejects.toThrow("not expired")});
  it("is idempotent under duplicate settlement attempts",async()=>{const opened=await service.openSession({tokenId:7,asset:"BTC",direction:"LONG",riskMode:"NORMAL",duration:"1H"});clock.advance(61_000);await Promise.all([service.settleSession(opened!.id),service.settleSession(opened!.id)]);const career=db.select().from(careerStates).where(eq(careerStates.tokenId,7)).get();expect(career?.settledSessions).toBe(1);expect(db.select().from(equityHistory).where(eq(equityHistory.sessionId,opened!.id)).all()).toHaveLength(1);const grants=db.select().from(freakAchievements).where(eq(freakAchievements.tokenId,7)).all();expect(new Set(grants.map(grant=>grant.code)).size).toBe(grants.length)});
  it("late clicks cannot change predetermined settlement time",async()=>{const opened=await service.openSession({tokenId:7,asset:"BTC",direction:"LONG",riskMode:"NORMAL",duration:"1H"});clock.advance(3_600_000);await service.settleSession(opened!.id);expect(market.settlementTargets[0].getTime()).toBe(opened!.expiresAt.getTime())});
  it("market-data failure leaves career and session untouched",async()=>{const opened=await service.openSession({tokenId:7,asset:"BTC",direction:"LONG",riskMode:"NORMAL",duration:"1H"});clock.advance(61_000);market.exit=-1;await expect(service.settleSession(opened!.id)).rejects.toThrow("Invalid settlement");expect(db.select().from(careerStates).where(eq(careerStates.tokenId,7)).get()?.settledSessions).toBe(0);expect(db.select().from(sessions).where(eq(sessions.id,opened!.id)).get()?.status).toBe("ACTIVE")});
});
