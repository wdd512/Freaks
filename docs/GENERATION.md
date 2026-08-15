# Collection generation

`domain/rarity/trait-manifest.ts` is the machine-readable source for immutable traits and target probabilities. The generator accepts `--count` from 1 to 4,444 and `--seed`; a SHA-256-derived Mulberry-style deterministic RNG makes the same seed reproduce the same ordered DNA collection.

## Traits and weights

- Body and Mouth use `24, 19, 15, 12, 10, 8, 7, 5%` in manifest order.
- Skin has eight equally likely palettes at 12.5%.
- Head and Eyes use `22, 17, 14, 12, 10, 8, 6, 5, 4, 2%`.
- Hair uses `18, 15, 13, 11, 10, 8, 7, 6, 4, 3, 3, 2%`.

Complete DNA is `body|skin|head|eyes|mouth|hair`. Duplicates reroll and the report records reroll count. SHA-256-based short DNA hashes and an ordered collection hash provide reproducibility checks.

## Rarity

Only Body, Head, Eyes, Mouth, and Hair contribute:

```text
traitScore  = -log2(targetProbability)
rarityScore = sum(traitScore)
```

Skin, personality, career, mood, and dynamic visuals are excluded. For 4,444 items, ranked tiers contain exactly 44 MYTHIC, 89 EPIC, 311 RARE, 889 UNCOMMON, and 3,111 COMMON. Smaller collections use proportional equivalents with at least one showcase item in each non-common tier when the collection is large enough.

The eight personalities are assigned in a balanced repeating pool and then deterministically shuffled. A 4,444 collection therefore has four types at 556 and four at 555; a 20 collection differs by at most one. Personality and rarity never alter each other.

## Report and validation

```bash
npm run generate:freaks -- --count 20 --seed demo
```

The JSON report contains seed, total, rerolls, duplicate count, per-slot frequencies and actual probabilities, personality counts, rarity distribution, every DNA hash, and the collection hash. Generation throws on count errors, duplicate DNA, missing personalities (when the count can contain all eight), or invalid traits.
