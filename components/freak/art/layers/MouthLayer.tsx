import type { ArtLayerProps } from "@/art/renderer/types";
import { assertNever } from "@/art/renderer/assert-never";

export function MouthLayer({ spec }: ArtLayerProps) {
  const name = spec.immutable.mouth;
  const y = 65 + spec.presentation.headOffsetY;
  const { outline, white, red, skinShadow } = spec.palette;
  let mouth: React.ReactNode;
  switch (name) {
    case "Flat": mouth = <rect x="57" y={y} width="15" height="3" fill={outline} />; break;
    case "Smirk": mouth = <g><rect x="57" y={y} width="11" height="2" fill={outline} /><rect x="67" y={y - 2} width="7" height="2" fill={outline} /></g>; break;
    case "Screaming": mouth = <g><rect x="56" y={y - 3} width="17" height="12" fill="#35181b" stroke={outline} strokeWidth="2" /><rect x="59" y={y - 1} width="11" height="3" fill={white} /><rect x="61" y={y + 5} width="8" height="2" fill={red} /></g>; break;
    case "Broken Tooth": mouth = <g><rect x="55" y={y - 2} width="19" height="8" fill="#392126" /><rect x="57" y={y - 1} width="5" height="4" fill={white} /><polygon points={`${62},${y - 1} ${67},${y - 1} ${64},${y + 3}`} fill="#8c8270" /><rect x="68" y={y - 1} width="4" height="4" fill={white} /></g>; break;
    case "Lip Bite": mouth = <g><rect x="56" y={y - 1} width="17" height="7" fill="#7a343e" /><rect x="59" y={y - 1} width="11" height="3" fill={white} /><rect x="63" y={y + 2} width="9" height="2" fill="#b65360" /></g>; break;
    case "Gum": mouth = <g><rect x="57" y={y - 1} width="15" height="7" fill="#a85b70" /><rect x="60" y={y} width="9" height="2" fill="#dc8ba0" /><rect x="71" y={y + 1} width="5" height="5" fill="#e5a0b1" stroke={outline} strokeWidth="1" /></g>; break;
    case "Cigarette": mouth = <g>{spec.presentation.mouthPose === "MELTDOWN_ACCENT" ? <rect x="56" y={y - 3} width="14" height="10" fill="#35181b" stroke={outline} strokeWidth="2" /> : <rect x="57" y={y} width="13" height="3" fill={outline} />}<rect x="69" y={y + 1} width="17" height="3" fill={white} /><rect x="84" y={y + 1} width="4" height="3" fill="#dd7b45" /><rect x="88" y={y} width="2" height="2" fill={skinShadow} /></g>; break;
    case "Evil Smile": mouth = <g><rect x="55" y={y - 2} width="20" height="8" fill="#3a1d21" /><rect x="58" y={y - 1} width="14" height="3" fill={white} /><rect x="60" y={y + 2} width="3" height="2" fill={outline} /><rect x="67" y={y + 2} width="3" height="2" fill={outline} /></g>; break;
    default: mouth = assertNever(name, "mouth");
  }
  return <g data-layer="mouth" data-mouth-pose={spec.presentation.mouthPose}>{mouth}{spec.presentation.mouthPose === "SMILE_ACCENT" && <><rect x="53" y={y - 1} width="2" height="2" fill={red} opacity="0.7" /><rect x="75" y={y - 1} width="2" height="2" fill={red} opacity="0.7" /></>}{spec.presentation.mouthPose === "FOCUSED_ACCENT" && <><rect x="54" y={y - 2} width="2" height="2" fill={outline} /><rect x="74" y={y - 2} width="2" height="2" fill={outline} /></>}{spec.presentation.mouthPose === "MELTDOWN_ACCENT" && name !== "Cigarette" && <><rect x="53" y={y + 5} width="3" height="2" fill={red} /><rect x="74" y={y + 5} width="3" height="2" fill={red} /></>}</g>;
}
