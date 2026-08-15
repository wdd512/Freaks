import type { ArtLayerProps } from "@/art/renderer/types";

function Chart({ x, y, width, height, color, cracked = false, active = false }: { x: number; y: number; width: number; height: number; color: string; cracked?: boolean; active?: boolean }) {
  return <g><rect x={x} y={y} width={width} height={height} fill="#06110f" stroke="#5b6863" strokeWidth="2" />
    <path className={active ? "pixel-candle" : undefined} d={`M${x + 3} ${y + height - 4}h4v-5h4v2h4v-8h4v5h4v-10h${Math.max(2, width - 28)}`} fill="none" stroke={color} strokeWidth="2" />
    {cracked && <path d={`M${x + width - 8} ${y + 1}l-5 7 4 4-7 8`} fill="none" stroke="#d8e2dc" strokeWidth="1" />}
  </g>;
}

export function ScreenLayer({ spec }: ArtLayerProps) {
  const name = spec.dynamic.screens;
  const active = spec.state.active;
  const color = spec.state.mood === "TILTED" || spec.state.mood === "MELTDOWN" ? spec.palette.red : spec.palette.green;
  const deskY = spec.presentation.deskY;
  let screens: React.ReactNode;
  switch (name) {
    case "Phone Only": screens = <g><rect x="82" y={deskY - 13} width="10" height="15" fill="#101716" stroke="#78837e" strokeWidth="2" /><rect x="85" y={deskY - 9} width="4" height="5" fill={color} /></g>; break;
    case "Cracked Laptop": screens = <g transform={`translate(0 ${deskY - 98})`}><Chart x={43} y={72} width={42} height={24} color={color} cracked active={active} /><polygon points="38,98 91,98 85,102 43,102" fill="#606965" /></g>; break;
    case "CRT": screens = <g transform={`translate(0 ${deskY - 99})`}><Chart x={42} y={65} width={44} height={31} color={color} active={active} /><rect x="50" y="97" width="28" height="5" fill="#6f7773" /></g>; break;
    case "Single Monitor": screens = <g transform={`translate(0 ${deskY - 99})`}><Chart x={39} y={61} width={50} height={34} color={color} active={active} /><rect x="62" y="95" width="4" height="7" fill="#707a75" /></g>; break;
    case "Dual Monitor": screens = <g transform={`translate(0 ${deskY - 99})`}><Chart x={12} y={63} width={48} height={31} color={color} active={active} /><Chart x={68} y={60} width={48} height={34} color={spec.palette.red} active={active} /></g>; break;
    case "Triple Monitor": screens = <g transform={`translate(0 ${deskY - 99})`}><Chart x={4} y={65} width={38} height={28} color={color} active={active} /><Chart x={45} y={57} width={38} height={35} color={spec.palette.green} active={active} /><Chart x={86} y={65} width={38} height={28} color={spec.palette.red} active={active} /></g>; break;
    case "Ultrawide": screens = <g transform={`translate(0 ${deskY - 99})`}><Chart x={13} y={57} width={102} height={35} color={color} active={active} /><rect x="60" y="92" width="8" height="9" fill="#6d7772" /></g>; break;
    default: screens = <g>{[[4, 25], [44, 19], [84, 25], [24, 50], [64, 49]].map(([x, y], i) => <Chart key={`${x}-${y}`} x={x} y={y} width={38} height={23} color={i % 2 ? spec.palette.red : color} active={active} />)}</g>;
  }
  return <g data-layer="screens" className={active ? "pixel-screen-live" : undefined}>{screens}</g>;
}

