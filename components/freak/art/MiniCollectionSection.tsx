"use client";

import { useEffect, useMemo, useState } from "react";
import { CAREER_LEVELS, PERSONALITIES, RARITY_TIERS, type CareerLevel, type RarityTier } from "@/domain/types";
import {
  ART_PROBLEM_FLAGS,
  artProblemFlagKey,
  type ArtFlagCollection,
  type ArtProblemFlag,
  type ArtProblemFlagMap,
} from "@/art/qa/problem-flags";
import {
  buildMiniCollectionQaReport,
  MINI_COLLECTION_V1_SEED,
  miniCollectionTraitValue,
  type MiniCollectionEntry,
  type MiniCollectionTraitSlot,
} from "@/art/qa/mini-collection";
import { PRODUCTION_ONLY_V1_SEED } from "@/art/qa/production-only-sample";
import { FreakRenderer } from "@/components/freak/art/FreakRenderer";

const TRAIT_SLOTS: MiniCollectionTraitSlot[] = [
  "body", "skin", "head", "eyes", "mouth", "hair", "outfit", "workstation", "screens", "prop", "environment",
];
const RARITY_ORDER: Record<RarityTier, number> = { MYTHIC: 0, EPIC: 1, RARE: 2, UNCOMMON: 3, COMMON: 4 };
type SortMode = "TOKEN_ID" | "RARITY" | "VISUAL_FINGERPRINT";
type MiniCollectionMode = "GENESIS" | "PRODUCTION_ONLY";

function summary(values: Record<string, string>): string {
  return Object.entries(values).map(([slot, value]) => `${slot}: ${value}`).join(" · ");
}

function MiniCollectionMetadata({ entry }: { entry: MiniCollectionEntry }) {
  return <details className="mini-collection-metadata">
    <summary>QA METADATA</summary>
    <dl>
      <div><dt>SAMPLE ID</dt><dd>#{entry.tokenId}</dd></div>
      <div><dt>IMMUTABLE DNA</dt><dd>{summary(entry.dna)}</dd></div>
      <div><dt>DYNAMIC TRAITS</dt><dd>{summary(entry.dynamic)}</dd></div>
      <div><dt>CAREER</dt><dd>{entry.careerLevel}</dd></div>
      <div><dt>VISUAL FINGERPRINT HASH</dt><dd>{entry.visualFingerprintHash}</dd></div>
      <div><dt>VISUAL FINGERPRINT</dt><dd>{entry.visualFingerprint}</dd></div>
      <div><dt>CANONICAL RENDER SIGNATURE</dt><dd>{entry.renderSignature}</dd></div>
      <div><dt>ASSETS</dt><dd>{entry.imageAssetPaths.length} IMAGE · {entry.svgFallbackIds.length} SVG fallback</dd></div>
    </dl>
  </details>;
}

export function MiniCollectionSection({ entries, missingImageLayers, mode = "GENESIS" }: {
  entries: MiniCollectionEntry[];
  missingImageLayers: string[];
  mode?: MiniCollectionMode;
}) {
  const productionOnly = mode === "PRODUCTION_ONLY";
  const title = productionOnly ? "PRODUCTION ONLY — 50 FREAKS" : "MINI COLLECTION V1";
  const headingId = productionOnly ? "production-only-collection-title" : "mini-collection-title";
  const filterPrefix = productionOnly ? "PRODUCTION" : "MINI";
  const cardTestId = productionOnly ? "production-only-card" : "mini-collection-card";
  const summaryTestId = productionOnly ? "production-only-qa-report" : "mini-qa-report";
  const flagCollection: ArtFlagCollection = productionOnly ? "PRODUCTION_ONLY_V1" : "MINI_COLLECTION_V1";
  const reportSeed = productionOnly ? PRODUCTION_ONLY_V1_SEED : MINI_COLLECTION_V1_SEED;
  const [career, setCareer] = useState<"ALL" | CareerLevel>("ALL");
  const [rarity, setRarity] = useState("ALL");
  const [personality, setPersonality] = useState("ALL");
  const [traitSlot, setTraitSlot] = useState<"ALL" | MiniCollectionTraitSlot>("ALL");
  const [traitValue, setTraitValue] = useState("ALL");
  const [sortMode, setSortMode] = useState<SortMode>("TOKEN_ID");
  const [flags, setFlags] = useState<ArtProblemFlagMap>({});
  const [savingTokenId, setSavingTokenId] = useState<number>();
  const [flagError, setFlagError] = useState("");
  const report = useMemo(() => buildMiniCollectionQaReport(entries, missingImageLayers, reportSeed), [entries, missingImageLayers, reportSeed]);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/dev/art-flags", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error("Could not load local art flags");
      return await response.json() as { flags: ArtProblemFlagMap };
    }).then((data) => { if (!cancelled) setFlags(data.flags); })
      .catch((error: unknown) => { if (!cancelled) setFlagError(error instanceof Error ? error.message : "Could not load local art flags"); });
    return () => { cancelled = true; };
  }, []);

  const traitValues = useMemo(() => traitSlot === "ALL" ? [] : [...new Set(entries.map((entry) => miniCollectionTraitValue(entry, traitSlot)))].sort(), [entries, traitSlot]);
  const visible = useMemo(() => entries.filter((entry) =>
    (career === "ALL" || entry.careerLevel === career)
    && (rarity === "ALL" || entry.rarityTier === rarity)
    && (personality === "ALL" || entry.personality === personality)
    && (traitSlot === "ALL" || traitValue === "ALL" || miniCollectionTraitValue(entry, traitSlot) === traitValue),
  ).sort((left, right) => {
    if (sortMode === "RARITY") return RARITY_ORDER[left.rarityTier] - RARITY_ORDER[right.rarityTier] || left.tokenId - right.tokenId;
    if (sortMode === "VISUAL_FINGERPRINT") return left.visualFingerprint.localeCompare(right.visualFingerprint) || left.tokenId - right.tokenId;
    return left.tokenId - right.tokenId;
  }), [career, entries, personality, rarity, sortMode, traitSlot, traitValue]);

  async function updateFlag(tokenId: number, flag: ArtProblemFlag | null): Promise<void> {
    const previous = flags;
    const optimistic = { ...flags };
    const key = artProblemFlagKey(flagCollection, tokenId);
    if (flag === null) delete optimistic[key];
    else optimistic[key] = flag;
    setFlags(optimistic);
    setSavingTokenId(tokenId);
    setFlagError("");
    try {
      const response = await fetch("/api/dev/art-flags", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ collection: flagCollection, tokenId, flag }),
      });
      const data = await response.json() as { flags?: ArtProblemFlagMap; error?: string };
      if (!response.ok || !data.flags) throw new Error(data.error ?? "Could not save art flag");
      setFlags(data.flags);
    } catch (error) {
      setFlags(previous);
      setFlagError(error instanceof Error ? error.message : "Could not save art flag");
    } finally {
      setSavingTokenId(undefined);
    }
  }

  return <section className={`section mini-collection${productionOnly ? " production-only-collection" : ""}`} aria-labelledby={headingId}>
    <div className="section-heading">
      <div><div className="kicker">{productionOnly ? "ZERO SVG FALLBACK TARGET // IMAGE QA" : "50 SEEDED FREAKS // GENESIS MIX QA"}</div><h2 id={headingId}>{title}</h2></div>
      <span className="muted" data-testid={`${cardTestId}-shown`}>{visible.length} / {entries.length} SHOWN</span>
    </div>
    <p className="muted">{productionOnly
      ? "QA-only deterministic DNA from Production Pack V1 coverage. This does not use or modify Genesis generation probabilities."
      : "Stable neutral Genesis renders across all six career pools. Metadata and review flags sit outside the artwork."}</p>
    <div className="panel mini-qa-summary" data-testid={summaryTestId}>
      <div><span>GENERATED</span><strong>{report.generatedCount}</strong></div>
      <div><span>IMAGE REFERENCES</span><strong>{report.imageAssetReferenceCount}</strong></div>
      <div><span>MISSING IMAGE</span><strong className={report.missingImageLayers.length ? "negative" : "positive"}>{report.missingImageLayers.length}</strong></div>
      <div><span>SVG FALLBACK USES</span><strong className={report.svgFallbackInstanceCount ? "negative" : "positive"}>{report.svgFallbackInstanceCount}</strong></div>
      <div><span>EXACT VISUAL DUPLICATES</span><strong className={report.duplicateVisualFingerprintCount ? "negative" : "positive"}>{report.duplicateVisualFingerprintCount}</strong></div>
      <div><span>ONE-TRAIT NEAR</span><strong>{report.nearDuplicateWarnings.length}</strong></div>
      <div><span>TWO-TRAIT SIMILAR</span><strong>{report.similarityWarnings.length}</strong></div>
    </div>
    <div className="panel mini-collection-controls" aria-label={`${title} filters`}>
      <label>{filterPrefix} CAREER<select value={career} onChange={(event) => setCareer(event.target.value as "ALL" | CareerLevel)}><option>ALL</option>{CAREER_LEVELS.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>{filterPrefix} RARITY<select value={rarity} onChange={(event) => setRarity(event.target.value)}><option>ALL</option>{RARITY_TIERS.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>{filterPrefix} PERSONALITY<select value={personality} onChange={(event) => setPersonality(event.target.value)}><option>ALL</option>{PERSONALITIES.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>{filterPrefix} TRAIT SLOT<select value={traitSlot} onChange={(event) => { setTraitSlot(event.target.value as "ALL" | MiniCollectionTraitSlot); setTraitValue("ALL"); }}><option>ALL</option>{TRAIT_SLOTS.map((value) => <option key={value} value={value}>{value.toUpperCase()}</option>)}</select></label>
      <label>{filterPrefix} TRAIT VALUE<select value={traitValue} disabled={traitSlot === "ALL"} onChange={(event) => setTraitValue(event.target.value)}><option>ALL</option>{traitValues.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>{filterPrefix} SORT BY<select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}><option value="TOKEN_ID">TOKEN ID</option><option value="RARITY">RARITY</option><option value="VISUAL_FINGERPRINT">VISUAL FINGERPRINT</option></select></label>
    </div>
    {flagError && <div className="error" role="alert">{flagError}</div>}
    <div className="art-preview-grid mini-collection-grid">
      {visible.map((entry) => {
        const flagKey = artProblemFlagKey(flagCollection, entry.tokenId);
        return <article className="art-lab-card mini-collection-card" data-testid={cardTestId} key={entry.tokenId}>
          <FreakRenderer tokenId={entry.tokenId} dna={entry.dna} careerLevel={entry.careerLevel} mood="NEUTRAL" active={false} />
          <div className="mini-collection-card-copy">
            <strong className="art-sample-name">#{String(entry.tokenId).padStart(4, "0")} · {entry.rarityTier} · {entry.personality}</strong>
            <span className="mini-career">{entry.careerLevel} · {entry.visualFingerprintHash}</span>
            <MiniCollectionMetadata entry={entry} />
            <label className="mini-flag-control">QA FLAG
              <select aria-label={`Flag ${title} #${entry.tokenId}`} value={flags[flagKey] ?? ""} disabled={savingTokenId === entry.tokenId} onChange={(event) => void updateFlag(entry.tokenId, event.target.value ? event.target.value as ArtProblemFlag : null)}>
                <option value="">UNFLAGGED</option>{ART_PROBLEM_FLAGS.map((flag) => <option key={flag}>{flag}</option>)}
              </select>
            </label>
            {flags[flagKey] && <span className="mini-flag-badge" data-testid={`${cardTestId}-problem-flag`}>{flags[flagKey]}</span>}
          </div>
        </article>;
      })}
    </div>
    <details className="mini-frequency-report"><summary>TRAIT FREQUENCY REPORT</summary>{Object.entries(report.traitFrequencies).map(([slot, values]) => <div key={slot}><strong>{slot.toUpperCase()}</strong><span>{Object.entries(values).sort((left, right) => right[1] - left[1]).map(([value, count]) => `${value} ${count}`).join(" · ")}</span></div>)}</details>
    <p className="muted mini-export-hint">Export this exact seeded collection with <code>{productionOnly ? "npm run art:export-mini -- --production-only --per-card" : "npm run art:export-mini -- --per-card"}</code>.</p>
  </section>;
}

