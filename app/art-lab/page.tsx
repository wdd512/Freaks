import { notFound } from "next/navigation";
import { generateCollection } from "@/domain/rarity/generator";
import { ArtLabClient } from "@/components/freak/art/ArtLabClient";
import { createMiniCollection, MINI_COLLECTION_V1_COUNT, MINI_COLLECTION_V1_SEED } from "@/art/qa/mini-collection";
import { findMissingMiniCollectionImageLayers } from "@/art/qa/mini-collection-files";

export const dynamic = "force-dynamic";

export default async function ArtLabPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const preview = generateCollection(MINI_COLLECTION_V1_COUNT, MINI_COLLECTION_V1_SEED).freaks;
  const miniCollection = createMiniCollection(preview);
  const missingImageLayers = await findMissingMiniCollectionImageLayers(miniCollection);
  return <ArtLabClient preview={preview} miniCollection={miniCollection} missingImageLayers={missingImageLayers} />;
}
