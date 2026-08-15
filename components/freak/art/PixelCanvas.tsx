import type { FreakRenderSpec } from "@/art/renderer/types";
import { BackgroundLayer } from "@/components/freak/art/layers/BackgroundLayer";
import { EnvironmentLayer } from "@/components/freak/art/layers/EnvironmentLayer";
import { WorkstationLayer } from "@/components/freak/art/layers/WorkstationLayer";
import { ScreenLayer } from "@/components/freak/art/layers/ScreenLayer";
import { BodyLayer } from "@/components/freak/art/layers/BodyLayer";
import { OutfitLayer } from "@/components/freak/art/layers/OutfitLayer";
import { NeckLayer } from "@/components/freak/art/layers/NeckLayer";
import { HeadLayer } from "@/components/freak/art/layers/HeadLayer";
import { HairLayer } from "@/components/freak/art/layers/HairLayer";
import { EyeLayer } from "@/components/freak/art/layers/EyeLayer";
import { MouthLayer } from "@/components/freak/art/layers/MouthLayer";
import { PropLayer } from "@/components/freak/art/layers/PropLayer";
import { EffectsLayer } from "@/components/freak/art/layers/EffectsLayer";
import { FrameLayer } from "@/components/freak/art/layers/FrameLayer";
import { LayerAssetRenderer } from "@/components/freak/art/LayerAssetRenderer";
import { findRenderAsset } from "@/art/renderer/assets";
import { TintedLayerAssetRenderer } from "@/components/freak/art/TintedLayerAssetRenderer";
import { resolveHeadwearFit } from "@/art/rules/compatibility";

export function PixelCanvas({ spec, size = 512 }: { spec: FreakRenderSpec; size?: number }) {
  const headOffset = { x: 0, y: spec.presentation.headOffsetY };
  const headwearFit = resolveHeadwearFit(spec.presentation.headwearMode, spec.immutable.head);
  const hairOffset = { x: headwearFit.x, y: spec.presentation.headOffsetY + headwearFit.y };
  return <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 128 128"
    width={size}
    height={size}
    role="img"
    aria-label={`Pixel artwork of Freak #${spec.tokenId}`}
    shapeRendering="crispEdges"
    style={{ imageRendering: "pixelated" }}
  >
    <BackgroundLayer spec={spec} />
    <LayerAssetRenderer asset={findRenderAsset(spec, "environment", spec.dynamic.environment)} svgFallback={<EnvironmentLayer spec={spec} />} />
    <LayerAssetRenderer asset={findRenderAsset(spec, "workstation", spec.dynamic.workstation)} svgFallback={<WorkstationLayer spec={spec} />} />
    <LayerAssetRenderer asset={findRenderAsset(spec, "screens", spec.dynamic.screens)} svgFallback={<ScreenLayer spec={spec} />} />
    <TintedLayerAssetRenderer asset={findRenderAsset(spec, "body", spec.immutable.body)} skinAsset={findRenderAsset(spec, "skin", spec.immutable.skin)} skinColor={spec.palette.skin} tokenId={spec.tokenId} svgFallback={<BodyLayer spec={spec} />} />
    <LayerAssetRenderer asset={findRenderAsset(spec, "outfit", spec.dynamic.outfit)} svgFallback={<OutfitLayer spec={spec} />} />
    <NeckLayer spec={spec} />
    <TintedLayerAssetRenderer asset={findRenderAsset(spec, "head", spec.immutable.head)} skinAsset={findRenderAsset(spec, "skin", spec.immutable.skin)} skinColor={spec.palette.skin} tokenId={spec.tokenId} offset={headOffset} svgFallback={<HeadLayer spec={spec} />} />
    <LayerAssetRenderer asset={findRenderAsset(spec, "hair", spec.immutable.hair)} offset={hairOffset} headwear={{ mode: spec.presentation.headwearMode, fit: headwearFit }} svgFallback={<HairLayer spec={spec} />} />
    <LayerAssetRenderer asset={findRenderAsset(spec, "eyes", spec.immutable.eyes)} offset={headOffset} svgFallback={<EyeLayer spec={spec} />} />
    <LayerAssetRenderer asset={findRenderAsset(spec, "mouth", spec.immutable.mouth)} offset={headOffset} svgFallback={<MouthLayer spec={spec} />} />
    <LayerAssetRenderer asset={findRenderAsset(spec, "prop", spec.dynamic.prop)} svgFallback={<PropLayer spec={spec} />} />
    <EffectsLayer spec={spec} />
    <FrameLayer spec={spec} />
  </svg>;
}
