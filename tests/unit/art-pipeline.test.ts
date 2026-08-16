import { createHash } from "node:crypto";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import { describe, expect, test } from "vitest";
import { CAREER_LEVELS, type CareerLevel, type FreakDNA, type Mood } from "@/domain/types";
import { TRAIT_MANIFEST } from "@/domain/rarity/trait-manifest";
import { DYNAMIC_ART_ASSETS, DYNAMIC_TRAITS, type DynamicArtState, type DynamicSlot } from "@/art/manifest/dynamic";
import { IMMUTABLE_ART_ASSETS, IMMUTABLE_TRAITS, type HairTrait, type HeadTrait, type ImmutableArtIdentity, type MouthTrait } from "@/art/manifest/immutable";
import { CAREER_ART_POOLS } from "@/art/rules/career-pools";
import { resolveCompatibility } from "@/art/rules/compatibility";
import { ART_LAYER_ORDER } from "@/art/rules/layering";
import { artAssetId, validateArtLayerAsset } from "@/art/renderer/assets";
import { buildDynamicState, buildRenderSpec, selectDynamicSlot } from "@/art/renderer/build-render-spec";
import { buildPalette } from "@/art/manifest/palettes";
import { buildRenderSignature } from "@/art/renderer/render-signature";
import { buildVisualFingerprint } from "@/art/renderer/visual-fingerprint";
import { renderStaticSvg } from "@/art/renderer/render-static-svg";
import type { ArtLayerAsset, FreakRenderSpec, ImageArtLayerAsset } from "@/art/renderer/types";
import { PixelCanvas } from "@/components/freak/art/PixelCanvas";
import { PRODUCTION_CHARACTER_TEMPLATE_V1, PRODUCTION_PACK_V1_ASSETS } from "@/art/manifest/production-pack-v1";
import { generateCollection } from "@/domain/rarity/generator";

const DNA: FreakDNA = { body: "Average", skin: "Sand", head: "Round", eyes: "Dead", mouth: "Flat", hair: "Bald" };
const input = { tokenId: 1337, dna: DNA, careerLevel: "GRINDER" as CareerLevel, mood: "NEUTRAL" as Mood };
const immutableSlots = Object.keys(IMMUTABLE_TRAITS) as (keyof ImmutableArtIdentity)[];
const dynamicSlots = Object.keys(DYNAMIC_TRAITS) as DynamicSlot[];
const descriptors = [...IMMUTABLE_ART_ASSETS, ...DYNAMIC_ART_ASSETS];

function descriptor(traitSlot: string, value: string): ArtLayerAsset {
  const found = descriptors.find((asset) => asset.id === artAssetId(traitSlot, value));
  if (!found) throw new Error(`Test descriptor not found: ${traitSlot}:${value}`);
  return found;
}

function replaceDescriptor(spec: FreakRenderSpec, traitSlot: string, value: string, replacement = descriptor(traitSlot, value)): ArtLayerAsset[] {
  const prefix = `v1:${traitSlot}:`;
  return spec.assets.map((asset) => asset.id.startsWith(prefix) ? replacement : asset);
}

function forceImmutable(base: FreakRenderSpec, slot: keyof ImmutableArtIdentity, value: string): FreakRenderSpec {
  const identity = { ...base.immutable, [slot]: value } as ImmutableArtIdentity;
  return {
    ...base,
    immutable: identity,
    palette: buildPalette(identity, base.tokenId),
    assets: replaceDescriptor(base, slot, value),
    presentation: resolveCompatibility(identity, base.dynamic, base.state.mood),
  };
}

function forceDynamic(base: FreakRenderSpec, slot: DynamicSlot, value: string): FreakRenderSpec {
  const dynamic = { ...base.dynamic, [slot]: value } as DynamicArtState;
  return {
    ...base,
    dynamic,
    assets: replaceDescriptor(base, slot, value),
    presentation: resolveCompatibility(base.immutable, dynamic, base.state.mood),
  };
}

const svgHash = (spec: FreakRenderSpec): string => createHash("sha256").update(renderStaticSvg(spec, false)).digest("hex");

describe("V1.1 art pipeline correctness", () => {
  test("same render spec produces the same canonical signature", () => {
    const first = buildRenderSpec(input);
    const second = buildRenderSpec({ ...input, dna: { ...DNA } });
    expect(second).toEqual(first);
    expect(buildRenderSignature(second)).toBe(buildRenderSignature(first));
  });

  test("tokenId and deterministic effects are signature-integrity fields", () => {
    const spec = buildRenderSpec(input);
    const differentToken = { ...spec, tokenId: spec.tokenId + 1 };
    expect(buildRenderSignature(differentToken)).not.toBe(buildRenderSignature(spec));
    expect(buildVisualFingerprint(differentToken)).toBe(buildVisualFingerprint(spec));
    const withSpark = { ...spec, effects: [...spec.effects, "ACHIEVEMENT_SPARK"] };
    expect(buildRenderSignature(withSpark)).not.toBe(buildRenderSignature(spec));
    expect(renderStaticSvg(withSpark)).not.toBe(renderStaticSvg(spec));
  });

  test("identical signatures imply identical static V1 SVG output", () => {
    const original = buildRenderSpec({ ...input, mood: "EUPHORIC", active: true });
    const canonicallyEquivalent = { ...original, effects: [...original.effects].reverse(), assets: [...original.assets].reverse() };
    expect(buildRenderSignature(canonicallyEquivalent)).toBe(buildRenderSignature(original));
    expect(buildVisualFingerprint(canonicallyEquivalent)).toBe(buildVisualFingerprint(original));
    expect(renderStaticSvg(canonicallyEquivalent)).toBe(renderStaticSvg(original));
  });

  test("every immutable value has a unique rendered SVG hash inside its slot", () => {
    const base = buildRenderSpec(input);
    const expected = { body: 8, skin: 8, head: 10, eyes: 10, mouth: 8, hair: 12 } as const;
    for (const slot of immutableSlots) {
      const hashes = new Set(IMMUTABLE_TRAITS[slot].map((value) => svgHash(forceImmutable(base, slot, value))));
      expect(hashes.size, `${slot} render uniqueness`).toBe(expected[slot]);
    }
  });

  test("every dynamic value has a unique rendered SVG hash inside its slot", () => {
    const base = buildRenderSpec(input);
    for (const slot of dynamicSlots) {
      const hashes = new Set(DYNAMIC_TRAITS[slot].map((value) => svgHash(forceDynamic(base, slot, value))));
      expect(hashes.size, `${slot} render uniqueness`).toBe(DYNAMIC_TRAITS[slot].length);
    }
  });

  test("typed art manifest exactly matches the unchanged generator manifest", () => {
    for (const slot of immutableSlots) expect([...IMMUTABLE_TRAITS[slot]]).toEqual(TRAIT_MANIFEST[slot].map((trait) => trait.name));
    expect(IMMUTABLE_ART_ASSETS).toHaveLength(56);
    expect(DYNAMIC_ART_ASSETS).toHaveLength(62);
  });

  test("dynamic slots resolve independently rather than as canned scenes", () => {
    const combinations = Array.from({ length: 200 }, (_, index) => buildDynamicState(index + 1, DNA, "GRINDER"));
    expect(new Set(combinations.map((state) => JSON.stringify(state))).size).toBe(2);
    for (const slot of dynamicSlots) {
      expect(new Set(combinations.map((state) => state[slot])).size).toBe(CAREER_ART_POOLS.GRINDER[slot].length);
      expect(CAREER_ART_POOLS.GRINDER[slot]).toContain(selectDynamicSlot(88, DNA, "GRINDER", slot));
      const acrossCareers = new Set(CAREER_LEVELS.flatMap((careerLevel) => CAREER_ART_POOLS[careerLevel][slot]));
      expect(acrossCareers.size).toBeGreaterThan(1);
    }
  });

  test("career evolution preserves immutable identity", () => {
    const specs = CAREER_LEVELS.map((careerLevel) => buildRenderSpec({ ...input, careerLevel }));
    expect(specs.every((spec) => JSON.stringify(spec.immutable) === JSON.stringify(DNA))).toBe(true);
    expect(new Set(specs.map((spec) => JSON.stringify(spec.dynamic))).size).toBeGreaterThanOrEqual(5);
  });

  test("layer order and system-font-free pixel frame are stable", () => {
    expect(ART_LAYER_ORDER).toEqual(["background", "environment", "workstation", "screens", "body", "outfit", "neck", "head", "hair", "eyes", "mouth", "prop", "effects", "frame"]);
    const markup = renderStaticSvg(buildRenderSpec({ ...input, active: true }), false);
    expect(markup).toContain("aria-label=\"Active session\"");
    expect(markup).not.toContain("data-pixel-text");
    expect(markup).not.toContain("<text");
    expect(markup).not.toContain("font-family");
  });

  test("Production Pack V1 contains 42 unique aligned transparent PNG layers", async () => {
    expect(PRODUCTION_CHARACTER_TEMPLATE_V1.canvas).toEqual({ width: 128, height: 128 });
    const templateFile = path.join(process.cwd(), "public", PRODUCTION_CHARACTER_TEMPLATE_V1.referenceAsset.replace(/^\/+/, ""));
    expect(await sharp(templateFile).metadata()).toMatchObject({ format: "png", width: 128, height: 128, hasAlpha: true });
    expect(PRODUCTION_PACK_V1_ASSETS).toHaveLength(42);
    expect(new Set(PRODUCTION_PACK_V1_ASSETS.map((asset) => asset.id)).size).toBe(PRODUCTION_PACK_V1_ASSETS.length);
    expect(new Set(PRODUCTION_PACK_V1_ASSETS.flatMap((asset) => asset.sourceType === "IMAGE" ? [asset.assetPath] : [])).size).toBe(PRODUCTION_PACK_V1_ASSETS.length);
    for (const asset of PRODUCTION_PACK_V1_ASSETS) {
      expect(asset.sourceType).toBe("IMAGE");
      if (asset.sourceType !== "IMAGE") continue;
      expect(asset.placement).toEqual({ x: 0, y: 0, width: 128, height: 128 });
      const file = path.join(process.cwd(), "public", asset.assetPath.replace(/^\/+/, ""));
      const metadata = await sharp(file).metadata();
      expect(metadata, asset.assetPath).toMatchObject({ format: "png", width: 128, height: 128, hasAlpha: true });
    }
  });

  test("all 50 Art Lab collection samples render with production IMAGE layers", () => {
    const collection = generateCollection(50, "pnl-freaks-art-v1").freaks;
    const rendered = collection.map((freak) => {
      const spec = buildRenderSpec({ tokenId: freak.tokenId, dna: freak.dna, careerLevel: "INTERN", mood: "NEUTRAL" });
      expect(spec.assets.filter((asset) => asset.sourceType === "IMAGE").length).toBeGreaterThanOrEqual(5);
      return renderStaticSvg(spec, false);
    });
    expect(rendered).toHaveLength(50);
    expect(rendered.every((markup) => markup.includes("data-asset-source=\"IMAGE\""))).toBe(true);
  });

  test("a fully supported production identity resolves every trait through IMAGE assets", () => {
    const productionDna: FreakDNA = { body: "Average", skin: "Warm Light", head: "Round", eyes: "Sleepy", mouth: "Smirk", hair: "Buzz Cut" };
    const spec = buildRenderSpec({ tokenId: 8001, dna: productionDna, careerLevel: "INTERN", mood: "NEUTRAL" });
    expect(spec.assets).toHaveLength(11);
    expect(spec.assets.every((asset) => asset.sourceType === "IMAGE")).toBe(true);
    expect(renderStaticSvg(spec, false)).toContain("data-production-tint=\"skin\"");
  });

  test("every immutable Production Pack mapping points to a unique IMAGE asset", () => {
    const immutable = PRODUCTION_PACK_V1_ASSETS.filter((asset) => /v1:(body|skin|head|eyes|mouth|hair):/.test(asset.id));
    expect(immutable).toHaveLength(21);
    expect(immutable.every((asset) => asset.sourceType === "IMAGE")).toBe(true);
    expect(new Set(immutable.map((asset) => asset.id)).size).toBe(21);
    expect(new Set(immutable.flatMap((asset) => asset.sourceType === "IMAGE" ? [asset.assetPath] : [])).size).toBe(21);
  });

  test("WHALE and MARKET_GOD resolve different controlled production coats", () => {
    const productionDna: FreakDNA = { body: "Average", skin: "Warm Light", head: "Round", eyes: "Sleepy", mouth: "Smirk", hair: "Buzz Cut" };
    const whale = buildRenderSpec({ tokenId: 8001, dna: productionDna, careerLevel: "WHALE", mood: "NEUTRAL" });
    const marketGod = buildRenderSpec({ tokenId: 8001, dna: productionDna, careerLevel: "MARKET_GOD", mood: "NEUTRAL" });
    expect(whale.dynamic.outfit).toBe("Luxury Coat");
    expect(marketGod.dynamic.outfit).toBe("Market God Coat");
    expect(whale.assets.find((asset) => asset.id.startsWith("v1:outfit:"))).toMatchObject({ sourceType: "IMAGE", assetPath: "/art/v1/outfit/luxury-coat.png" });
    expect(marketGod.assets.find((asset) => asset.id.startsWith("v1:outfit:"))).toMatchObject({ sourceType: "IMAGE", assetPath: "/art/v1/outfit/market-god-coat.png" });
    expect(marketGod.effects).toEqual(["GOLD_AURA"]);
    expect(marketGod.assets).toHaveLength(11);
    const markup = renderStaticSvg(marketGod, false);
    expect(markup).not.toMatch(/<text|data-pixel-text/i);
  });

  test("IMAGE descriptors replace SVG fallback in browser and static export markup", () => {
    const base = buildRenderSpec({ ...input, dna: { ...DNA, head: "Potato" } });
    const image: ImageArtLayerAsset = {
      id: artAssetId("head", "Potato"), slot: "head", sourceType: "IMAGE",
      assetPath: "/art/v1/head/potato.png", placement: { x: 0, y: 0, width: 128, height: 128 },
    };
    const spec = { ...base, assets: replaceDescriptor(base, "head", "Potato", image) };
    const browserMarkup = renderToStaticMarkup(createElement(PixelCanvas, { spec, size: 512 }));
    const exportMarkup = renderStaticSvg(spec, false);
    expect(browserMarkup).toBe(exportMarkup);
    expect(exportMarkup).toContain("data-asset-source=\"IMAGE\"");
    expect(exportMarkup).toContain("href=\"/art/v1/head/potato.png\"");
    expect(buildRenderSignature(spec)).toContain("potato.png");
  });

  test("IMAGE descriptors accept local PNG/WebP and reject unsafe or incomplete configuration", () => {
    const placement = { x: 0, y: 0, width: 128, height: 128 };
    expect(validateArtLayerAsset({ id: "v1:head:potato", slot: "head", sourceType: "IMAGE", assetPath: "/art/v1/head/potato.webp", placement })).toBeTruthy();
    expect(() => validateArtLayerAsset({ id: "bad", slot: "head", sourceType: "IMAGE", assetPath: "https://example.com/potato.png", placement } as ArtLayerAsset)).toThrow(/versioned local/i);
    expect(() => validateArtLayerAsset({ id: "bad", slot: "head", sourceType: "IMAGE", assetPath: "/art/v1/head/potato.png" } as ArtLayerAsset)).toThrow(/requires assetPath and placement/i);
    expect(() => validateArtLayerAsset({ id: "bad", slot: "head", sourceType: "IMAGE", assetPath: "/art/v1/../potato.png", placement } as ArtLayerAsset)).toThrow(/versioned local/i);
  });

  const compatibilityCases = [
    { hair: "Foil Hat", head: "Big Brain", mouth: "Flat", workstation: "Institutional Desk", screens: "Wall of Screens", environment: "Penthouse", mode: "HAT", marker: "data-wall-frame=\"true\"" },
    { hair: "Foil Hat", head: "Flat Skull", mouth: "Screaming", workstation: "Institutional Desk", screens: "Wall of Screens", environment: "Bunker", mode: "HAT", marker: "data-wall-frame=\"true\"" },
    { hair: "Trading Cap", head: "Long", mouth: "Flat", workstation: "Standing Desk", screens: "Ultrawide", environment: "Travel Jet", mode: "CAP", marker: "data-headwear-fit=\"0,-3\"" },
    { hair: "Headphones", head: "Wide Jaw", mouth: "Flat", workstation: "Office Desk", screens: "Dual Monitor", environment: "Trading Office", mode: "HEADPHONES", marker: "data-headwear-fit=\"-1,1\"" },
    { hair: "Hoodie Up", head: "Big Brain", mouth: "Flat", workstation: "Gaming Desk", screens: "Triple Monitor", environment: "Bedroom", mode: "HOOD", marker: "data-headwear-fit=\"-2,-2\"" },
    { hair: "Visor", head: "Crooked", mouth: "Flat", workstation: "IKEA Desk", screens: "Single Monitor", environment: "Cheap Office", mode: "VISOR", marker: "data-headwear-fit=\"2,1\"" },
  ] as const satisfies readonly { hair: HairTrait; head: HeadTrait; mouth: MouthTrait; workstation: DynamicArtState["workstation"]; screens: DynamicArtState["screens"]; environment: DynamicArtState["environment"]; mode: string; marker: string }[];

  test.each(compatibilityCases)("uses intentional compatibility geometry for $hair + $head", (combination) => {
    let spec = buildRenderSpec({ ...input, dna: { ...DNA, hair: combination.hair, head: combination.head, mouth: combination.mouth } });
    spec = forceDynamic(forceDynamic(forceDynamic(spec, "workstation", combination.workstation), "screens", combination.screens), "environment", combination.environment);
    const markup = renderStaticSvg(spec, false);
    expect(spec.presentation.headwearMode).toBe(combination.mode);
    expect(markup).toContain(`data-headwear-mode=\"${combination.mode}\"`);
    expect(markup).toContain(combination.marker);
  });

  test("Cigarette + screaming and Floor Setup + Phone Only use dedicated presentation paths", () => {
    const dna = { ...DNA, mouth: "Cigarette" };
    let spec = buildRenderSpec({ ...input, dna, mood: "MELTDOWN" });
    spec = forceDynamic(forceDynamic(spec, "workstation", "Floor Setup"), "screens", "Phone Only");
    const markup = renderStaticSvg(spec, false);
    expect(spec.presentation).toMatchObject({ deskY: 108, mouthPose: "MELTDOWN_ACCENT", screenMode: "PHONE" });
    expect(markup).toContain("data-mouth-pose=\"MELTDOWN_ACCENT\"");
    expect(markup).toContain("data-screen-mode=\"PHONE\"");
    expect(markup).toContain("#dd7b45");
  });
});
