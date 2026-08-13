// Side-effect-free distribution boundary detector pipeline.
//
// This module is the trust-root's port of the detector design reviewed in
// PR #2094 (Stage B). Stage A requirement: it must NOT be a closed
// `(REQ|ADR|DEC)` list. It must handle arbitrary producer-internal ID
// families, concrete producer docs paths (slash / backslash / URI-encoded),
// producer-repository fixed URLs (by configured repository identity),
// generic/template allowances, and fail-closed on unclassified entries.
//
// Side-effect-free contract:
//   - No imports of `fs`, `path`, `os`, `child_process`, or any I/O module.
//   - All functions are pure: same input => same output, no mutation, no
//     external observation.
//   - Classification never throws for input-shape reasons; the gate layer
//     treats `unclassified` as gate-not-passed (fail-closed).
//
// Pipeline stages:
//   1. extract  — broad regex captures candidate matches per line
//   2. resolve  — per-candidate classification under consumer-runtime assumptions
//   3. classify — assemble Detection records
//   4. decide   — gate layer (see launcher.ts) treats producer-internal and
//                 unclassified as gate-not-passed

import type {
  DependencyClass,
  Detection,
  DetectionCategory,
  LineInput,
} from "./types.ts";
import { detectReconstructedIds } from "./boundary-reconstruction.ts";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface RepositoryIdentity {
  /** e.g. "yogata/agent-dev-flow". Empty string disables URL extraction. */
  readonly owner_slash_name: string;
  readonly default_branch: string;
}

export interface DetectorConfig {
  readonly repository_identity: RepositoryIdentity;
  /** Producer-internal ID prefixes (UPPER-CASE letters only). */
  readonly producer_internal_id_prefixes: readonly string[];
  /**
   * Distributed workflow control ID prefixes (e.g. STEP, QG). These are
   * classified as generic-or-template with category distributed-control.
   */
  readonly distributed_workflow_control_prefixes: readonly string[];
}

// ---------------------------------------------------------------------------
// Detection patterns
// ---------------------------------------------------------------------------

// Generic ID family: any UPPER-CASE prefix of 2+ letters followed by a hyphen
// and 1+ digits. Captures ADR/REQ/DEC/SPEC/IR/RU/TS/AG/OU/EC AND any future
// family. Classification stage decides producer-internal vs unclassified.
//
// UTF-8, UTF-16, UTF-32 are encoding labels and must NOT match as IDs.
// Template placeholders ({NNNN}, <NNNN>, *) do not match because \d requires
// actual digits and the placeholder wrappers are not uppercase letters.
export const GENERIC_ID_PATTERN = /\b([A-Z]{2,})-(\d{1,})\b/g;

// UTF encoding labels that should NOT be treated as ID candidates.
const UTF_ENCODING_LABELS = new Set(["UTF-8", "UTF-16", "UTF-32"]);

// Candidate docs path token, allowing mixed slash/backslash/percent-encoding.
// Captures the broad token; resolution normalizes and inspects.
export const DOCS_PATH_PATTERN = /docs[\\/](?:adr|requirements|specs|decisions)[\\/][^\s)\]\|\\"'`<>{}]+/g;

// Also capture percent-encoded forms: docs%2F...
export const DOCS_PATH_PERCENT_PATTERN = /docs%2[Ff](?:adr|requirements|specs|decisions)%2[Ff][^\s)\]\|\\"'`<>{}]+/g;

// Candidate GitHub blob/raw URLs. The resolution stage parses owner/repo
// from each candidate URL and compares to the configured repository
// identity. URLs pointing into the producer repo (any path) are
// producer-internal; URLs into a different repo (including docs paths of
// external projects) are consumer-resolvable.
export const URL_CANDIDATE_PATTERN =
  /(?:github\.com\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+\/(?:blob|raw)\/|raw\.githubusercontent\.com\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+\/)[^\s)\]\\"'`<>{}]+/g;

// ---------------------------------------------------------------------------
// URL ownership: parse the `owner/repo` segment from a GitHub blob/raw URL
// ---------------------------------------------------------------------------

/**
 * Extract the `owner/repo` segment from a GitHub blob/raw URL. Returns null
 * when the URL does not match the expected shape (in which case the caller
 * fail-closes by treating the URL as unclassified).
 *
 * Examples:
 *   https://github.com/yogata/agent-dev-flow/blob/main/docs/foo.md
 *     -> "yogata/agent-dev-flow"
 *   raw.githubusercontent.com/yogata/agent-dev-flow/main/x.md
 *     -> "yogata/agent-dev-flow"
 *   https://github.com/vercel/next.js/blob/main/src/index.ts
 *     -> "vercel/next.js"
 */
export function extractOwnerRepo(url: string): string | null {
  const m = /(?:github\.com\/|raw\.githubusercontent\.com\/)([A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+)\//.exec(url);
  if (!m) return null;
  return m[1] ?? null;
}

/**
 * Decide whether a candidate URL points into the producer's own repository
 * (any path), based on the configured repository identity. Pure: same input
 * and config => same output. Returns false when identity is empty (caller
 * must fail-closed upstream).
 */
export function isProducerOwnedUrl(url: string, identity: RepositoryIdentity): boolean {
  if (identity.owner_slash_name.length === 0) return false;
  const ownerRepo = extractOwnerRepo(url);
  if (ownerRepo === null) return false;
  // Case-insensitive compare: GitHub owner/repo names are case-insensitive
  // (legacy). We lowercase both sides so `Yogata/Agent-Dev-Flow` matches
  // `yogata/agent-dev-flow`.
  return ownerRepo.toLowerCase() === identity.owner_slash_name.toLowerCase();
}

// ---------------------------------------------------------------------------
// Helpers (pure)
// ---------------------------------------------------------------------------

/**
 * Normalize a path token: convert backslashes and percent-encoded slashes
 * to forward slashes. Pure; does not touch the filesystem.
 */
export function normalizePathToken(token: string): string {
  return token.replace(/\\/g, "/").replace(/%2[fF]/g, "/");
}

/**
 * Decide whether a (already-normalized) docs path token is a CONCRETE file
 * reference. Returns true => violation; false => allowed (template/glob/index).
 */
export function isConcreteDocsPath(token: string): boolean {
  const normalized = normalizePathToken(token);
  // README.md is an index, not an individual document. Always allowed.
  if (normalized.endsWith("/README.md")) return false;
  // Template placeholders anywhere in the token mean it is not concrete.
  if (/[<>{}]/.test(normalized)) return false;
  // Glob wildcard means it is not concrete.
  if (normalized.includes("*")) return false;
  // Must end with .md to be a doc reference at all.
  if (!normalized.endsWith(".md")) return false;
  return true;
}

function trimSnippet(line: string, maxLen: number): string {
  const t = line.trim();
  return t.length <= maxLen ? t : t.substring(0, maxLen);
}

// ---------------------------------------------------------------------------
// Pipeline stage 1: extract
// ---------------------------------------------------------------------------

// Bounding constants. A pathological one-line input (e.g. hundreds of escape
// tokens) must not amplify per-detection evidence or grow the candidate list
// without bound. Detection.text is capped so a long line cannot be copied
// verbatim into every detection; candidate count is capped and an explicit
// overflow candidate fails the gate closed.
const MAX_TEXT_LEN = 200;
const MAX_CANDIDATES_PER_LINE = 64;
const OVERFLOW_REASON = "[overflow: candidate bound exceeded]";

// Candidate is a discriminated object union so the resolver can switch
// exhaustively at compile time. Wrapper characters (`<`, `>`, `{`, `}`, `*`)
// are token boundaries, never exemptions for reconstructed IDs.
export type Candidate =
  | { readonly type: "direct-id"; readonly value: string }
  | {
    readonly type: "reconstructed-id";
    /** Decoded concrete ID form, e.g. "ADR-0001". */
    readonly value: string;
    /** Source-form token, e.g. "\\u0041DR-0001". Used as `matched` evidence. */
    readonly original: string;
  }
  | { readonly type: "path"; readonly value: string }
  | { readonly type: "url"; readonly value: string }
  | { readonly type: "overflow"; readonly reason: string };

export type CandidateType = Candidate["type"];

function assertNeverCandidate(c: never): never {
  throw new Error(`unhandled candidate: ${JSON.stringify(c)}`);
}

function matchedForCandidate(c: Candidate): string {
  switch (c.type) {
    case "direct-id":
      return c.value;
    case "reconstructed-id":
      return c.original;
    case "path":
      return c.value;
    case "url":
      return c.value;
    case "overflow":
      return c.reason;
    default:
      return assertNeverCandidate(c);
  }
}

export function detectCandidates(line: string, cfg: DetectorConfig): Candidate[] {
  const out: Candidate[] = [];
  let overflow = false;
  const cap = MAX_CANDIDATES_PER_LINE - 1;

  const directSpans: Array<{ start: number; end: number }> = [];

  // Direct IDs: generic UPPER-DIGITS family. UTF-8/16/32 are encoding labels.
  for (const m of line.matchAll(GENERIC_ID_PATTERN)) {
    if (UTF_ENCODING_LABELS.has(m[0])) continue;
    if (out.length >= cap) { overflow = true; break; }
    const idx = m.index ?? 0;
    directSpans.push({ start: idx, end: idx + m[0].length });
    out.push({ type: "direct-id", value: m[0] });
  }

  // Reconstructed IDs from bounded escape atoms. Deduplicated against direct
  // IDs by overlapping source span so a literal ID is never double-counted as
  // both direct and reconstructed.
  if (!overflow) {
    for (const r of detectReconstructedIds(line)) {
      if (out.length >= cap) { overflow = true; break; }
      const overlaps = directSpans.some((s) => r.srcStart < s.end && s.start < r.srcEnd);
      if (overlaps) continue;
      out.push({ type: "reconstructed-id", value: r.decoded, original: r.original });
    }
  }

  // Docs path (slash and backslash).
  if (!overflow) {
    for (const m of line.matchAll(DOCS_PATH_PATTERN)) {
      if (out.length >= cap) { overflow = true; break; }
      out.push({ type: "path", value: m[0] });
    }
  }

  // Docs path (percent-encoded).
  if (!overflow) {
    for (const m of line.matchAll(DOCS_PATH_PERCENT_PATTERN)) {
      if (out.length >= cap) { overflow = true; break; }
      out.push({ type: "path", value: m[0] });
    }
  }

  // URLs — only extract when a repository identity is configured. An empty
  // owner_slash_name means the consumer did not pin a producer; we MUST NOT
  // emit unclassified URL detections that would mask real violations, and
  // we MUST NOT silently allow them either. The contract is: no identity
  // => no URL extraction; the launcher rejects input contract upstream.
  if (!overflow && cfg.repository_identity.owner_slash_name.length > 0) {
    for (const m of line.matchAll(URL_CANDIDATE_PATTERN)) {
      if (out.length >= cap) { overflow = true; break; }
      out.push({ type: "url", value: m[0] });
    }
  }

  if (overflow) out.push({ type: "overflow", reason: OVERFLOW_REASON });
  return out;
}

// ---------------------------------------------------------------------------
// Pipeline stage 2: resolve
// ---------------------------------------------------------------------------

export function resolveCandidate(c: Candidate, cfg: DetectorConfig): {
  classification: DependencyClass;
  category: DetectionCategory;
} {
  switch (c.type) {
    case "direct-id": {
      const m = /^([A-Z]{2,})-\d{1,}$/.exec(c.value);
      if (!m) {
        return { classification: "unclassified", category: "unclassified-entry" };
      }
      const prefix = m[1] ?? "";
      // Producer precedence: producer wins over distributed on overlap.
      if (cfg.producer_internal_id_prefixes.includes(prefix)) {
        return { classification: "producer-internal", category: "concrete-id" };
      }
      if (cfg.distributed_workflow_control_prefixes.includes(prefix)) {
        return { classification: "generic-or-template", category: "distributed-control" };
      }
      return { classification: "unclassified", category: "unclassified-entry" };
    }
    case "reconstructed-id": {
      const m = /^([A-Z]{2,})-\d{1,}$/.exec(c.value);
      if (!m) {
        return { classification: "unclassified", category: "evasion-attempt" };
      }
      const prefix = m[1] ?? "";
      // Reconstructed producer ID: producer-internal/evasion-attempt.
      // Producer wins over distributed on overlap.
      if (cfg.producer_internal_id_prefixes.includes(prefix)) {
        return { classification: "producer-internal", category: "evasion-attempt" };
      }
      // Reconstructed STEP/QG or unknown reconstructed: fail closed.
      return { classification: "unclassified", category: "evasion-attempt" };
    }
    case "path": {
      if (isConcreteDocsPath(c.value)) {
        return { classification: "producer-internal", category: "concrete-path" };
      }
      return { classification: "generic-or-template", category: "concrete-path" };
    }
    case "url": {
      // Classify by repository identity, NOT by path content. A URL into
      // the producer repo is producer-internal at any path (docs, scripts,
      // src). A URL into a different repo is consumer-resolvable. An empty
      // identity means the caller did not pin a producer; fail closed.
      if (cfg.repository_identity.owner_slash_name.length === 0) {
        return { classification: "unclassified", category: "unclassified-entry" };
      }
      if (isProducerOwnedUrl(c.value, cfg.repository_identity)) {
        return { classification: "producer-internal", category: "fixed-url" };
      }
      return { classification: "consumer-resolvable", category: "fixed-url" };
    }
    case "overflow": {
      // Pathological input: fail closed. The overflow marker is a non-ID
      // string so it cannot accidentally classify as an allowed prefix.
      return { classification: "unclassified", category: "evasion-attempt" };
    }
    default:
      return assertNeverCandidate(c);
  }
}

// ---------------------------------------------------------------------------
// Pipeline stage 3: classify
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

export {
  decideProjection,
  type ClassifyFileInput,
  type DecideResult,
} from "./boundary-gate.ts";