import type { ArtLayerProps } from "@/art/renderer/types";

export function FrameLayer({ spec }: ArtLayerProps) {
  const accent = spec.state.careerLevel === "MARKET_GOD" ? spec.palette.gold : spec.palette.green;
  return <g data-layer="frame">
    <rect x="2" y="2" width="124" height="124" fill="none" stroke={spec.palette.outline} strokeWidth="4" />
    <rect x="4" y="121" width="120" height="3" fill={accent} opacity="0.5" />
    {spec.state.active && <g className="pixel-live" aria-label="Active session"><rect x="114" y="7" width="7" height="7" fill="#07100f" stroke={spec.palette.green} strokeWidth="1" /><rect x="116" y="9" width="3" height="3" fill={spec.palette.green} /></g>}
  </g>;
}
