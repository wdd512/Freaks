import type { ArtLayerProps } from "@/art/renderer/types";
import { assertNever } from "@/art/renderer/assert-never";
import { resolveHeadwearFit } from "@/art/rules/compatibility";

export function HairLayer({ spec }: ArtLayerProps) {
  const name = spec.immutable.hair;
  const o = spec.presentation.headOffsetY;
  const { hair, hairLight, outline, gold, metal, green } = spec.palette;
  const { x: fitX, y: fitY } = resolveHeadwearFit(spec.presentation.headwearMode, spec.immutable.head);
  let hairArt: React.ReactNode;
  switch (name) {
    case "Bald": hairArt = <><rect x="58" y="35" width="2" height="2" fill={spec.palette.skinShadow} /><rect x="70" y="34" width="3" height="2" fill={spec.palette.skinShadow} /></>; break;
    case "Bed Hair": hairArt = <polygon points="47,43 48,33 53,36 56,27 61,35 67,25 70,35 78,29 77,39 82,38 79,45" fill={hair} stroke={outline} strokeWidth="2" />; break;
    case "Buzz Cut": hairArt = <><polygon points="48,42 50,35 56,31 74,31 79,37 80,43" fill={hair} /><g fill={hairLight}>{[54, 60, 66, 72].map((x) => <rect key={x} x={x} y="33" width="2" height="2" />)}</g></>; break;
    case "Messy Fringe": hairArt = <polygon points="47,45 48,35 55,31 79,34 81,43 75,40 72,49 67,40 61,47 57,39 52,45" fill={hair} stroke={outline} strokeWidth="2" />; break;
    case "Mullet": hairArt = <><polygon points="47,45 49,34 56,30 78,34 81,44 76,42 73,38 56,39" fill={hair} stroke={outline} strokeWidth="2" /><rect x="75" y="41" width="8" height="24" fill={hair} /><rect x="78" y="57" width="7" height="14" fill={hairLight} /></>; break;
    case "Slick Back": hairArt = <><polygon points="47,43 50,35 61,30 81,34 76,38 58,39 52,45" fill={hair} stroke={outline} strokeWidth="2" /><path d="M55 35h20" stroke={hairLight} strokeWidth="2" /></>; break;
    case "Hoodie Up": hairArt = <><polygon points="43,55 45,36 53,27 75,27 84,37 85,59 78,57 78,42 73,34 55,34 49,43 50,57" fill={spec.palette.clothingDark} stroke={outline} strokeWidth="3" /><rect x="46" y="61" width="7" height="12" fill={spec.palette.clothing} /><rect x="77" y="60" width="7" height="12" fill={spec.palette.clothing} /></>; break;
    case "Trading Cap": hairArt = <><polygon points="46,41 49,31 57,26 75,28 80,36 79,41" fill={green} stroke={outline} strokeWidth="2" /><rect x="76" y="38" width="14" height="4" fill={green} stroke={outline} strokeWidth="2" /><rect x="59" y="29" width="5" height="4" fill={spec.palette.white} /></>; break;
    case "Headphones": hairArt = <><path d="M44 51V42Q45 29 64 28Q83 29 84 42V51" fill="none" stroke={metal} strokeWidth="4" /><rect x="42" y="46" width="8" height="15" fill="#292d31" stroke={outline} strokeWidth="2" /><rect x="79" y="46" width="8" height="15" fill="#292d31" stroke={outline} strokeWidth="2" /></>; break;
    case "Visor": hairArt = <><polygon points="46,44 49,34 58,29 77,33 81,42" fill={hair} /><rect x="45" y="42" width="39" height="9" fill="#45bed1" stroke={outline} strokeWidth="2" /><rect x="51" y="44" width="25" height="2" fill="#a9f5f6" /></>; break;
    case "Beanie": hairArt = <><polygon points="47,42 49,33 57,25 73,25 80,34 81,42" fill="#875868" stroke={outline} strokeWidth="2" /><rect x="46" y="39" width="36" height="7" fill="#a46b7d" stroke={outline} strokeWidth="2" /><rect x="62" y="21" width="6" height="6" fill="#a46b7d" /></>; break;
    case "Foil Hat": hairArt = <><polygon points="45,39 52,18 61,31 68,15 76,31 84,20 82,42" fill="#b9c2bd" stroke={outline} strokeWidth="2" /><polygon points="52,34 59,24 63,36 72,23 77,37" fill={gold} opacity="0.65" /></>; break;
    default: hairArt = assertNever(name, "hair/headwear");
  }
  return <g data-layer="hair" data-headwear-mode={spec.presentation.headwearMode} data-headwear-fit={`${fitX},${fitY}`} transform={`translate(${fitX} ${o + fitY})`}>{hairArt}</g>;
}
