import type { FreakRenderSpec } from "@/art/renderer/types";
import { slug, stableHash } from "@/art/renderer/deterministic";

function recordFingerprint(record: Record<string, unknown>): string {
  return Object.entries(record)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${slug(key)}=${slug(String(value))}`)
    .join(",");
}

/**
 * Canonicalizes only state that can affect rendered pixels. Token identity and
 * display metadata are intentionally excluded; the canonical render signature
 * remains the token-specific integrity identifier.
 */
export function buildVisualFingerprint(spec: FreakRenderSpec): string {
  const fields: [string, string][] = [
    ["body", spec.immutable.body], ["skin", spec.immutable.skin], ["head", spec.immutable.head],
    ["eyes", spec.immutable.eyes], ["mouth", spec.immutable.mouth], ["hair", spec.immutable.hair],
    ["outfit", spec.dynamic.outfit], ["workstation", spec.dynamic.workstation], ["screens", spec.dynamic.screens],
    ["prop", spec.dynamic.prop], ["environment", spec.dynamic.environment],
    ["career", spec.state.careerLevel], ["mood", spec.state.mood], ["active", String(spec.state.active)],
    ["effects", [...spec.effects].sort().map(slug).join(",") || "none"],
    ["presentation", recordFingerprint(spec.presentation)],
    ["palette", recordFingerprint(spec.palette)],
    ["assets", [...spec.assets].sort((left, right) => left.id.localeCompare(right.id)).map((asset) => {
      if (asset.sourceType === "SVG_COMPONENT") return `${asset.id}@svg`;
      const { x, y, width, height } = asset.placement;
      return `${asset.id}@image@${asset.assetPath}@${x},${y},${width},${height}`;
    }).join(",")],
  ];
  return fields.map(([key, value]) => `${key}:${slug(value)}`).join("|");
}

export function buildVisualFingerprintHash(specOrFingerprint: FreakRenderSpec | string): string {
  const fingerprint = typeof specOrFingerprint === "string" ? specOrFingerprint : buildVisualFingerprint(specOrFingerprint);
  return stableHash(fingerprint).toString(16).padStart(8, "0");
}

