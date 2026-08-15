import type { ArtLayerProps } from "@/art/renderer/types";

export function WorkstationLayer({ spec }: ArtLayerProps) {
  const name = spec.dynamic.workstation;
  const y = spec.presentation.deskY;
  const { desk, outline, metal, gold, purple } = spec.palette;
  let base: React.ReactNode;
  switch (name) {
    case "Floor Setup": base = <><rect x="12" y={y + 5} width="104" height="5" fill="#3d3430" /><rect x="20" y={y + 10} width="88" height="3" fill="#745a45" /><rect x="27" y={y + 1} width="74" height="5" fill="#282a27" /></>; break;
    case "Cardboard Desk": base = <><rect x="11" y={y} width="106" height="7" fill="#9b7148" stroke={outline} strokeWidth="2" /><polygon points={`17,${y + 7} 33,${y + 7} 30,126 20,126`} fill="#745033" /><polygon points={`95,${y + 7} 111,${y + 7} 108,126 98,126`} fill="#745033" /><rect x="50" y={y + 2} width="27" height="2" fill="#c18d58" /></>; break;
    case "Folding Desk": base = <><rect x="9" y={y} width="110" height="6" fill={desk} stroke={outline} strokeWidth="2" /><path d={`M20 ${y + 6}L34 127M108 ${y + 6}L94 127`} stroke={metal} strokeWidth="3" /><path d={`M34 ${y + 6}L20 127M94 ${y + 6}L108 127`} stroke="#58615d" strokeWidth="2" /></>; break;
    case "IKEA Desk": base = <><rect x="8" y={y} width="112" height="7" fill="#b99b76" stroke={outline} strokeWidth="2" /><rect x="15" y={y + 7} width="7" height={128 - y - 7} fill="#83705a" /><rect x="106" y={y + 7} width="7" height={128 - y - 7} fill="#83705a" /></>; break;
    case "Office Desk": base = <><rect x="7" y={y} width="114" height="8" fill="#544239" stroke={outline} strokeWidth="2" /><rect x="12" y={y + 8} width="28" height={128 - y - 8} fill="#342d29" /><rect x="88" y={y + 8} width="28" height={128 - y - 8} fill="#342d29" /><rect x="17" y={y + 13} width="17" height="2" fill={metal} /></>; break;
    case "Gaming Desk": base = <><polygon points={`5,${y + 2} 123,${y + 2} 116,${y + 10} 12,${y + 10}`} fill="#25262a" stroke={purple} strokeWidth="2" /><path d={`M20 ${y + 10}L14 128M108 ${y + 10}L114 128`} stroke="#3f4147" strokeWidth="5" /><rect x="27" y={y + 5} width="74" height="2" fill={purple} /></>; break;
    case "Standing Desk": base = <><rect x="6" y={y} width="116" height="7" fill="#4f5652" stroke={outline} strokeWidth="2" /><rect x="18" y={y + 7} width="5" height={128 - y - 7} fill={metal} /><rect x="105" y={y + 7} width="5" height={128 - y - 7} fill={metal} /><rect x="15" y="121" width="14" height="3" fill={metal} /><rect x="99" y="121" width="14" height="3" fill={metal} /></>; break;
    default: base = <><rect x="3" y={y} width="122" height="9" fill="#252c2b" stroke={gold} strokeWidth="2" /><rect x="9" y={y + 9} width="110" height="18" fill="#121817" stroke="#56605c" strokeWidth="2" />{[18, 34, 50, 66, 82, 98].map((x) => <rect key={x} x={x} y={y + 14} width="8" height="3" fill={x % 3 ? spec.palette.green : spec.palette.red} />)}</>;
  }
  return <g data-layer="workstation">{base}</g>;
}

