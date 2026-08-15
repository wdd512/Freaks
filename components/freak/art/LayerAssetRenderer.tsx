import type { ReactNode } from "react";
import type { ArtLayerAsset } from "@/art/renderer/types";
import { validateArtLayerAsset } from "@/art/renderer/assets";

export function LayerAssetRenderer({ asset, svgFallback }: { asset: ArtLayerAsset; svgFallback: ReactNode }) {
  const valid = validateArtLayerAsset(asset);
  if (valid.sourceType === "SVG_COMPONENT") return <>{svgFallback}</>;
  const { x, y, width, height } = valid.placement;
  return <image
    data-layer={valid.slot}
    data-art-asset={valid.id}
    data-asset-source="IMAGE"
    href={valid.assetPath}
    x={x}
    y={y}
    width={width}
    height={height}
    preserveAspectRatio="none"
    style={{ imageRendering: "pixelated" }}
  />;
}

