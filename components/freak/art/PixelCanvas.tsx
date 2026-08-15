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

export function PixelCanvas({ spec, size = 512 }: { spec: FreakRenderSpec; size?: number }) {
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
    <EnvironmentLayer spec={spec} />
    <WorkstationLayer spec={spec} />
    <ScreenLayer spec={spec} />
    <BodyLayer spec={spec} />
    <OutfitLayer spec={spec} />
    <NeckLayer spec={spec} />
    <HeadLayer spec={spec} />
    <HairLayer spec={spec} />
    <EyeLayer spec={spec} />
    <MouthLayer spec={spec} />
    <PropLayer spec={spec} />
    <EffectsLayer spec={spec} />
    <FrameLayer spec={spec} />
  </svg>;
}

