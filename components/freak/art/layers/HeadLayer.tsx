import type { ArtLayerProps } from "@/art/renderer/types";
import { headPoints } from "@/components/freak/art/layers/geometry";

export function HeadLayer({ spec }: ArtLayerProps) {
  const offset = spec.presentation.headOffsetY;
  return <g data-layer="head" transform={`translate(0 ${offset})`}>
    <polygon points={headPoints(spec)} fill={spec.palette.skin} stroke={spec.palette.outline} strokeWidth="2" strokeLinejoin="miter" />
    <rect x="49" y="57" width="3" height="8" fill={spec.palette.skinShadow} />
    {spec.immutable.head === "Big Brain" && <><rect x="53" y="31" width="4" height="2" fill={spec.palette.skinShadow} /><rect x="70" y="30" width="5" height="2" fill={spec.palette.skinShadow} /></>}
    {spec.immutable.head === "Potato" && <rect x="75" y="47" width="3" height="3" fill={spec.palette.skinShadow} />}
    {spec.immutable.head === "Melted" && <rect x="66" y="69" width="3" height="5" fill={spec.palette.skinShadow} />}
    <rect x="62" y="53" width="4" height="8" fill={spec.palette.skinShadow} />
    <rect x="60" y="61" width="7" height="2" fill={spec.palette.skinShadow} />
  </g>;
}

