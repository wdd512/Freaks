import type { ArtLayerAsset, FreakRenderSpec, ImageArtLayerAsset } from "@/art/renderer/types";
import { slug } from "@/art/renderer/deterministic";

const LOCAL_VERSIONED_IMAGE = /^\/art\/v[a-z0-9][a-z0-9._-]*\/(?:[a-z0-9._-]+\/)*[a-z0-9._-]+\.(?:png|webp)$/i;

export function artAssetId(traitSlot: string, value: string): string {
  return `v1:${traitSlot}:${slug(value)}`;
}

export function validateArtLayerAsset(asset: ArtLayerAsset): ArtLayerAsset {
  if (!asset.id || !asset.slot) throw new Error("Art asset descriptor requires id and slot");
  if (asset.sourceType === "SVG_COMPONENT") {
    const raw = asset as ArtLayerAsset & { assetPath?: unknown; placement?: unknown };
    if (raw.assetPath !== undefined || raw.placement !== undefined) throw new Error(`SVG_COMPONENT asset ${asset.id} cannot define image configuration`);
    return asset;
  }
  if (!asset.assetPath || !asset.placement) throw new Error(`IMAGE asset ${asset.id} requires assetPath and placement`);
  if (!LOCAL_VERSIONED_IMAGE.test(asset.assetPath) || asset.assetPath.includes("..") || asset.assetPath.includes("//")) {
    throw new Error(`IMAGE asset ${asset.id} must use a versioned local PNG/WebP path under /public/art/`);
  }
  const { x, y, width, height } = asset.placement;
  if (![x, y, width, height].every(Number.isInteger) || width <= 0 || height <= 0) {
    throw new Error(`IMAGE asset ${asset.id} requires positive integer placement coordinates`);
  }
  return asset;
}

export function findRenderAsset(spec: FreakRenderSpec, traitSlot: string, value: string): ArtLayerAsset {
  const id = artAssetId(traitSlot, value);
  const matches = spec.assets.filter((asset) => asset.id === id);
  if (matches.length !== 1) throw new Error(`Render spec requires exactly one descriptor for ${id}; found ${matches.length}`);
  return validateArtLayerAsset(matches[0]);
}

export function imageAssets(spec: FreakRenderSpec): ImageArtLayerAsset[] {
  return spec.assets.filter((asset): asset is ImageArtLayerAsset => asset.sourceType === "IMAGE").map((asset) => validateArtLayerAsset(asset) as ImageArtLayerAsset);
}
