import { renderToStaticMarkup } from "react-dom/server";
import type { FreakRenderSpec } from "@/art/renderer/types";
import { PixelCanvas } from "@/components/freak/art/PixelCanvas";

export function renderStaticSvg(spec: FreakRenderSpec, includeXmlDeclaration = true): string {
  const markup = renderToStaticMarkup(<PixelCanvas spec={spec} size={512} />);
  return includeXmlDeclaration ? `<?xml version="1.0" encoding="UTF-8"?>${markup}` : markup;
}

