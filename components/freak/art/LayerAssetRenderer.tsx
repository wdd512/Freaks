import type { ReactNode } from "react";
import type { ArtLayerAsset } from "@/art/renderer/types";
import { validateArtLayerAsset } from "@/art/renderer/assets";

type LayerAssetRendererProps = {
  asset: ArtLayerAsset;
  svgFallback: ReactNode;
  offset?: { x: number; y: number };
  headwear?: { mode: string; fit: { x: number; y: number } };
};

export function LayerAssetRenderer({ asset, svgFallback, offset = { x: 0, y: 0 }, headwear }: LayerAssetRendererProps) {
  const valid = validateArtLayerAsset(asset);
  if (valid.sourceType === "SVG_COMPONENT") return <>{svgFallback}</>;
  const { x, y, width, height } = valid.placement;
  return <g
    data-layer={valid.slot}
    data-art-asset={valid.id}
    data-asset-source="IMAGE"
    data-headwear-mode={headwear?.mode}
    data-headwear-fit={headwear ? `${headwear.fit.x},${headwear.fit.y}` : undefined}
    transform={offset.x || offset.y ? `translate(${offset.x} ${offset.y})` : undefined}
  >
    <image
      href={valid.assetPath}
      x={x}
      y={y}
      width={width}
      height={height}
      preserveAspectRatio="none"
      style={{ imageRendering: "pixelated" }}
    />
  </g>;
}
