import { readFile } from "node:fs/promises";
import path from "node:path";

const LOCAL_IMAGE_REFERENCE = /href="(\/art\/v[a-z0-9][a-z0-9._/-]*\.(png|webp))"/gi;

export async function inlineLocalArtAssets(svg: string, publicDirectory = path.resolve(process.cwd(), "public")): Promise<string> {
  const matches = [...svg.matchAll(LOCAL_IMAGE_REFERENCE)];
  let inlined = svg;
  for (const match of matches) {
    const publicPath = match[1];
    const extension = match[2].toLowerCase();
    const relative = publicPath.slice(1).split("/");
    if (relative.some((segment) => segment === ".." || segment === "")) throw new Error(`Invalid local art path in SVG: ${publicPath}`);
    const absolute = path.resolve(publicDirectory, ...relative);
    const expectedRoot = path.resolve(publicDirectory, "art") + path.sep;
    if (!absolute.startsWith(expectedRoot)) throw new Error(`Art image escapes public/art: ${publicPath}`);
    let data: Buffer;
    try {
      data = await readFile(absolute);
    } catch (error) {
      throw new Error(`Missing local art image for export: ${absolute}`, { cause: error });
    }
    const mime = extension === "png" ? "image/png" : "image/webp";
    inlined = inlined.replaceAll(`href="${publicPath}"`, `href="data:${mime};base64,${data.toString("base64")}"`);
  }
  return inlined;
}
