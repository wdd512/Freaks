import type { FreakRenderSpec } from "@/art/renderer/types";
import { slug } from "@/art/renderer/deterministic";

export function buildRenderSignature(spec: FreakRenderSpec): string {
  const fields: [string, string][] = [
    ["token", String(spec.tokenId)], ["body", spec.immutable.body], ["skin", spec.immutable.skin], ["head", spec.immutable.head],
    ["eyes", spec.immutable.eyes], ["mouth", spec.immutable.mouth], ["hair", spec.immutable.hair],
    ["outfit", spec.dynamic.outfit], ["desk", spec.dynamic.workstation], ["screens", spec.dynamic.screens],
    ["prop", spec.dynamic.prop], ["env", spec.dynamic.environment], ["career", spec.state.careerLevel],
    ["mood", spec.state.mood], ["active", String(spec.state.active)],
    ["effects", [...spec.effects].sort().map(slug).join(",") || "none"],
    ["presentation", Object.entries(spec.presentation).sort(([left], [right]) => left.localeCompare(right)).map(([key, value]) => `${slug(key)}=${slug(String(value))}`).join(",")],
    ["palette", Object.entries(spec.palette).sort(([left], [right]) => left.localeCompare(right)).map(([key, value]) => `${slug(key)}=${value.toLowerCase()}`).join(",")],
    ["assets", [...spec.assets].sort((left, right) => left.id.localeCompare(right.id)).map((asset) => {
      if (asset.sourceType === "SVG_COMPONENT") return `${asset.id}@svg`;
      const placement = asset.placement;
      return `${asset.id}@image@${asset.assetPath}@${placement.x},${placement.y},${placement.width},${placement.height}`;
    }).join(",")],
  ];
  return [`art-${spec.version}`, ...fields.map(([key, value]) => `${key}:${slug(value)}`)].join("|");
}
