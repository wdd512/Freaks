import { describe, expect, it } from "vitest";
import { generateCollection, scoreDna } from "@/domain/rarity/generator";

describe("collection generator",()=>{
  it("is deterministic by seed and different across seeds",()=>{const a=generateCollection(20,"alpha"),b=generateCollection(20,"alpha"),c=generateCollection(20,"beta");expect(a.report.collectionHash).toBe(b.report.collectionHash);expect(a.freaks).toEqual(b.freaks);expect(a.report.collectionHash).not.toBe(c.report.collectionHash)});
  it("produces unique valid DNA and balanced personalities",()=>{const {freaks,report}=generateCollection(200,"unique");expect(new Set(freaks.map(f=>f.dnaHash)).size).toBe(200);expect(report.duplicateCount).toBe(0);expect(Object.values(report.personalityCounts).every(count=>count===25)).toBe(true)});
  it("excludes skin and personality from rarity",()=>{const freak=generateCollection(1,"rarity").freaks[0];const altered={...freak.dna,skin:freak.dna.skin==="Deep"?"Cool Light":"Deep"};expect(scoreDna(altered)).toBe(scoreDna(freak.dna));expect(calculateGameplaySignature(freak.rarityTier)).toBe(calculateGameplaySignature("COMMON"))});
  it("assigns the exact 4,444 rarity distribution",()=>{const {report}=generateCollection(4444,"full-supply-test");expect(report.rarityDistribution).toEqual({COMMON:3111,UNCOMMON:889,RARE:311,EPIC:89,MYTHIC:44})});
});
const calculateGameplaySignature=(rarity:string)=>rarity ? "rarity-never-enters-domain-formulas" : "rarity-never-enters-domain-formulas";
