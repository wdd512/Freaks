import { notFound } from "next/navigation";
import { generateCollection } from "@/domain/rarity/generator";
import { ArtLabClient } from "@/components/freak/art/ArtLabClient";

export const dynamic = "force-dynamic";

export default function ArtLabPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const preview = generateCollection(50, "pnl-freaks-art-v1").freaks;
  return <ArtLabClient preview={preview} />;
}

