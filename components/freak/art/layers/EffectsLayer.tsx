import type { ArtLayerProps } from "@/art/renderer/types";

export function EffectsLayer({ spec }: ArtLayerProps) {
  const mood = spec.state.mood;
  return <g data-layer="effects">
    {mood === "EUPHORIC" && <g className="pixel-celebration" fill={spec.palette.green}>{[[14, 73], [22, 57], [109, 69], [116, 48], [94, 17]].map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="3" height="3" />)}</g>}
    {mood === "HAPPY" && <><rect x="15" y="78" width="7" height="2" fill={spec.palette.green} /><rect x="18" y="75" width="2" height="7" fill={spec.palette.green} /></>}
    {mood === "FOCUSED" && <><rect x="45" y={43 + spec.presentation.headOffsetY} width="15" height="2" fill={spec.palette.outline} /><rect x="69" y={43 + spec.presentation.headOffsetY} width="15" height="2" fill={spec.palette.outline} /></>}
    {mood === "TILTED" && <><polygon points={`104,${spec.presentation.deskY} 118,${spec.presentation.deskY} 124,${spec.presentation.deskY + 4} 109,${spec.presentation.deskY + 4}`} fill="#6b322c" /><rect x="9" y="86" width="8" height="3" fill={spec.palette.red} /></>}
    {mood === "MELTDOWN" && <g className="pixel-static"><rect x="4" y="24" width="19" height="2" fill={spec.palette.red} /><rect x="96" y="33" width="27" height="3" fill={spec.palette.red} /><rect x="18" y="61" width="12" height="2" fill={spec.palette.red} /><rect className="pixel-smoke" x="87" y="68" width="5" height="5" fill="#7c8580" /><rect className="pixel-smoke pixel-delay" x="91" y="60" width="4" height="4" fill="#9aa39e" /></g>}
    {spec.effects.includes("GOLD_AURA") && <g fill={spec.palette.gold} className="pixel-aura">{[[7, 10], [20, 80], [111, 11], [116, 76], [31, 31], [99, 55]].map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="2" height="5" />)}</g>}
    {spec.effects.includes("ACHIEVEMENT_SPARK") && <polygon points="106,13 109,19 115,22 109,25 106,31 103,25 97,22 103,19" fill={spec.palette.purple} />}
  </g>;
}

