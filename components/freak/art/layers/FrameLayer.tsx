import type { ArtLayerProps } from "@/art/renderer/types";
import { PixelText } from "@/components/freak/art/primitives/PixelText";

export function FrameLayer({ spec }: ArtLayerProps) {
  const accent = spec.state.careerLevel === "MARKET_GOD" ? spec.palette.gold : spec.palette.green;
  return <g data-layer="frame">
    <rect x="2" y="2" width="124" height="124" fill="none" stroke={spec.palette.outline} strokeWidth="4" />
    <rect x="4" y="119" width="120" height="5" fill="#07100f" opacity="0.88" />
    <PixelText text={`#${String(spec.tokenId).padStart(4, "0")} // ${spec.state.careerLevel}`} x={7} y={119} color={accent} />
    {spec.state.active && <g className="pixel-live"><rect x="99" y="6" width="24" height="9" fill="#07100f" stroke={spec.palette.green} strokeWidth="1" /><rect x="102" y="9" width="3" height="3" fill={spec.palette.green} /><PixelText text="LIVE" x={107} y={8} color={spec.palette.green} /></g>}
  </g>;
}
