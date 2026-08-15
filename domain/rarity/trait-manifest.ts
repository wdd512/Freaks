export type WeightedTrait = { name: string; weight: number };

const weighted = (names: readonly string[], weights: readonly number[]): WeightedTrait[] =>
  names.map((name, index) => ({ name, weight: weights[index] }));

const weights8 = [0.24, 0.19, 0.15, 0.12, 0.1, 0.08, 0.07, 0.05] as const;
const weights10 = [0.22, 0.17, 0.14, 0.12, 0.1, 0.08, 0.06, 0.05, 0.04, 0.02] as const;

export const TRAIT_MANIFEST = {
  body: weighted(["Average", "Lanky", "Compact", "Heavy", "Hunched", "Long Arms", "Tiny Torso", "Wide Shoulders"], weights8),
  skin: weighted(["Cool Light", "Warm Light", "Sand", "Olive", "Bronze", "Copper", "Umber", "Deep"], Array(8).fill(0.125)),
  head: weighted(["Round", "Square", "Long", "Potato", "Big Brain", "Tiny Chin", "Wide Jaw", "Crooked", "Flat Skull", "Melted"], weights10),
  eyes: weighted(["Dead", "Sleepy", "Bloodshot", "Laser Focus", "Lazy Eye", "Tiny Dots", "Panic", "Green Glow", "Red Glow", "Terminal Reflection"], weights10),
  mouth: weighted(["Flat", "Smirk", "Screaming", "Broken Tooth", "Lip Bite", "Gum", "Cigarette", "Evil Smile"], weights8),
  hair: weighted(["Bald", "Bed Hair", "Buzz Cut", "Messy Fringe", "Mullet", "Slick Back", "Hoodie Up", "Trading Cap", "Headphones", "Visor", "Beanie", "Foil Hat"], [0.18, 0.15, 0.13, 0.11, 0.1, 0.08, 0.07, 0.06, 0.04, 0.03, 0.03, 0.02]),
} as const;

export type TraitSlot = keyof typeof TRAIT_MANIFEST;
