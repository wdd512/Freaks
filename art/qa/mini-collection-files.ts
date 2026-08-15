import { access } from "node:fs/promises";
import path from "node:path";
import type { MiniCollectionEntry } from "@/art/qa/mini-collection";

export async function findMissingMiniCollectionImageLayers(entries: readonly MiniCollectionEntry[], publicDirectory = path.resolve(process.cwd(), "public")): Promise<string[]> {
  const paths = [...new Set(entries.flatMap((entry) => entry.imageAssetPaths))];
  const missing: string[] = [];
  for (const assetPath of paths) {
    const relative = assetPath.replace(/^\/+/, "").split("/");
    if (relative.some((segment) => !segment || segment === "..")) {
      missing.push(assetPath);
      continue;
    }
    const absolute = path.resolve(publicDirectory, ...relative);
    const expectedRoot = path.resolve(publicDirectory, "art") + path.sep;
    if (!absolute.startsWith(expectedRoot)) {
      missing.push(assetPath);
      continue;
    }
    try {
      await access(absolute);
    } catch {
      missing.push(assetPath);
    }
  }
  return missing.sort();
}

