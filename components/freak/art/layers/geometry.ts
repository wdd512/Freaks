import { BODY_GEOMETRY, HEAD_POINTS, type BodyName } from "@/art/manifest/immutable";
import type { FreakRenderSpec } from "@/art/renderer/types";

export function bodyGeometry(spec: FreakRenderSpec) {
  return BODY_GEOMETRY[spec.immutable.body as BodyName] ?? BODY_GEOMETRY.Average;
}

export function headPoints(spec: FreakRenderSpec): string {
  const points = HEAD_POINTS[spec.immutable.head] ?? HEAD_POINTS.Round;
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}

