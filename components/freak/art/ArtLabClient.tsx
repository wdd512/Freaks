"use client";

import { useState } from "react";
import type { GeneratedFreak } from "@/domain/rarity/generator";
import { CAREER_LEVELS, MOODS, type CareerLevel, type FreakDNA, type Mood } from "@/domain/types";
import { IMMUTABLE_TRAITS } from "@/art/manifest/immutable";
import { buildRenderSpec } from "@/art/renderer/build-render-spec";
import { buildRenderSignature } from "@/art/renderer/render-signature";
import { FreakRenderer } from "@/components/freak/art/FreakRenderer";
import { MiniCollectionSection } from "@/components/freak/art/MiniCollectionSection";
import type { MiniCollectionEntry } from "@/art/qa/mini-collection";

function DebugLabel({ tokenId, dna, career, mood, active }: { tokenId: number; dna: FreakDNA; career: CareerLevel; mood: Mood; active: boolean }) {
  const spec = buildRenderSpec({ tokenId, dna, careerLevel: career, mood, active });
  return <dl className="art-debug-label">
    <div><dt>TOKEN</dt><dd>#{tokenId}</dd></div>
    {(Object.entries(dna) as [keyof FreakDNA, string][]).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}
    {(Object.entries(spec.dynamic) as [string, string][]).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}
    <div><dt>career</dt><dd>{career}</dd></div><div><dt>mood</dt><dd>{mood}</dd></div>
    <div className="art-asset-modes"><dt>PRODUCTION ASSET MODE</dt><dd>{spec.assets.map((asset) => <span key={asset.id} data-testid="asset-mode">{asset.id.replace(/^v1:/, "")} = {asset.sourceType === "SVG_COMPONENT" ? "SVG" : "IMAGE"}</span>)}</dd></div>
    <div className="art-signature"><dt>SIGNATURE</dt><dd>{buildRenderSignature(spec)}</dd></div>
  </dl>;
}

function ArtSample({ tokenId, dna, career, mood, active, debug, label, testId }: {
  tokenId: number; dna: FreakDNA; career: CareerLevel; mood: Mood; active: boolean; debug: boolean; label?: string; testId?: string;
}) {
  return <article className="art-lab-card" data-testid={testId}>
    <FreakRenderer tokenId={tokenId} dna={dna} careerLevel={career} mood={mood} active={active} />
    {label && <strong className="art-sample-name">{label}</strong>}
    {debug && <DebugLabel tokenId={tokenId} dna={dna} career={career} mood={mood} active={active} />}
  </article>;
}

export function ArtLabClient({ preview, miniCollection, missingImageLayers, productionOnlyCollection, productionOnlyMissingImageLayers }: {
  preview: GeneratedFreak[];
  miniCollection: MiniCollectionEntry[];
  missingImageLayers: string[];
  productionOnlyCollection: MiniCollectionEntry[];
  productionOnlyMissingImageLayers: string[];
}) {
  const [career, setCareer] = useState<CareerLevel>("INTERN");
  const [mood, setMood] = useState<Mood>("NEUTRAL");
  const [active, setActive] = useState(false);
  const [tokenQuery, setTokenQuery] = useState("");
  const [debug, setDebug] = useState(false);
  const selected = preview.find((freak) => freak.tokenId === Number(tokenQuery)) ?? preview[0];
  const productionDna: FreakDNA = { body: "Average", skin: "Warm Light", head: "Round", eyes: "Sleepy", mouth: "Smirk", hair: "Buzz Cut" };
  const matrices: { slot: keyof FreakDNA; title: string }[] = [
    { slot: "body", title: "BODIES" }, { slot: "skin", title: "SKINS" }, { slot: "head", title: "HEADS" },
    { slot: "eyes", title: "EYES" }, { slot: "mouth", title: "MOUTHS" }, { slot: "hair", title: "HAIR / HEADWEAR" },
  ];

  return <main className="shell art-lab">
    <div className="kicker">DEV ONLY // ART_VERSION V1</div><h1 className="page-title">ART LAB</h1>
    <p className="muted">Deterministic 128×128 layer QA. Preview seed: <code>pnl-freaks-art-v1</code>.</p>
    <section className="panel art-lab-controls" aria-label="Art lab controls">
      <label>CAREER<select value={career} onChange={(event) => setCareer(event.target.value as CareerLevel)}>{CAREER_LEVELS.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>MOOD<select value={mood} onChange={(event) => setMood(event.target.value as Mood)}>{MOODS.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>TOKEN ID<input type="number" min="1" max="50" placeholder="ALL" value={tokenQuery} onChange={(event) => setTokenQuery(event.target.value)} /></label>
      <label className="art-check"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} /> ACTIVE</label>
      <label className="art-check"><input type="checkbox" checked={debug} onChange={(event) => setDebug(event.target.checked)} /> DEBUG LABELS</label>
    </section>
    <section className="section" aria-labelledby="production-pack-title">
      <div className="section-heading"><div><div className="kicker">42 ALIGNED PNG LAYERS // 128×128</div><h2 id="production-pack-title">PRODUCTION PACK V1</h2></div><span className="muted">ENGINEERING PLACEHOLDER PRODUCTION PACK</span></div>
      <p className="muted">Alignment and IMAGE replacement validation only—not final collection art. Each preview resolves real PNG environment, workstation, screen, outfit, and prop layers; supported immutable traits also switch to PNG.</p>
      <div className="art-evolution-grid">{CAREER_LEVELS.map((level, index) => <ArtSample key={level} tokenId={8001 + index} dna={productionDna} career={level} mood="NEUTRAL" active={false} debug={debug} label={`PACK V1 · ${level}`} testId="production-pack-preview" />)}</div>
    </section>
    <MiniCollectionSection entries={miniCollection} missingImageLayers={missingImageLayers} />
    <MiniCollectionSection entries={productionOnlyCollection} missingImageLayers={productionOnlyMissingImageLayers} mode="PRODUCTION_ONLY" />
    <section className="section" aria-labelledby="evolution-title">
      <div className="section-heading"><div><div className="kicker">SAME FREAK // SAME DNA</div><h2 id="evolution-title">COMPARE EVOLUTION</h2></div><span className="muted">#{selected.tokenId}</span></div>
      <div className="art-evolution-grid">{CAREER_LEVELS.map((level) => <ArtSample key={level} tokenId={selected.tokenId} dna={selected.dna} career={level} mood={mood} active={active} debug={debug} label={level} testId="art-evolution" />)}</div>
    </section>
    <section className="section" aria-labelledby="matrix-title">
      <div className="section-heading"><div><div className="kicker">FORCED IMMUTABLE COVERAGE</div><h2 id="matrix-title">DNA MATRIX</h2></div></div>
      {matrices.map(({ slot, title }) => <div className="art-matrix" key={slot}><h3>{title} <span>{IMMUTABLE_TRAITS[slot].length}</span></h3><div className="art-matrix-grid">{IMMUTABLE_TRAITS[slot].map((trait, index) => <ArtSample key={trait} tokenId={9000 + index} dna={{ ...selected.dna, [slot]: trait }} career={career} mood={mood} active={active} debug={debug} label={trait} testId={`matrix-${slot}`} />)}</div></div>)}
    </section>
  </main>;
}
