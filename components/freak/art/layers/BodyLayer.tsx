import type { ArtLayerProps } from "@/art/renderer/types";
import { bodyGeometry } from "@/components/freak/art/layers/geometry";

export function BodyLayer({ spec }: ArtLayerProps) {
  const body = bodyGeometry(spec);
  const isHunched = spec.immutable.body === "Hunched";
  const shoulderY = body.y + (isHunched ? 4 : 0);
  return <g data-layer="body">
    <rect x={body.x} y={shoulderY} width={body.width} height={body.height} fill={spec.palette.clothingDark} stroke={spec.palette.outline} strokeWidth="2" />
    <polygon points={`${body.x},${shoulderY + 4} ${body.x - 7},${shoulderY + 11} ${body.x - 4},${Math.min(124, shoulderY + body.armDrop + 21)} ${body.x + 3},${shoulderY + 13}`} fill={spec.palette.skinShadow} stroke={spec.palette.outline} strokeWidth="2" />
    <polygon points={`${body.x + body.width},${shoulderY + 4} ${body.x + body.width + 7},${shoulderY + 11} ${body.x + body.width + 4},${Math.min(124, shoulderY + body.armDrop + 21)} ${body.x + body.width - 3},${shoulderY + 13}`} fill={spec.palette.skinShadow} stroke={spec.palette.outline} strokeWidth="2" />
    {spec.immutable.body === "Wide Shoulders" && <><rect x="28" y={shoulderY + 2} width="10" height="5" fill={spec.palette.clothing} /><rect x="90" y={shoulderY + 2} width="10" height="5" fill={spec.palette.clothing} /></>}
    {spec.immutable.body === "Heavy" && <rect x={body.x + 7} y={shoulderY + 27} width={body.width - 14} height="6" fill={spec.palette.clothing} />}
  </g>;
}

