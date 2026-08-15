import type { ArtLayerProps } from "@/art/renderer/types";
import { assertNever } from "@/art/renderer/assert-never";

function Window({ luxury = false }: { luxury?: boolean }) {
  return <g><rect x="8" y="14" width="112" height="50" fill="#09191c" stroke="#465b57" strokeWidth="2" />
    <rect x="63" y="15" width="2" height="48" fill="#465b57" />
    {[18, 28, 39, 50, 72, 83, 95, 108].map((x, index) => <rect key={x} x={x} y={45 - (index % 3) * 6} width="7" height={18 + (index % 3) * 6} fill={luxury ? "#1e3340" : "#14262e"} />)}
    {[21, 33, 52, 77, 99, 112].map((x) => <rect key={x} x={x} y={51 + (x % 7)} width="2" height="2" fill={luxury ? "#efc758" : "#c17aff"} />)}
  </g>;
}

export function EnvironmentLayer({ spec }: ArtLayerProps) {
  const name = spec.dynamic.environment;
  let art: React.ReactNode;
  switch (name) {
    case "Basement": art = <><rect x="0" y="13" width="128" height="55" fill="#111918" />{[18, 34, 50].map((y) => <g key={y}>{[0, 24, 48, 72, 96].map((x) => <rect key={x} x={x + (y % 4) * 5} y={y} width="20" height="2" fill="#29332f" />)}</g>)}<rect x="9" y="10" width="3" height="38" fill="#43514b" /><rect x="10" y="42" width="13" height="3" fill="#43514b" /></>; break;
    case "Shared Room": art = <><rect x="7" y="15" width="34" height="45" fill="#1c2926" stroke="#53615c" strokeWidth="2" /><rect x="8" y="35" width="32" height="3" fill="#53615c" /><rect x="12" y="23" width="24" height="7" fill="#62525f" /><rect x="12" y="43" width="24" height="8" fill="#425a58" /><rect x="102" y="19" width="11" height="17" fill="#a67f55" /></>; break;
    case "Factory Break Room": art = <><rect x="0" y="14" width="128" height="54" fill="#1b211f" />{[12, 41, 92].map((x) => <g key={x}><rect x={x} y="8" width="6" height="44" fill="#4b5551" /><rect x={x - 3} y="18" width="12" height="4" fill="#77807b" /></g>)}<rect x="84" y="27" width="31" height="22" fill="#312f2a" stroke="#9a7e54" strokeWidth="2" /><rect x="88" y="31" width="23" height="3" fill="#d0a649" /></>; break;
    case "Cheap Office": art = <><rect x="0" y="13" width="128" height="55" fill="#17201e" />{[15, 25, 35, 45, 55].map((y) => <rect key={y} x="83" y={y} width="35" height="2" fill="#53605b" />)}<rect x="15" y="20" width="25" height="31" fill="#d6d0b9" stroke="#5f645d" strokeWidth="2" /><rect x="19" y="25" width="16" height="2" fill="#a1a494" /></>; break;
    case "Bedroom": art = <><rect x="0" y="13" width="128" height="55" fill="#171a25" /><rect x="12" y="19" width="31" height="35" fill="#532d53" stroke="#8a5a78" strokeWidth="2" /><polygon points="17,47 27,26 38,47" fill="#d65e65" /><rect x="92" y="18" width="21" height="26" fill="#202d38" stroke="#586c71" strokeWidth="2" /><rect x="95" y="23" width="15" height="2" fill="#55ef8d" /></>; break;
    case "Trading Office": art = <><rect x="0" y="13" width="128" height="55" fill="#0e1c19" /><rect x="7" y="18" width="114" height="10" fill="#06100e" stroke="#35534a" strokeWidth="2" />{[13, 30, 47, 66, 84, 101].map((x, i) => <rect key={x} x={x} y={22 - (i % 2)} width="9" height="2" fill={i % 2 ? spec.palette.red : spec.palette.green} />)}<rect x="10" y="35" width="20" height="25" fill="#182925" /><rect x="99" y="35" width="20" height="25" fill="#182925" /></>; break;
    case "Neon Window": art = <><Window /><rect x="6" y="12" width="3" height="54" fill={spec.palette.purple} /><rect x="119" y="12" width="3" height="54" fill={spec.palette.green} /></>; break;
    case "Penthouse": art = <><Window luxury /><rect x="0" y="64" width="128" height="4" fill="#806a4a" /><rect x="4" y="9" width="120" height="3" fill={spec.palette.gold} /></>; break;
    case "Travel Jet": art = <><rect x="0" y="12" width="128" height="56" fill="#202827" />{[17, 52, 87].map((x) => <g key={x}><rect x={x} y="21" width="24" height="25" fill="#66716d" /><rect x={x + 4} y="25" width="16" height="17" fill="#132735" /></g>)}<rect x="0" y="53" width="128" height="4" fill="#b39e72" /></>; break;
    case "Bunker": art = <><rect x="0" y="11" width="128" height="58" fill="#202724" />{[8, 36, 64, 92, 120].map((x) => <rect key={x} x={x} y="17" width="3" height="3" fill="#66706b" />)}<rect x="7" y="28" width="114" height="28" fill="#121a18" stroke="#59645f" strokeWidth="3" /><rect x="61" y="28" width="4" height="28" fill="#59645f" /><rect x="109" y="36" width="5" height="5" fill={spec.palette.red} /></>; break;
    default: art = assertNever(name, "environment");
  }
  return <g data-layer="environment">{art}</g>;
}
