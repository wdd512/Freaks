import type { CareerLevel, FreakDNA, Mood } from "@/domain/types";
import { resolveVisualState } from "@/domain/freak/visual";

const SKINS: Record<string, string> = {
  "Cool Light": "#e9d4c8", "Warm Light": "#f4c7a1", Sand: "#d7aa78", Olive: "#a9895b",
  Bronze: "#a96e45", Copper: "#985d3b", Umber: "#70432d", Deep: "#442a24",
};
const TIER_COLORS: Record<string, string> = { REKT: "#f04444", INTERN: "#dfdfd0", GRINDER: "#f0c24b", PROFITABLE: "#6ee7a8", WHALE: "#61a7ff", MARKET_GOD: "#d97bff" };

export function FreakArt({ tokenId, dna, careerLevel, mood, active = false, className = "" }: {
  tokenId: number; dna: FreakDNA; careerLevel: CareerLevel; mood: Mood; active?: boolean; className?: string;
}) {
  const visual = resolveVisualState(dna, careerLevel, mood);
  const skin = SKINS[dna.skin] ?? "#d7aa78";
  const accent = TIER_COLORS[careerLevel] ?? "#d0d0c0";
  const headRx = dna.head === "Square" || dna.head === "Flat Skull" ? 4 : dna.head === "Long" ? 18 : 28;
  const eyeColor = dna.eyes.includes("Green") ? "#67ff8a" : dna.eyes.includes("Red") || mood === "MELTDOWN" ? "#ff5151" : "#c7fff2";
  const mouthY = dna.mouth === "Screaming" ? 119 : 116;
  const monitorCount = visual.screens.includes("Wall") ? 5 : visual.screens.includes("Triple") ? 3 : visual.screens.includes("Dual") ? 2 : 1;
  return (
    <div className={`freak-art ${active ? "is-active" : ""} ${className}`} title={`${visual.outfit}, ${visual.environment}`}>
      <svg viewBox="0 0 320 320" role="img" aria-label={`Procedural portrait of Freak #${tokenId}`} shapeRendering="crispEdges">
        <defs>
          <pattern id={`grid-${tokenId}`} width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0V16" fill="none" stroke={accent} strokeOpacity=".08" /></pattern>
          <filter id={`glow-${tokenId}`}><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect width="320" height="320" fill={careerLevel === "REKT" ? "#190f13" : "#091412"}/>
        <rect width="320" height="320" fill={`url(#grid-${tokenId})`}/>
        <path d="M0 244L58 218H262L320 244V320H0Z" fill="#101c1a" stroke={accent} strokeWidth="3"/>
        {Array.from({ length: monitorCount }, (_, index) => {
          const width = monitorCount >= 4 ? 52 : 72;
          const gap = 5;
          const total = monitorCount * width + (monitorCount - 1) * gap;
          const x = (320 - total) / 2 + index * (width + gap);
          return <g key={index}><rect x={x} y={26 + (index % 2) * 5} width={width} height="54" fill="#07100e" stroke={accent} strokeWidth="3"/><polyline points={`${x + 7},68 ${x + 18},52 ${x + 29},61 ${x + 42},37 ${x + width - 7},45`} fill="none" stroke={index % 2 ? "#ff5265" : "#56f09a"} strokeWidth="3"/></g>;
        })}
        <path d="M92 278V214Q96 171 160 166Q224 171 228 214V278Z" fill={careerLevel === "WHALE" || careerLevel === "MARKET_GOD" ? "#201c38" : "#293330"} stroke={accent} strokeWidth="4"/>
        <path d="M113 198L151 231L207 193" fill="none" stroke={accent} strokeWidth="6"/>
        <rect x="139" y="139" width="42" height="44" fill={skin} stroke="#161616" strokeWidth="4"/>
        <rect x={dna.head === "Long" ? 112 : 104} y={dna.head === "Long" ? 77 : 85} width={dna.head === "Long" ? 96 : 112} height={dna.head === "Long" ? 96 : 88} rx={headRx} fill={skin} stroke="#161616" strokeWidth="5"/>
        {dna.hair === "Bald" ? null : dna.hair === "Trading Cap" || dna.hair === "Beanie" ? <path d="M106 105Q118 69 160 68Q207 70 217 108Z" fill={accent} stroke="#161616" strokeWidth="5"/> : dna.hair === "Foil Hat" ? <path d="M113 95L137 50L159 75L183 45L210 96Z" fill="#d8e0dc" stroke="#161616" strokeWidth="5"/> : <path d="M105 104L114 78L128 89L140 70L154 86L170 66L184 87L205 72L216 105Z" fill="#302925" stroke="#161616" strokeWidth="5"/>}
        <g filter={visual.effects.length ? `url(#glow-${tokenId})` : undefined}>
          <rect x="124" y="111" width={dna.eyes === "Tiny Dots" ? 5 : 18} height={dna.eyes === "Sleepy" ? 4 : 9} fill={eyeColor}/>
          <rect x="177" y="111" width={dna.eyes === "Tiny Dots" ? 5 : 18} height={dna.eyes === "Sleepy" ? 4 : 9} fill={eyeColor}/>
        </g>
        {dna.mouth === "Smirk" || mood === "HAPPY" || mood === "EUPHORIC" ? <path d="M139 144Q160 161 184 141" fill="none" stroke="#4b2325" strokeWidth="5"/> : <rect x="142" y={mouthY} width="38" height={dna.mouth === "Screaming" ? 28 : 6} fill="#4b2325"/>}
        <rect x="39" y="274" width="242" height="15" fill="#172724" stroke={accent} strokeWidth="3"/>
        <rect x="244" y="248" width="18" height="27" fill={visual.prop === "Champagne" ? "#f4d56b" : "#d6e4d6"}/>
        <text x="16" y="307" fill={accent} fontFamily="monospace" fontSize="12">{`#${tokenId} // ${careerLevel}`}</text>
        {active && <circle cx="295" cy="20" r="7" fill="#5cff91"><animate attributeName="opacity" values="1;.25;1" dur="1.4s" repeatCount="indefinite"/></circle>}
      </svg>
    </div>
  );
}
