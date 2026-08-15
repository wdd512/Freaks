import { describe, expect, it } from "vitest";
import { calculateSession, calculateSessionSkill, classifyResult, personalityMultiplier } from "@/domain/session/engine";
import type { Personality, RiskMode } from "@/domain/types";

const calculate = (overrides: Partial<Parameters<typeof calculateSession>[0]> = {}) => calculateSession({
  entryPriceCents: 100_000, exitPriceCents: 110_000, direction: "LONG", risk: "NORMAL", duration: "4H", personality: "BORING_QUANT", ...overrides,
});

describe("session PnL engine", () => {
  it("handles LONG profit, LONG loss, SHORT profit, and SHORT loss", () => {
    expect(calculate({ personality: "SWINGER" }).finalPnlPpm).toBe(100_000);
    expect(calculate({ exitPriceCents: 90_000, personality: "SWINGER" }).finalPnlPpm).toBe(-100_000);
    expect(calculate({ exitPriceCents: 90_000, direction: "SHORT", personality: "SWINGER" }).finalPnlPpm).toBe(100_000);
    expect(calculate({ direction: "SHORT", personality: "SWINGER" }).finalPnlPpm).toBe(-100_000);
  });

  it.each<[RiskMode, number]>([["SAFE",75_000],["NORMAL",100_000],["DEGEN",150_000],["FULL_SEND",200_000]])("applies %s risk", (risk, expected) => {
    expect(calculate({ risk, personality: "SWINGER" }).finalPnlPpm).toBe(expected);
  });

  it("applies all personality specializations symmetrically", () => {
    const cases: [Personality, number][] = [
      ["BULL_BRAIN",1.04],["PERMABEAR",0.96],["DEGEN",1],["RISK_MANAGER",1.04],
      ["SCALPER",1],["SWINGER",1],["VOLATILITY_ADDICT",1.04],["BORING_QUANT",0.97],
    ];
    for (const [personality, expected] of cases) expect(personalityMultiplier(personality,"LONG","NORMAL","4H",0.1)).toBe(expected);
    expect(calculate({ personality:"BULL_BRAIN" }).rawPnlPpm).toBe(104_000);
    expect(calculate({ personality:"BULL_BRAIN",exitPriceCents:90_000 }).rawPnlPpm).toBe(-104_000);
  });

  it("covers duration, risk, and volatility personality branches", () => {
    expect(personalityMultiplier("DEGEN","LONG","SAFE","4H",0.01)).toBe(.95);
    expect(personalityMultiplier("DEGEN","LONG","FULL_SEND","4H",0.01)).toBe(1.05);
    expect(personalityMultiplier("RISK_MANAGER","LONG","FULL_SEND","4H",0.01)).toBe(.96);
    expect(personalityMultiplier("SCALPER","LONG","NORMAL","1H",0.01)).toBe(1.04);
    expect(personalityMultiplier("SCALPER","LONG","NORMAL","8H",0.01)).toBe(.96);
    expect(personalityMultiplier("SWINGER","LONG","NORMAL","8H",0.01)).toBe(1.04);
    expect(personalityMultiplier("VOLATILITY_ADDICT","LONG","NORMAL","4H",.0049)).toBe(.97);
    expect(personalityMultiplier("BORING_QUANT","LONG","NORMAL","4H",.0049)).toBe(1.03);
  });

  it("clamps ordinary PnL to +/-20%", () => {
    expect(calculate({ exitPriceCents:150_000, personality:"SWINGER" }).finalPnlPpm).toBe(200_000);
    expect(calculate({ exitPriceCents:50_000, risk:"NORMAL", personality:"SWINGER" }).finalPnlPpm).toBe(-200_000);
  });

  it("liquidates DEGEN exactly at -15% raw and not one unit above", () => {
    expect(calculate({ exitPriceCents:90_000,risk:"DEGEN",personality:"SWINGER" }).result).toBe("LIQUIDATED");
    const safeSide=calculate({ exitPriceCents:90_001,risk:"DEGEN",personality:"SWINGER" });
    expect(safeSide.result).toBe("LOSS"); expect(safeSide.finalPnlPpm).toBe(-149_985);
  });

  it("liquidates FULL SEND exactly at -10% raw and applies -20%", () => {
    const boundary=calculate({exitPriceCents:95_000,risk:"FULL_SEND",personality:"SWINGER"});
    expect(boundary.rawPnlPpm).toBe(-100_000); expect(boundary.result).toBe("LIQUIDATED"); expect(boundary.finalPnlPpm).toBe(-200_000);
    expect(calculate({exitPriceCents:95_001,risk:"FULL_SEND",personality:"SWINGER"}).result).toBe("LOSS");
  });

  it("classifies strict win/loss boundaries with scratch between", () => {
    expect(classifyResult(1_001)).toBe("WIN"); expect(classifyResult(1_000)).toBe("SCRATCH");
    expect(classifyResult(-1_000)).toBe("SCRATCH"); expect(classifyResult(-1_001)).toBe("LOSS");
  });

  it("calculates risk-independent normalized trader skill", () => {
    const skill=calculateSessionSkill("BTC","LONG",100_000,102_000);
    expect(skill).toBeCloseTo(Math.tanh(Math.log(1.02)/.02),12);
    expect(calculateSessionSkill("BTC","SHORT",100_000,102_000)).toBeCloseTo(-skill,12);
  });
});
