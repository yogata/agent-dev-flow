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
} from "./boundary-candidate-ownership.ts";
import {
  matchedForCandidate,
  precedenceFor,
  resolveCandidate,
  type Candidate,
  type DetectorConfig,
  type OverflowReason,
  DOCS_PATH_PATTERN,
  DOCS_PATH_PERCENT_PATTERN,
  URL_CANDIDATE_PATTERN,
} from "./boundary-candidate-model.ts";

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

function pushSpanned(
  raw: Candidate[],
  entries: OwnershipEntry[],
  c: SpannedCandidate,
): void {
  raw.push(c);
  entries.push({ span: c.span, precedence: precedenceFor(c.type) });
}

export function detectCandidates(line: string, cfg: DetectorConfig): Candidate[] {
  // Line-scan cap: checked BEFORE any matchAll/regex extraction so a
  // pathological >64KiB line cannot accumulate direct/path/url candidates.
  // Returns only a typed line-scan-exceeded overflow (fail-closed).
  if (line.length > MAX_LINE_SCAN) {
    return [{ type: "overflow", reason: "line-scan-exceeded" }];
  }

  const raw: Candidate[] = [];
  const entries: OwnershipEntry[] = [];
  let overflowReason: OverflowReason | null = null;
  const cap = MAX_CANDIDATES_PER_LINE - 1;

  for (const m of line.matchAll(GENERIC_ID_PATTERN)) {
    if (UTF_ENCODING_LABELS.has(m[0])) continue;
    if (raw.length >= cap) { overflowReason = "candidate-cap-exceeded"; break; }
    const idx = m.index ?? 0;
    pushSpanned(raw, entries, {
      type: "direct-id", value: m[0], span: { start: idx, end: idx + m[0].length },
    });
  }

  if (overflowReason === null) {
    const recon = detectReconstructedIds(line);
    if (recon.overflow) overflowReason = recon.overflowReason ?? "token-ids-exceeded";
    for (const r of recon.ids) {
      if (raw.length >= cap) { overflowReason = "candidate-cap-exceeded"; break; }
      pushSpanned(raw, entries, {
        type: "reconstructed-id", value: r.decoded, original: r.original,
        span: { start: r.srcStart, end: r.srcEnd },
      });
    }
  }

  if (overflowReason === null) {
    for (const pat of [DOCS_PATH_PATTERN, DOCS_PATH_PERCENT_PATTERN]) {
      for (const m of line.matchAll(pat)) {
        if (raw.length >= cap) { overflowReason = "candidate-cap-exceeded"; break; }
        const idx = m.index ?? 0;
        pushSpanned(raw, entries, {
          type: "path", value: m[0], span: { start: idx, end: idx + m[0].length },
        });
      }
      if (overflowReason === "candidate-cap-exceeded") break;
    }
  }

  // URLs only when identity is configured: no identity => no URL extraction.
  if (overflowReason === null && cfg.repository_identity.owner_slash_name.length > 0) {
    for (const m of line.matchAll(URL_CANDIDATE_PATTERN)) {
      if (raw.length >= cap) { overflowReason = "candidate-cap-exceeded"; break; }
      const idx = m.index ?? 0;
      pushSpanned(raw, entries, {
        type: "url", value: m[0], span: { start: idx, end: idx + m[0].length },
      });
    }
  }

  // Ownership: URL > path > reconstructed > direct. Overflow never suppressed.
  const mask = ownershipMask(entries);
  const out: Candidate[] = [];
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c !== undefined && mask[i]) out.push(c);
  }
  if (overflowReason !== null) {
    out.push({ type: "overflow", reason: overflowReason });
  }
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