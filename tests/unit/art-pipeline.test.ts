import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { CAREER_LEVELS, type CareerLevel, type FreakDNA, type Mood } from "@/domain/types";
import { TRAIT_MANIFEST } from "@/domain/rarity/trait-manifest";
import { DYNAMIC_ART_ASSETS, DYNAMIC_TRAITS } from "@/art/manifest/dynamic";
import { IMMUTABLE_ART_ASSETS, IMMUTABLE_TRAITS } from "@/art/manifest/immutable";
import { CAREER_ART_POOLS } from "@/art/rules/career-pools";
import { resolveCompatibility } from "@/art/rules/compatibility";
import { ART_LAYER_ORDER } from "@/art/rules/layering";
import { buildDynamicState, buildRenderSpec, selectDynamicSlot } from "@/art/renderer/build-render-spec";
import { buildRenderSignature } from "@/art/renderer/render-signature";
import type { DynamicArtState, FreakRenderSpec } from "@/art/renderer/types";
import { PixelCanvas } from "@/components/freak/art/PixelCanvas";

const DNA: FreakDNA = { body: "Average", skin: "Sand", head: "Round", eyes: "Dead", mouth: "Flat", hair: "Bald" };
const input = { tokenId: 1337, dna: DNA, careerLevel: "GRINDER" as CareerLevel, mood: "NEUTRAL" as Mood };

describe("V1 art pipeline", () => {
  test("same identity and state produce the same spec and signature", () => {
    const first = buildRenderSpec(input);
    const second = buildRenderSpec({ ...input, dna: { ...DNA } });
    expect(second).toEqual(first);
    expect(buildRenderSignature(second)).toBe(buildRenderSignature(first));
  });

  test("every immutable trait changes its relevant render descriptor", () => {
    for (const slot of Object.keys(TRAIT_MANIFEST) as (keyof FreakDNA)[]) {
      const values = IMMUTABLE_TRAITS[slot];
      const first = buildRenderSpec({ ...input, dna: { ...DNA, [slot]: values[0] } });
      const second = buildRenderSpec({ ...input, dna: { ...DNA, [slot]: values[1] } });
      expect(second.immutable[slot]).not.toBe(first.immutable[slot]);
      expect(second.assets.map((asset) => asset.id)).not.toEqual(first.assets.map((asset) => asset.id));
      if (slot === "skin") expect(second.palette.skin).not.toBe(first.palette.skin);
    }
    expect(IMMUTABLE_ART_ASSETS).toHaveLength(56);
  });

  test("dynamic slots resolve independently rather than as canned scenes", () => {
    const combinations = Array.from({ length: 200 }, (_, index) => buildDynamicState(index + 1, DNA, "GRINDER"));
    expect(new Set(combinations.map((state) => JSON.stringify(state))).size).toBeGreaterThan(10);
    for (const slot of Object.keys(DYNAMIC_TRAITS) as (keyof DynamicArtState)[]) {
      const picked = new Set(combinations.map((state) => state[slot]));
      expect(picked.size).toBeGreaterThan(1);
      expect(selectDynamicSlot(88, DNA, "GRINDER", slot)).toBe(selectDynamicSlot(88, DNA, "GRINDER", slot));
      expect(CAREER_ART_POOLS.GRINDER[slot]).toContain(selectDynamicSlot(88, DNA, "GRINDER", slot));
    }
  });

  test("career evolution preserves immutable identity", () => {
    const specs = CAREER_LEVELS.map((careerLevel) => buildRenderSpec({ ...input, careerLevel }));
    expect(specs.every((spec) => JSON.stringify(spec.immutable) === JSON.stringify(DNA))).toBe(true);
    expect(new Set(specs.map((spec) => JSON.stringify(spec.dynamic))).size).toBe(CAREER_LEVELS.length);
  });

  test("all descriptors exist and every immutable value renders", () => {
    expect(DYNAMIC_ART_ASSETS).toHaveLength(43);
    expect(ART_LAYER_ORDER).toEqual(["background", "environment", "workstation", "screens", "body", "outfit", "neck", "head", "hair", "eyes", "mouth", "prop", "effects", "frame"]);
    for (const slot of Object.keys(IMMUTABLE_TRAITS) as (keyof FreakDNA)[]) {
      for (const value of IMMUTABLE_TRAITS[slot]) {
        const spec = buildRenderSpec({ ...input, dna: { ...DNA, [slot]: value } });
        expect(renderToStaticMarkup(createElement(PixelCanvas, { spec }))).toContain("<svg");
        expect(spec.assets.some((asset) => asset.id.includes(`:${slot}:`))).toBe(true);
      }
    }
  });

  test("every dynamic value and state effect renders through the same layer contract", () => {
    const base = buildRenderSpec(input);
    for (const slot of Object.keys(DYNAMIC_TRAITS) as (keyof DynamicArtState)[]) {
      for (const value of DYNAMIC_TRAITS[slot]) {
        const dynamic = { ...base.dynamic, [slot]: value };
        const spec = { ...base, dynamic, presentation: resolveCompatibility(DNA, dynamic, "NEUTRAL") };
        expect(DYNAMIC_ART_ASSETS.some((asset) => asset.id.includes(`:${slot}:${value.toLowerCase().replaceAll(" ", "-")}`))).toBe(true);
        expect(renderToStaticMarkup(createElement(PixelCanvas, { spec }))).not.toContain("undefined");
      }
    }
    for (const mood of ["EUPHORIC", "HAPPY", "FOCUSED", "NEUTRAL", "TILTED", "MELTDOWN"] as const) {
      const spec = buildRenderSpec({ ...input, mood, active: true });
      expect(renderToStaticMarkup(createElement(PixelCanvas, { spec }))).toContain("data-layer=\"effects\"");
    }
  });

  test.each([
    ["Foil Hat", "Big Brain", "Cigarette", "Floor Setup", "Phone Only", "Basement"],
    ["Foil Hat", "Flat Skull", "Screaming", "Institutional Desk", "Wall of Screens", "Penthouse"],
    ["Headphones", "Wide Jaw", "Flat", "Institutional Desk", "Wall of Screens", "Bunker"],
    ["Hoodie Up", "Long", "Cigarette", "Standing Desk", "Ultrawide", "Travel Jet"],
  ])("renders compatibility combination %# without missing coordinates", (hair, head, mouth, workstation, screens, environment) => {
    const dna = { ...DNA, hair, head, mouth };
    const dynamic: DynamicArtState = { outfit: "Luxury Coat", workstation, screens, prop: "Coffee", environment };
    const base = buildRenderSpec({ ...input, dna });
    const spec: FreakRenderSpec = { ...base, dynamic, presentation: resolveCompatibility(dna, dynamic, "MELTDOWN") };
    const markup = renderToStaticMarkup(createElement(PixelCanvas, { spec }));
    expect(markup).toContain("data-layer=\"frame\"");
    expect(markup).not.toContain("undefined");
    expect(Object.values(spec.presentation).every((value) => value !== undefined)).toBe(true);
  });

  test("Cigarette remains visible with the meltdown screaming presentation", () => {
    const dna = { ...DNA, mouth: "Cigarette" };
    const spec = buildRenderSpec({ ...input, dna, mood: "MELTDOWN" });
    expect(spec.presentation.mouthPose).toBe("MELTDOWN_ACCENT");
    expect(renderToStaticMarkup(createElement(PixelCanvas, { spec }))).toContain("#dd7b45");
  });
});
