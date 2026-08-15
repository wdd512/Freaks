import type { CareerLevel, FreakDNA, Mood } from "@/domain/types";
import { FreakRenderer } from "@/components/freak/art/FreakRenderer";

/** Stable product-facing facade for the versioned art renderer. */
export function FreakArt(props: {
  tokenId: number;
  dna: FreakDNA;
  careerLevel: CareerLevel;
  mood: Mood;
  active?: boolean;
  className?: string;
}) {
  return <FreakRenderer {...props} />;
}
