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
  GateResult,
  LineInput,
  Projection,
} from "./types.ts";

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

// ID-shaped evasion patterns: uppercase prefix + hyphen + \uXXXX, \xXX, or 0xXX
const EVASION_PATTERN = /\b([A-Z]{2,})-(\\u[0-9A-Fa-f]{4}|\\x[0-9A-Fa-f]{2}|0x[0-9A-Fa-f]{2,})\b/g;

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

export type CandidateType = "id" | "path" | "url" | "evasion";

export interface Candidate {
  readonly type: CandidateType;
  readonly value: string;
}

/**
 * Skip line-level extraction for placeholder-only ID forms.
 * `REQ-{NNNN}`, `<REQ-NNNN>`, `REQ-*` etc. are template forms that should
 * not be flagged. We test whether an ID candidate is wrapped in or adjacent
 * to placeholder markers.
 */
function isTemplateWrappedId(text: string, matchStart: number, matchEnd: number): boolean {
  // Check immediately before the match for `{` or `<`.
  const before = text.charAt(matchStart - 1);
  // Check immediately after the match for `}` or `>`.
  const after = text.charAt(matchEnd);
  if (before === "{" && after === "}") return true;
  if (before === "<" && after === ">") return true;
  // Glob wildcard immediately after the digits means template.
  if (after === "*") return true;
  return false;
}

export function detectCandidates(line: string, _cfg: DetectorConfig): Candidate[] {
  const out: Candidate[] = [];

  // IDs: generic UPPER-DIGITS family.
  for (const m of line.matchAll(GENERIC_ID_PATTERN)) {
    const start = m.index ?? 0;
    const end = start + m[0].length;
    if (isTemplateWrappedId(line, start, end)) continue;
    // UTF-8, UTF-16, UTF-32 are encoding labels, not ID candidates.
    if (UTF_ENCODING_LABELS.has(m[0])) continue;
    out.push({ type: "id", value: m[0] });
  }

  // ID-shaped evasion patterns: uppercase prefix + hyphen + \uXXXX, \xXX, or 0xXX
  for (const m of line.matchAll(EVASION_PATTERN)) {
    const start = m.index ?? 0;
    const end = start + m[0].length;
    if (isTemplateWrappedId(line, start, end)) continue;
    out.push({ type: "evasion", value: m[0] });
  }

  // Docs path (slash and backslash).
  for (const m of line.matchAll(DOCS_PATH_PATTERN)) {
    out.push({ type: "path", value: m[0] });
  }

  // Docs path (percent-encoded).
  for (const m of line.matchAll(DOCS_PATH_PERCENT_PATTERN)) {
    out.push({ type: "path", value: m[0] });
  }

  // URLs — only extract when a repository identity is configured. An empty
  // owner_slash_name means the consumer did not pin a producer; we MUST NOT
  // emit unclassified URL detections that would mask real violations, and
  // we MUST NOT silently allow them either. The contract is: no identity
  // => no URL extraction; the launcher rejects input contract upstream.
  if (_cfg.repository_identity.owner_slash_name.length > 0) {
    for (const m of line.matchAll(URL_CANDIDATE_PATTERN)) {
      out.push({ type: "url", value: m[0] });
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// Pipeline stage 2: resolve
// ---------------------------------------------------------------------------

export function resolveCandidate(c: Candidate, cfg: DetectorConfig): {
  classification: DependencyClass;
  category: DetectionCategory;
} {
  if (c.type === "evasion") {
    // Evasion attempts must fail closed as unclassified.
    return { classification: "unclassified", category: "evasion-attempt" };
  }

  if (c.type === "id") {
    // Extract the UPPER prefix to classify.
    const m = /^([A-Z]{2,})-\d{1,}$/.exec(c.value);
    if (!m) {
      // Should not happen because extraction guarantees shape; fail closed.
      return { classification: "unclassified", category: "unclassified-entry" };
    }
    const prefix = m[1] ?? "";

    // Distributed workflow control: STEP-N, QG-N are generic-or-template.
    if (cfg.distributed_workflow_control_prefixes.includes(prefix)) {
      return { classification: "generic-or-template", category: "distributed-control" };
    }

    if (cfg.producer_internal_id_prefixes.includes(prefix)) {
      return { classification: "producer-internal", category: "concrete-id" };
    }
    return { classification: "unclassified", category: "unclassified-entry" };
  }

  if (c.type === "path") {
    if (isConcreteDocsPath(c.value)) {
      return { classification: "producer-internal", category: "concrete-path" };
    }
    return { classification: "generic-or-template", category: "concrete-path" };
  }

  // url: classify by repository identity, NOT by path content. A URL into
  // the producer repo is producer-internal at any path (docs, scripts, src).
  // A URL into a different repo is consumer-resolvable, even if it points
  // at that project's docs. An empty identity means the caller did not pin
  // a producer; the resolution stage fail-closes by returning unclassified.
  if (cfg.repository_identity.owner_slash_name.length === 0) {
    return { classification: "unclassified", category: "unclassified-entry" };
  }
  if (isProducerOwnedUrl(c.value, cfg.repository_identity)) {
    return { classification: "producer-internal", category: "fixed-url" };
  }
  return { classification: "consumer-resolvable", category: "fixed-url" };
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
  for (const c of candidates) {
    const { classification, category } = resolveCandidate(c, cfg);
    detections.push({
      text: line.text,
      line: line.lineNumber,
      file: line.filePath,
      projection: line.projection,
      classification,
      matched: c.value,
      snippet: trimSnippet(line.text, 80),
      category,
    });
  }
  return { detections };
}

// ---------------------------------------------------------------------------
// Pipeline stage 4: decide (gate over many lines)
// ---------------------------------------------------------------------------

export interface ClassifyFileInput {
  readonly filePath: string;
  readonly projection: Projection;
  /** Text content (already validated UTF-8 by the text-binary module). */
  readonly text: string;
}

export interface DecideResult {
  readonly gate: GateResult;
}

export function decideProjection(
  files: readonly ClassifyFileInput[],
  projection: Projection,
  cfg: DetectorConfig,
): DecideResult {
  const failures: Detection[] = [];
  const errors: Detection[] = [];

  for (const file of files) {
    const lines = file.text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const lineText = lines[i] ?? "";
      const lineInput: LineInput = {
        text: lineText,
        lineNumber: i + 1,
        filePath: file.filePath,
        projection: file.projection,
      };
      const cls = classifyLine(lineInput, cfg);
      for (const d of cls.detections) {
        if (d.classification === "producer-internal") failures.push(d);
        else if (d.classification === "unclassified") errors.push(d);
      }
    }
  }

  const gate: GateResult = {
    pass: failures.length === 0 && errors.length === 0,
    failures,
    errors,
    projection,
  };
  return { gate };
}
