import type { ArtLayerProps } from "@/art/renderer/types";
import { bodyGeometry } from "@/components/freak/art/layers/geometry";
import { assertNever } from "@/art/renderer/assert-never";

export function OutfitLayer({ spec }: ArtLayerProps) {
  const name = spec.dynamic.outfit;
  const body = bodyGeometry(spec);
  const y = body.y + (spec.immutable.body === "Hunched" ? 4 : 0);
  const x = body.x + 2;
  const w = body.width - 4;
  const h = Math.min(body.height - 2, 128 - y);
  const { clothing, clothingDark, outline, white, gold, purple } = spec.palette;
  let detail: React.ReactNode;
  switch (name) {
    case "Stained Tee": detail = <><rect x={x} y={y} width={w} height={h} fill="#665a50" /><rect x={x + w * 0.62} y={y + 12} width="6" height="5" fill="#3d302a" /><rect x={x + 7} y={y + 23} width="4" height="3" fill="#806b52" /></>; break;
    case "Bathrobe": detail = <><rect x={x} y={y} width={w} height={h} fill="#705d72" /><path d={`M${x + 3} ${y}L${x + w / 2} ${y + 19}L${x + w - 3} ${y}`} fill="none" stroke="#a78ea9" strokeWidth="4" /><rect x={x + 5} y={y + 24} width={w - 10} height="3" fill="#b29ab3" /></>; break;
    case "Basic Tee": detail = <><rect x={x} y={y} width={w} height={h} fill={clothing} /><rect x={x + w / 2 - 5} y={y} width="10" height="4" fill={clothingDark} /></>; break;
    case "Cheap Hoodie": detail = <><rect x={x} y={y} width={w} height={h} fill="#4b5862" /><path d={`M${x + 4} ${y + 1}L${x + w / 2} ${y + 12}L${x + w - 4} ${y + 1}`} fill="none" stroke="#28353b" strokeWidth="3" /><rect x={x + w / 2 - 1} y={y + 12} width="2" height={h - 12} fill="#28353b" /><rect x={x + w / 2 - 9} y={y + 23} width="18" height="7" fill="#394751" /></>; break;
    case "Oversized Hoodie": detail = <><rect x={x - 3} y={y} width={w + 6} height={h} fill="#3b3e4d" /><polygon points={`${x},${y} ${x + w / 2},${y + 14} ${x + w},${y}`} fill="#565a70" /><rect x={x + 4} y={y + h - 10} width={w - 8} height="7" fill="#292b36" /></>; break;
    case "Track Jacket": detail = <><rect x={x} y={y} width={w} height={h} fill="#334d48" /><rect x={x + w / 2 - 1} y={y} width="2" height={h} fill={white} /><rect x={x + 3} y={y + 5} width="3" height={h - 9} fill="#ccdbd4" /><rect x={x + w - 6} y={y + 5} width="3" height={h - 9} fill="#ccdbd4" /></>; break;
    case "Office Shirt": detail = <><rect x={x} y={y} width={w} height={h} fill="#b8c7bf" /><polygon points={`${x + 4},${y} ${x + w / 2},${y + 12} ${x + 15},${y + 4}`} fill={white} /><polygon points={`${x + w - 4},${y} ${x + w / 2},${y + 12} ${x + w - 15},${y + 4}`} fill={white} /><rect x={x + w / 2 - 2} y={y + 10} width="4" height="17" fill="#85535b" /></>; break;
    case "Tech Vest": detail = <><rect x={x} y={y} width={w} height={h} fill="#263936" /><rect x={x + 5} y={y + 7} width="12" height="10" fill="#49655f" /><rect x={x + w - 17} y={y + 7} width="12" height="10" fill="#49655f" /><rect x={x + w / 2 - 1} y={y} width="2" height={h} fill={spec.palette.green} /></>; break;
    case "Half Suit": detail = <><rect x={x} y={y} width={w} height={h} fill="#282b38" /><polygon points={`${x},${y} ${x + w / 2},${y + 20} ${x + w / 2 - 2},${y + h} ${x},${y + h}`} fill="#3b4050" /><polygon points={`${x + w},${y} ${x + w / 2},${y + 20} ${x + w / 2 + 2},${y + h} ${x + w},${y + h}`} fill="#222530" /><rect x={x + w / 2 - 2} y={y + 9} width="4" height="20" fill={purple} /></>; break;
    case "Luxury Coat": detail = <><rect x={x - 2} y={y} width={w + 4} height={h} fill="#25242c" /><path d={`M${x} ${y}L${x + w / 2} ${y + 18}L${x + w} ${y}`} fill="none" stroke="#625b6d" strokeWidth="5" /><rect x={x + 5} y={y + 23} width={w - 10} height="3" fill={gold} /><rect x={x + 7} y={y + 28} width="5" height="5" fill={gold} /></>; break;
    case "Torn Hoodie": detail = <><rect x={x} y={y} width={w} height={h} fill="#554d4b" /><polygon points={`${x + 3},${y} ${x + w / 2},${y + 14} ${x + w - 3},${y}`} fill="#6a5e59" /><rect x={x + 4} y={y + 22} width="10" height="4" fill="#272626" /></>; break;
    case "Clean Hoodie": detail = <><rect x={x} y={y} width={w} height={h} fill="#26393b" /><polygon points={`${x + 3},${y} ${x + w / 2},${y + 14} ${x + w - 3},${y}`} fill="#43575a" /><rect x={x + w / 2 - 1} y={y + 12} width="2" height={h - 12} fill="#111817" /></>; break;
    case "Pattern Hoodie": detail = <><rect x={x} y={y} width={w} height={h} fill="#463755" /><polygon points={`${x + 3},${y} ${x + w / 2},${y + 14} ${x + w - 3},${y}`} fill="#6b547c" />{[x + 6, x + 17, x + 28].map((px, index) => <rect key={px} x={px} y={y + 22 + index % 2 * 5} width="4" height="4" fill={index % 2 ? spec.palette.gold : spec.palette.green} />)}</>; break;
    default: detail = assertNever(name, "outfit");
  }
  return <g data-layer="outfit" stroke={outline} strokeWidth="1">{detail}</g>;
}
