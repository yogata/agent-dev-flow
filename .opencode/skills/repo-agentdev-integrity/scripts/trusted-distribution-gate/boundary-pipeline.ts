// Side-effect-free distribution boundary detector pipeline.
//
// This module is the trust-root's port of the detector design reviewed in
// PR #2094 (Stage B). Stage A requirement: it must NOT be a closed
// `(REQ|ADR|DEC)` list. It must handle arbitrary producer-internal ID
// families, concrete producer docs paths (slash / backslash / URI-encoded),
// producer-repository fixed URLs (by configured repository identity),
// generic/template allowances, and fail-closed on unclassified entries.
//
// Pipeline stages (owned here):
//   1. extract  — detectCandidates: regex + reconstruction + ownership
//   2. classify — classifyLine: assemble Detection records
// Resolution (candidate -> classification) and the candidate model live in
// boundary-candidate-model.ts; the gate (decideProjection) lives in
// boundary-gate.ts.
//
// Side-effect-free: no I/O imports; all functions pure.

import type { Detection, LineInput } from "./types.ts";
import { detectReconstructedIds, MAX_LINE_SCAN } from "./boundary-reconstruction.ts";
import {
  ownershipMask,
  type OwnershipEntry,
  type Span,
} from "./boundary-candidate-ownership.ts";
import {
  matchedForCandidate,
  precedenceFor,
  resolveCandidate,
  type Candidate,
  type DetectorConfig,
  type OverflowReason,
} from "./boundary-candidate-model.ts";
import { extractUrls } from "./boundary-url-parser.ts";
import { extractDocsPaths } from "./boundary-docs-path-parser.ts";

// Re-export so consumers import from the pipeline barrel without a cycle.
export type {
  Candidate,
  CandidateType,
  DetectorConfig,
  RepositoryIdentity,
  OverflowReason,
} from "./boundary-candidate-model.ts";
export {
  matchedForCandidate,
  precedenceFor,
  resolveCandidate,
  extractOwnerRepo,
  isProducerOwnedUrl,
  isConcreteDocsPath,
  normalizePathToken,
} from "./boundary-candidate-model.ts";

// ---------------------------------------------------------------------------
// Detection patterns (pipeline-local)
// ---------------------------------------------------------------------------

// Generic ID family: any UPPER-CASE prefix of 2+ letters, hyphen, 1+ digits.
// UTF-8, UTF-16, UTF-32 are encoding labels and must NOT match as IDs.
export const GENERIC_ID_PATTERN = /\b([A-Z]{2,})-(\d{1,})\b/g;
const UTF_ENCODING_LABELS = new Set(["UTF-8", "UTF-16", "UTF-32"]);

function trimSnippet(line: string, maxLen: number): string {
  const t = line.trim();
  return t.length <= maxLen ? t : t.substring(0, maxLen);
}

// ---------------------------------------------------------------------------
// Pipeline stage 1: extract
// ---------------------------------------------------------------------------

const MAX_TEXT_LEN = 200;
const MAX_CANDIDATES_PER_LINE = 64;

type SpannedCandidate = Exclude<Candidate, { type: "overflow" }>;

function isInsideAnySpan(span: Span, keepers: readonly Span[]): boolean {
  for (const k of keepers) {
    if (k.start <= span.start && span.end <= k.end) return true;
  }
  return false;
}

export function detectCandidates(line: string, cfg: DetectorConfig): Candidate[] {
  // Line-scan cap fires BEFORE any extraction (fail-closed contract).
  if (line.length > MAX_LINE_SCAN) {
    return [{ type: "overflow", reason: "line-scan-exceeded" }];
  }

  const cap = MAX_CANDIDATES_PER_LINE - 1;
  const owners: SpannedCandidate[] = [];
  const lows: SpannedCandidate[] = [];
  let overflowReason: OverflowReason | null = null;

  // Stage 1a: extract bounded URL owners (identity-gated).
  if (cfg.repository_identity.owner_slash_name.length > 0) {
    const r = extractUrls(line, cap - owners.length);
    for (const u of r.urls) owners.push({ type: "url", value: u.value, span: u.span });
    if (r.overflow) overflowReason = "candidate-cap-exceeded";
  }

  // Stage 1b: extract bounded docs-path owners. Overflow never suppressed.
  if (overflowReason === null) {
    const r = extractDocsPaths(line, cap - owners.length);
    for (const p of r.paths) owners.push({ type: "path", value: p.value, span: p.span });
    if (r.overflow) overflowReason = "candidate-cap-exceeded";
  }

  // Stage 1c: contained low-priority candidates (IDs inside owner spans)
  // are skipped so they never consume the candidate cap.
  const ownedSpans: Span[] = owners.map((o) => o.span);

  if (overflowReason === null) {
    for (const m of line.matchAll(GENERIC_ID_PATTERN)) {
      if (UTF_ENCODING_LABELS.has(m[0])) continue;
      const idx = m.index ?? 0;
      const span: Span = { start: idx, end: idx + m[0].length };
      if (isInsideAnySpan(span, ownedSpans)) continue;
      if (owners.length + lows.length >= cap) { overflowReason = "candidate-cap-exceeded"; break; }
      lows.push({ type: "direct-id", value: m[0], span });
    }
  }

  if (overflowReason === null) {
    const recon = detectReconstructedIds(line);
    if (recon.overflow) overflowReason = recon.overflowReason ?? "token-ids-exceeded";
    if (overflowReason === null) {
      for (const r of recon.ids) {
        const span: Span = { start: r.srcStart, end: r.srcEnd };
        if (isInsideAnySpan(span, ownedSpans)) continue;
        if (owners.length + lows.length >= cap) { overflowReason = "candidate-cap-exceeded"; break; }
        lows.push({ type: "reconstructed-id", value: r.decoded, original: r.original, span });
      }
    }
  }

  // Stage 2: ownership mask resolves recon-vs-direct overlap. Overflow is
  // appended AFTER the mask so ownership never suppresses the typed signal.
  const entries: OwnershipEntry[] = [];
  for (const o of owners) entries.push({ span: o.span, precedence: precedenceFor(o.type) });
  for (const c of lows) entries.push({ span: c.span, precedence: precedenceFor(c.type) });
  const all = [...owners, ...lows];
  const mask = ownershipMask(entries);
  const out: Candidate[] = [];
  for (let i = 0; i < all.length; i++) {
    const c = all[i];
    if (c !== undefined && mask[i]) out.push(c);
  }
  if (overflowReason !== null) out.push({ type: "overflow", reason: overflowReason });
  return out;
}

// ---------------------------------------------------------------------------
// Pipeline stage 2: classify
// ---------------------------------------------------------------------------

export interface LineClassification {
  readonly detections: readonly Detection[];
}

export function classifyLine(line: LineInput, cfg: DetectorConfig): LineClassification {
  const candidates = detectCandidates(line.text, cfg);
  const detections: Detection[] = [];
  const boundedText = line.text.length <= MAX_TEXT_LEN ? line.text : line.text.substring(0, MAX_TEXT_LEN);
  for (const c of candidates) {
    const { classification, category } = resolveCandidate(c, cfg);
    detections.push({
      text: boundedText,
      line: line.lineNumber,
      file: line.filePath,
      projection: line.projection,
      classification,
      matched: matchedForCandidate(c),
      snippet: trimSnippet(line.text, 80),
      category,
    });
  }
  return { detections };
}