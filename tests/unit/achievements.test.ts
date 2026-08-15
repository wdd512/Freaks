import { describe, expect, it } from "vitest";
import { achievementPoints, evaluateAchievements } from "@/domain/achievement/achievements";

const base={existing:new Set<string>(),result:"WIN" as const,direction:"LONG" as const,risk:"NORMAL" as const,duration:"1H" as const,sessionSkill:0,wins:1,winningShorts:0,settledSessions:1,currentStreak:1,currentLevel:"INTERN" as const,hasBeenRekt:false,hasBeenWhale:false};
describe("achievements",()=>{
  it("grants qualifying achievements",()=>{expect(evaluateAchievements(base)).toEqual(["FIRST_BLOOD"]);expect(evaluateAchievements({...base,result:"LIQUIDATED",wins:0})).toEqual(["REKT"]);expect(evaluateAchievements({...base,risk:"FULL_SEND",duration:"8H"})).toContain("DIAMOND_HANDS")});
  it("covers cumulative and milestone achievements",()=>{const codes=evaluateAchievements({...base,direction:"SHORT",winningShorts:10,settledSessions:100,currentStreak:5,sessionSkill:.95,currentLevel:"WHALE",hasBeenRekt:true});expect(codes).toEqual(expect.arrayContaining(["PERMABEAR","GREEN_MACHINE","WALL_STREET_INTERN","GOD_CANDLE","FROM_ZERO_TO_HERO"]));expect(evaluateAchievements({...base,currentLevel:"REKT",hasBeenWhale:true})).toContain("ROUND_TRIPPER")});
  it("is idempotent and caps score input elsewhere",()=>{expect(evaluateAchievements({...base,existing:new Set(["FIRST_BLOOD"])})).toEqual([]);expect(achievementPoints(["FIRST_BLOOD","REKT"])).toBe(7)});
});
