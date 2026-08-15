import type { FreakRenderSpec } from "@/art/renderer/types";
import { slug } from "@/art/renderer/deterministic";

export function buildRenderSignature(spec: FreakRenderSpec): string {
  const fields: [string, string][] = [
    ["body", spec.immutable.body], ["skin", spec.immutable.skin], ["head", spec.immutable.head],
    ["eyes", spec.immutable.eyes], ["mouth", spec.immutable.mouth], ["hair", spec.immutable.hair],
    ["outfit", spec.dynamic.outfit], ["desk", spec.dynamic.workstation], ["screens", spec.dynamic.screens],
    ["prop", spec.dynamic.prop], ["env", spec.dynamic.environment], ["career", spec.state.careerLevel],
    ["mood", spec.state.mood], ["active", String(spec.state.active)],
  ];
  return [`art-${spec.version}`, ...fields.map(([key, value]) => `${key}:${slug(value)}`)].join("|");
}

