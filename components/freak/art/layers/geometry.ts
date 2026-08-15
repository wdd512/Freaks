import { BODY_GEOMETRY, HEAD_POINTS } from "@/art/manifest/immutable";
import type { FreakRenderSpec } from "@/art/renderer/types";

export function bodyGeometry(spec: FreakRenderSpec) {
  return BODY_GEOMETRY[spec.immutable.body];
}

export function headPoints(spec: FreakRenderSpec): string {
  const points = HEAD_POINTS[spec.immutable.head];
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}
