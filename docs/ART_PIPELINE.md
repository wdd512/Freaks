# PNL FREAKS Art Pipeline V1

The V1 renderer is a deterministic, versioned, 128×128 logical pixel-art system. It is isolated from game formulas and persistence: game state enters the art module, but artwork never feeds values back into PnL, XP, rarity, career score, or settlement.

## Data flow

```text
tokenId + immutable DNA + career + mood + active
  -> buildRenderSpec()
  -> independent career-pool selection per dynamic slot
  -> deterministic compatibility presentation
  -> ordered SVG layer components
  -> browser canvas or static SVG/PNG export
```

`ART_VERSION` is `v1`. A `FreakRenderSpec` contains immutable identity, independently selected dynamic state, presentation adjustments, a limited palette, effects, and `ArtLayerAsset` descriptors. The shared layer adapter renders either the current SVG component or a local transparent PNG/WebP selected by the descriptor without changing game or domain logic.

## Determinism and identity

Every dynamic slot hashes a seed containing:

```text
art version | token ID | full DNA | career | slot name
```

There is no `Math.random()` in the art pipeline. Outfit, workstation, screens, prop, and environment are resolved independently from career pools. Career evolution never mutates body, skin, head, eyes, mouth, or hair/headwear.

`buildRenderSignature(spec)` canonically includes version, token ID, immutable and dynamic values, state, sorted effects, presentation, palette, and sorted asset decisions. Anything represented by a supported V1 spec that can alter static SVG output therefore changes its signature. Changing the renderer version is explicit and does not require changing Freak DNA.

## Layers

V1 composes small replaceable React/SVG components in this order:

1. background
2. environment
3. workstation
4. screens
5. body
6. outfit
7. neck
8. head
9. hair/headwear
10. eyes
11. mouth
12. prop
13. mood/career/active effects
14. frame

Coordinates use integer logical pixels. Browser scaling and PNG export use nearest-neighbor behavior. The artwork avoids filters, gradients, blur, and large embedded data. The frame embeds no status text; active state is a small geometric indicator. Optional animation uses stepped CSS and is disabled by `prefers-reduced-motion`.

## Visual coverage

The immutable manifest has 56 rendered values: 8 bodies, 8 skin palettes, 10 heads, 10 eyes, 8 mouths, and 12 hair/headwear styles. The dynamic manifest has 61 values: 13 outfits, 12 workstations, 12 screen arrangements, 10 props, and 14 environments.

Compatibility rules never reroll DNA. They reposition low floor desks, suppress desktop layouts for Phone Only, frame Wall of Screens where appropriate, fit headwear modes across head silhouettes, and preserve extreme mouth/head combinations.

## Art Lab

Run `npm run dev` and open [http://localhost:3000/art-lab](http://localhost:3000/art-lab). The route deliberately returns 404 in production and is not linked from product navigation.

It includes:

- a dedicated six-career Production Pack V1 preview;
- 50 deterministic collection previews using `pnl-freaks-art-v1`;
- career, mood, active, rarity, personality, and token filters;
- a six-career same-Freak evolution comparison;
- forced matrices for every immutable value;
- optional complete render signatures and per-trait `SVG`/`IMAGE` production-asset modes.

## Export

```bash
npm run art:export -- --count 50 --career INTERN
npm run art:export -- --count 50 --career INTERN --format png
```

SVG is the default. PNG uses Sharp and is emitted at 512×512. Both commands write numbered files and `manifest.json` to ignored `art-output/`. Optional arguments are `--mood`, `--seed`, and `--output`.

## Adding production layer assets

1. Keep the existing manifest value and immutable DNA name stable.
2. Place the versioned image below `public/art/v1/`.
3. Change that value's `ArtLayerAsset` descriptor from `SVG_COMPONENT` to `IMAGE`, set its `assetPath`, and provide integer `x`, `y`, `width`, and `height` placement.
4. Use only versioned local `.png` or `.webp` URLs such as `/art/v1/head/potato.png`; remote URLs and traversal are rejected.
5. Check all six careers, Art Lab asset-mode labels, SVG export, and PNG export. PNG export inlines validated local images before Sharp rasterization.
6. Update `ART_VERSION` only for a deliberate collection-wide renderer revision.

Trait renderers use literal unions and exhaustive switches. Unknown values throw instead of silently falling back to another visual. Tests hash actual static SVG output and require every registered value within a slot to produce unique static output.

## Production Pack V1

Production Pack V1 adds 41 transparent, aligned, 128×128 PNG layers under `public/art/v1/`. The fixed template and anchors live in `art/manifest/production-pack-v1.ts`; `public/art/v1/template/production-character-template-v1.png` is the normalized visual reference. All production files use kebab-case names.

The pack covers 3 bodies, 3 heads, 4 eyes, 3 mouths, 4 hair/headwear styles, 4 skin treatments, and four values for each dynamic slot. Existing generator DNA remains unchanged. Where the production vocabulary differs, the manifest bridges it to existing DNA: `half-lidded` is `Lazy Eye`, `focused` is `Laser Focus`, `dead-inside` is `Dead`, `tiny-frown` is `Lip Bite`, `shaved` is `Bald`, `short-messy` is `Messy Fringe`, `olive-tan` is `Olive`, and `deep-brown` is `Deep`.

Career pools use the requested production progression. MARKET_GOD deliberately shares the premium WHALE scene ingredients and adds only the existing career aura, keeping exactly one premium prop and avoiding scene clutter. Unsupported immutable DNA continues through the exhaustive SVG fallback. IMAGE head and body masks use the selected production skin layer while retaining outline and pixel shading.

The source pack is reproducible:

```bash
npm run art:build-pack
```

Pass `--template-source <path>` only when deliberately normalizing a reviewed replacement style anchor. Building the pack does not touch rarity weights, generation probabilities, or game state.

## Current limitations and next step

Production coverage is intentionally partial. Unsupported immutable traits still use the programmer SVG layers; V2 should prioritize the most frequently generated immutable body/head/face/hair values, then add differentiated premium props and environment details without increasing scene clutter.
