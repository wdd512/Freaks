import type { FreakPalette } from "@/art/renderer/types";
import type { ImmutableArtIdentity, SkinTrait } from "@/art/manifest/immutable";
import { deterministicIndex } from "@/art/renderer/deterministic";

const SKINS = {
  "Cool Light": ["#ead7cd", "#bd988c"],
  "Warm Light": ["#f0c39c", "#bc8268"],
  Sand: ["#d4a574", "#9e704e"],
  Olive: ["#aa895d", "#755b40"],
  Bronze: ["#ad7148", "#78482f"],
  Copper: ["#975b3c", "#663a29"],
  Umber: ["#70432d", "#46291f"],
  Deep: ["#452b25", "#291916"],
} as const satisfies Record<SkinTrait, readonly [string, string]>;

const HAIRS = [["#282421", "#4a3a2d"], ["#171819", "#34383a"], ["#4b2c1f", "#75452a"], ["#44342b", "#6d5542"]] as const;
const CLOTHES = [["#506b66", "#293b38"], ["#655377", "#382e47"], ["#5e6047", "#343628"], ["#3e5871", "#243547"]] as const;

export function buildPalette(dna: ImmutableArtIdentity, tokenId: number): FreakPalette {
  const skin = SKINS[dna.skin];
  const hair = HAIRS[deterministicIndex(`${tokenId}|${dna.hair}|hair-palette`, HAIRS.length)];
  const clothes = CLOTHES[deterministicIndex(`${tokenId}|${dna.body}|clothing-palette`, CLOTHES.length)];
  return {
    background: "#07100f", backgroundLight: "#12201d", outline: "#111514",
    skin: skin[0], skinShadow: skin[1], hair: hair[0], hairLight: hair[1],
    clothing: clothes[0], clothingDark: clothes[1], desk: "#493d34", metal: "#89928d",
    screen: "#8af5c0", green: "#55ef8d", red: "#ff5867", purple: "#c17aff",
    gold: "#efc758", white: "#e8e9dc",
  };
}
