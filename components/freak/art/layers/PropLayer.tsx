import type { ArtLayerProps } from "@/art/renderer/types";
import { assertNever } from "@/art/renderer/assert-never";

export function PropLayer({ spec }: ArtLayerProps) {
  const y = spec.presentation.deskY - 1;
  const name = spec.dynamic.prop;
  const { outline, red, green, gold, white } = spec.palette;
  let prop: React.ReactNode;
  switch (name) {
    case "Cold Pizza": prop = <g><polygon points={`88,${y - 3} 113,${y - 2} 105,${y + 4} 91,${y + 4}`} fill="#9a6b43" stroke={outline} strokeWidth="2" /><polygon points={`94,${y - 4} 109,${y - 4} 103,${y + 1}`} fill="#e4b65c" /><rect x="101" y={y - 3} width="3" height="3" fill={red} /></g>; break;
    case "Energy Drink": prop = <g><rect x="96" y={y - 14} width="8" height="14" fill="#764aa3" stroke={outline} strokeWidth="2" /><path d={`M98 ${y - 10}h4l-3 5h4`} fill="none" stroke={green} strokeWidth="1" /></g>; break;
    case "Phone": prop = <g transform={`rotate(-10 101 ${y - 4})`}><rect x="94" y={y - 10} width="15" height="9" fill="#222b2a" stroke={outline} strokeWidth="2" /><rect x="97" y={y - 8} width="8" height="4" fill={green} /></g>; break;
    case "Coffee": prop = <g className="pixel-coffee"><rect x="96" y={y - 11} width="11" height="11" fill="#d2c8ad" stroke={outline} strokeWidth="2" /><rect x="106" y={y - 8} width="5" height="6" fill="none" stroke={white} strokeWidth="2" /><rect className="pixel-steam" x="99" y={y - 17} width="2" height="4" fill={white} /><rect className="pixel-steam pixel-delay" x="104" y={y - 19} width="2" height="5" fill={white} /></g>; break;
    case "Calculator": prop = <g><rect x="94" y={y - 13} width="17" height="13" fill="#5b6661" stroke={outline} strokeWidth="2" /><rect x="97" y={y - 10} width="11" height="3" fill="#b8d1b9" />{[98, 102, 106].map((x) => <rect key={x} x={x} y={y - 5} width="2" height="2" fill={outline} />)}</g>; break;
    case "Ledger": prop = <g><polygon points={`91,${y - 9} 110,${y - 12} 114,${y - 1} 94,${y + 1}`} fill="#7b4839" stroke={gold} strokeWidth="2" /><path d={`M97 ${y - 8}l10-2m-9 5l10-2`} stroke={white} strokeWidth="1" /></g>; break;
    case "Champagne": prop = <g><rect x="101" y={y - 16} width="5" height="11" fill="#d8e9dc" /><polygon points={`98,${y - 5} 109,${y - 5} 106,${y - 1} 101,${y - 1}`} fill={gold} /><rect x="102" y={y - 1} width="4" height="2" fill={white} /></g>; break;
    default: prop = assertNever(name, "prop");
  }
  return <g data-layer="prop">{prop}</g>;
}
