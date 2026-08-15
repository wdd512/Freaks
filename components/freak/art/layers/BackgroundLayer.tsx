import type { ArtLayerProps } from "@/art/renderer/types";

export function BackgroundLayer({ spec }: ArtLayerProps) {
  const accent = spec.state.careerLevel === "REKT" ? spec.palette.red
    : spec.state.careerLevel === "MARKET_GOD" ? spec.palette.gold : spec.palette.green;
  return <g data-layer="background">
    <rect width="128" height="128" fill={spec.palette.background} />
    <rect x="0" y="0" width="128" height="4" fill={accent} opacity="0.55" />
    {[8, 24, 40, 56, 72, 88, 104, 120].map((x) => <rect key={x} x={x} y="8" width="1" height="1" fill={spec.palette.backgroundLight} />)}
  </g>;
}

