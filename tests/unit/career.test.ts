import { describe, expect, it } from "vitest";
import { applyEquity, calculateCareerScore, transitionCareerLevel, updateDrawdown, updateStreak, winRate } from "@/domain/career/career";
import { resolveMood, seasonRating, sessionXp } from "@/domain/career/progression";

describe("career engine", () => {
  it("updates equity using fixed-point PnL without going negative", () => {
    expect(applyEquity(1_000_000,46_800)).toBe(1_046_800);
    expect(applyEquity(1_000_000,-200_000)).toBe(800_000);
  });
  it("tracks peak, current drawdown, and maximum drawdown", () => {
    expect(updateDrawdown(1_000_000,0,1_100_000)).toEqual({equityPeakCents:1_100_000,currentDrawdownPpm:0,maxDrawdownPpm:0});
    expect(updateDrawdown(1_100_000,50_000,880_000)).toEqual({equityPeakCents:1_100_000,currentDrawdownPpm:200_000,maxDrawdownPpm:200_000});
    expect(updateDrawdown(1_100_000,250_000,990_000).maxDrawdownPpm).toBe(250_000);
  });
  it("uses 50% only as the empty score baseline",()=>{expect(winRate(0,0)).toBe(.5);expect(winRate(3,1)).toBe(.75)});
  it("maintains signed streaks and resets on scratch",()=>{expect(updateStreak(2,"WIN")).toBe(3);expect(updateStreak(-5,"WIN")).toBe(1);expect(updateStreak(3,"LOSS")).toBe(-1);expect(updateStreak(-2,"LIQUIDATED")).toBe(-3);expect(updateStreak(4,"SCRATCH")).toBe(0)});
  it("implements the exact Career Score formula",()=>{
    expect(calculateCareerScore({careerReturn:0,winRate:.5,settledSessions:0,maxDrawdown:0,currentStreak:0,achievementPoints:0})).toBe(340);
    const input={careerReturn:.25,winRate:.58,settledSessions:30,maxDrawdown:.18,currentStreak:3,achievementPoints:20};
    const exact=300+280*Math.tanh(.25/.5)+120*(2*.58-1)*1+100*(.4-.18)+100*(1-Math.exp(-30/40))+8*3+20;
    expect(calculateCareerScore(input)).toBeCloseTo(exact,12);
    expect(calculateCareerScore({careerReturn:-50,winRate:0,settledSessions:100,maxDrawdown:1,currentStreak:-99,achievementPoints:0})).toBe(0);
  });
  it("promotes at thresholds and demotes only 30 points below",()=>{
    expect(transitionCareerLevel("INTERN",400)).toBe("GRINDER");
    expect(transitionCareerLevel("GRINDER",550)).toBe("PROFITABLE");
    expect(transitionCareerLevel("PROFITABLE",520)).toBe("PROFITABLE");
    expect(transitionCareerLevel("PROFITABLE",519.99)).toBe("GRINDER");
    expect(transitionCareerLevel("MARKET_GOD",819.99)).toBe("WHALE");
    expect(transitionCareerLevel("WHALE",200)).toBe("REKT");
    expect(transitionCareerLevel("REKT",900)).toBe("MARKET_GOD");
  });
  it("resolves mood with exact precedence",()=>{
    expect(resolveMood([])).toBe("NEUTRAL");expect(resolveMood(["WIN","WIN","WIN"])).toBe("EUPHORIC");expect(resolveMood(["LOSS","LIQUIDATED","LOSS"])).toBe("MELTDOWN");
    expect(resolveMood(["WIN","SCRATCH","WIN"])).toBe("HAPPY");expect(resolveMood(["LOSS","WIN","LIQUIDATED"])).toBe("TILTED");expect(resolveMood(["WIN","LOSS","SCRATCH"])).toBe("FOCUSED");
  });
  it("awards duration XP plus only positive skill bonus",()=>{expect(sessionXp("1H",1)).toBe(25);expect(sessionXp("4H",.5)).toBe(28);expect(sessionXp("8H",-1)).toBe(30)});
  it("calculates season rating with sample-size damping",()=>{expect(seasonRating(0,0)).toBe(1000);expect(seasonRating(5,10)).toBeCloseTo(1000+400*.5*Math.sqrt(10/30),10)});
});
