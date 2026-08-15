import type { ArtLayerProps } from "@/art/renderer/types";
import { assertNever } from "@/art/renderer/assert-never";

export function EyeLayer({ spec }: ArtLayerProps) {
  const name = spec.immutable.eyes;
  const y = 49 + spec.presentation.headOffsetY;
  const { outline, white, green, red, screen, skinShadow } = spec.palette;
  let eyes: React.ReactNode;
  switch (name) {
    case "Dead": eyes = <g stroke={outline} strokeWidth="2"><path d={`M52 ${y}l7 7m0-7l-7 7M69 ${y}l7 7m0-7l-7 7`} /></g>; break;
    case "Sleepy": eyes = <g><rect x="51" y={y + 3} width="9" height="2" fill={outline} /><rect x="69" y={y + 3} width="9" height="2" fill={outline} /><rect x="53" y={y + 5} width="5" height="2" fill={skinShadow} /><rect x="71" y={y + 5} width="5" height="2" fill={skinShadow} /></g>; break;
    case "Bloodshot": eyes = <g><rect x="50" y={y} width="11" height="8" fill={white} /><rect x="68" y={y} width="11" height="8" fill={white} /><rect x="55" y={y + 2} width="3" height="4" fill={outline} /><rect x="70" y={y + 2} width="3" height="4" fill={outline} /><path d={`M50 ${y + 2}h3m5 4h3m7-4h3m5 4h3`} stroke={red} strokeWidth="1" /></g>; break;
    case "Laser Focus": eyes = <g><polygon points={`50,${y + 2} 61,${y} 59,${y + 6} 51,${y + 5}`} fill={white} /><polygon points={`68,${y} 79,${y + 2} 78,${y + 5} 70,${y + 6}`} fill={white} /><rect x="56" y={y + 2} width="2" height="4" fill={outline} /><rect x="70" y={y + 2} width="2" height="4" fill={outline} /><rect x="48" y={y - 2} width="13" height="2" fill={outline} /><rect x="68" y={y - 2} width="13" height="2" fill={outline} /></g>; break;
    case "Lazy Eye": eyes = <g><rect x="50" y={y} width="11" height="9" fill={white} /><rect x="69" y={y + 2} width="9" height="7" fill={white} /><rect x="52" y={y + 2} width="3" height="4" fill={outline} /><rect x="75" y={y + 4} width="2" height="3" fill={outline} /></g>; break;
    case "Tiny Dots": eyes = <g fill={outline}><rect x="55" y={y + 3} width="3" height="3" /><rect x="72" y={y + 3} width="3" height="3" /></g>; break;
    case "Panic": eyes = <g><rect x="49" y={y - 2} width="13" height="13" fill={white} stroke={outline} strokeWidth="2" /><rect x="68" y={y - 2} width="13" height="13" fill={white} stroke={outline} strokeWidth="2" /><rect x="55" y={y + 2} width="3" height="6" fill={outline} /><rect x="72" y={y + 2} width="3" height="6" fill={outline} /><rect x="48" y={y - 6} width="13" height="2" fill={outline} /><rect x="69" y={y - 6} width="13" height="2" fill={outline} /></g>; break;
    case "Green Glow": eyes = <g className="pixel-eye-blink"><rect x="48" y={y - 1} width="14" height="10" fill="#173b2a" /><rect x="68" y={y - 1} width="14" height="10" fill="#173b2a" /><rect x="51" y={y + 2} width="9" height="4" fill={green} /><rect x="70" y={y + 2} width="9" height="4" fill={green} /><rect x="46" y={y + 2} width="2" height="4" fill={green} /><rect x="82" y={y + 2} width="2" height="4" fill={green} /></g>; break;
    case "Red Glow": eyes = <g className="pixel-eye-blink"><polygon points={`48,${y} 62,${y + 2} 60,${y + 8} 50,${y + 6}`} fill="#45191d" /><polygon points={`68,${y + 2} 82,${y} 80,${y + 6} 70,${y + 8}`} fill="#45191d" /><rect x="52" y={y + 3} width="8" height="3" fill={red} /><rect x="70" y={y + 3} width="8" height="3" fill={red} /></g>; break;
    case "Terminal Reflection": eyes = <g><rect x="48" y={y - 1} width="15" height="10" fill="#16333b" stroke={outline} strokeWidth="2" /><rect x="67" y={y - 1} width="15" height="10" fill="#16333b" stroke={outline} strokeWidth="2" /><rect x="51" y={y + 1} width="8" height="3" fill={screen} /><rect x="70" y={y + 1} width="8" height="3" fill={screen} /><rect x="59" y={y + 4} width="2" height="3" fill={green} /><rect x="70" y={y + 4} width="2" height="3" fill={red} /></g>; break;
    default: eyes = assertNever(name, "eyes");
  }
  return <g data-layer="eyes">{eyes}</g>;
}
