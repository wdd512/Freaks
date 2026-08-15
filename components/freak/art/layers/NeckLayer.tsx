import type { ArtLayerProps } from "@/art/renderer/types";
import { bodyGeometry } from "@/components/freak/art/layers/geometry";

export function NeckLayer({ spec }: ArtLayerProps) {
  const body = bodyGeometry(spec);
  const offset = spec.presentation.headOffsetY;
  const width = spec.immutable.body === "Lanky" ? 11 : 15;
  return <g data-layer="neck">
    <rect x={64 - width / 2} y={body.neckY + offset} width={width} height={body.neckHeight} fill={spec.palette.skin} stroke={spec.palette.outline} strokeWidth="2" />
    <rect x={64 + width / 2 - 4} y={body.neckY + 3 + offset} width="3" height={Math.max(3, body.neckHeight - 5)} fill={spec.palette.skinShadow} />
  </g>;
}

