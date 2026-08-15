import type { CareerLevel, FreakDNA, Mood } from "@/domain/types";
import { buildRenderSpec } from "@/art/renderer/build-render-spec";
import { PixelCanvas } from "@/components/freak/art/PixelCanvas";

export function FreakRenderer({ tokenId, dna, careerLevel, mood, active = false, className = "" }: {
  tokenId: number;
  dna: FreakDNA;
  careerLevel: CareerLevel;
  mood: Mood;
  active?: boolean;
  className?: string;
}) {
  const spec = buildRenderSpec({ tokenId, dna, careerLevel, mood, active });
  return <div
    className={`freak-art ${active ? "is-active" : ""} ${className}`}
    title={`${spec.dynamic.outfit}, ${spec.dynamic.environment}`}
    data-art-version={spec.version}
  ><PixelCanvas spec={spec} /></div>;
}

