import type { ArtLayerProps } from "@/art/renderer/types";

export function FrameLayer({ spec }: ArtLayerProps) {
  const accent = spec.state.careerLevel === "MARKET_GOD" ? spec.palette.gold : spec.palette.green;
  return <g data-layer="frame">
    <rect x="2" y="2" width="124" height="124" fill="none" stroke={spec.palette.outline} strokeWidth="4" />
    <rect x="4" y="119" width="120" height="5" fill="#07100f" opacity="0.88" />
    <text x="7" y="123" fill={accent} fontFamily="monospace" fontSize="4">{`#${String(spec.tokenId).padStart(4, "0")} // ${spec.state.careerLevel}`}</text>
    {spec.state.active && <g className="pixel-live"><rect x="103" y="6" width="19" height="8" fill="#07100f" stroke={spec.palette.green} strokeWidth="1" /><rect x="106" y="9" width="3" height="3" fill={spec.palette.green} /><text x="111" y="12" fill={spec.palette.green} fontFamily="monospace" fontSize="4">LIVE</text></g>}
  </g>;
}

