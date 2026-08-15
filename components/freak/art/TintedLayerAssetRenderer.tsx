import type { ReactNode } from "react";
import type { ArtLayerAsset } from "@/art/renderer/types";
import { slug } from "@/art/renderer/deterministic";
import { validateArtLayerAsset } from "@/art/renderer/assets";

export function TintedLayerAssetRenderer({ asset, skinAsset, skinColor, tokenId, svgFallback, offset = { x: 0, y: 0 } }: {
  asset: ArtLayerAsset; skinAsset: ArtLayerAsset; skinColor: string; tokenId: number; svgFallback: ReactNode;
  offset?: { x: number; y: number };
}) {
  const valid = validateArtLayerAsset(asset);
  const validSkin = validateArtLayerAsset(skinAsset);
  if (valid.sourceType === "SVG_COMPONENT") return <>{svgFallback}</>;
  const maskId = `skin-mask-${tokenId}-${slug(valid.id)}`;
  const { x, y, width, height } = valid.placement;
  return <g
    data-layer={valid.slot}
    data-art-asset={valid.id}
    data-asset-source="IMAGE"
    data-production-tint="skin"
    transform={offset.x || offset.y ? `translate(${offset.x} ${offset.y})` : undefined}
  >
    <defs><mask id={maskId} maskUnits="userSpaceOnUse" x={x} y={y} width={width} height={height}>
      <image href={valid.assetPath} x={x} y={y} width={width} height={height} preserveAspectRatio="none" style={{ imageRendering: "pixelated" }} />
    </mask></defs>
    {validSkin.sourceType === "IMAGE"
      ? <image data-skin-asset={validSkin.id} href={validSkin.assetPath} x={validSkin.placement.x} y={validSkin.placement.y} width={validSkin.placement.width} height={validSkin.placement.height} preserveAspectRatio="none" mask={`url(#${maskId})`} style={{ imageRendering: "pixelated" }} />
      : <rect x={x} y={y} width={width} height={height} fill={skinColor} mask={`url(#${maskId})`} />}
    <image href={valid.assetPath} x={x} y={y} width={width} height={height} preserveAspectRatio="none" style={{ imageRendering: "pixelated", mixBlendMode: "multiply" }} />
  </g>;
}
