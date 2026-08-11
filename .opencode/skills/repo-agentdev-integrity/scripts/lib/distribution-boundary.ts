// Canonical side-effect-free distribution boundary detector.
//
// This module is the canonical detector per
// docs/specs/integrity/distribution-boundary.md (stable implementation
// contract). It performs classification only and performs NO filesystem or
// network I/O. All enforcement layers (the existing checker adapter, the
// repo-local pre-write plugin, the case-run/case-close final gate, the
// release archive pre-publication check) consume this module.
//
// Side-effect-free contract (DEC-014 decision 2):
//   - No imports of "fs" or "path" or any I/O library.
//   - All functions are pure: same input => same output, no mutation, no
//     external observation.
//   - Classification never throws for input-shape reasons; it returns
//     `unclassified` for input it cannot classify so the gate layer treats
//     it as gate-not-passed (DEC-014 decision 5).
//
// Detection model (per SPEC):
//   1. candidate extraction from text lines
//   2. resolution attempt under consumer-runtime assumptions
//   3. classification into one of:
//        consumer-resolvable    (allowed)
//        generic-or-template    (allowed, REQ-029-004)
//        producer-internal      (NOT allowed)
//        unclassified           (gate-not-passed, DEC-014 decision 5)
//   4. gate decision: any non-allowed classification => gate-not-passed

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Projection = "source" | "link" | "archive" | "archive-installed";

export const PROJECTIONS: readonly Projection[] = [
  "source",
  "link",
  "archive",
  "archive-installed",
] as const;

export type DependencyClass =
  | "consumer-resolvable"
  | "generic-or-template"
  | "producer-internal"
  | "unclassified";

export type DetectionCategory =
  | "concrete-id"
  | "concrete-path"
  | "fixed-url"
  | "unclassified-entry"
  | "adapter-failure";

export interface LineInput {
  /** Full line text including any trailing newline already stripped by caller. */
  readonly text: string;
  /** 1-based line number within the source file. */
  readonly lineNumber: number;
  /** File path as observed by the caller (repo-relative or absolute). */
  readonly filePath: string;
  /** Projection this file belongs to. Recorded on each Detection. */
  readonly projection: Projection;
}

export interface Detection {
  /** The original line text (echoed for downstream reporting). */
  readonly text: string;
  /** 1-based line number. */
  readonly line: number;
  /** File path as provided by the caller. */
  readonly file: string;
  /** Projection recorded for traceability across source/link/archive/archive-installed. */
  readonly projection: Projection;
  /** Final classification of the candidate. */
  readonly classification: DependencyClass;
  /** The substring that matched a detection pattern. */
  readonly matched: string;
  /** Trimmed snippet of the line for human-readable reports. */
  readonly snippet: string;
  /** Detector category (what kind of pattern was matched). */
  readonly category: DetectionCategory;
}

export interface GateResult {
  /** True only when no failures and no errors were produced. */
  readonly pass: boolean;
  /** Producer-internal detections (must be zero to pass). */
  readonly failures: readonly Detection[];
  /** Unclassified / adapter-failure detections (also block the gate, DEC-014 decision 5). */
  readonly errors: readonly Detection[];
  /** Projection this gate result applies to. */
  readonly projection: Projection;
}

// ---------------------------------------------------------------------------
// Detection patterns (shared with the legacy checker via re-export/adapter)
// ---------------------------------------------------------------------------

// Pipeline-stage 1 patterns: candidate extraction. These broad patterns
// capture everything that MIGHT be a producer-internal reference. The
// resolution stage (resolveCandidate) decides the actual classification.
//
// IDs: ADR-NNNN, REQ-NNNN, DEC-NNN (1-4 digits). Template/glob forms
// ({NNNN}, <NNNN>, *) do not match because \d requires actual digits.
export const CONCRETE_ID_PATTERN = /\b(ADR|REQ|DEC)-\d{1,4}\b/g;

// Candidate docs paths. We extract any docs/(adr|requirements|specs|decisions)
// path token, then the resolution stage decides concrete vs template/glob.
export const DOCS_PATH_PATTERN =
  /docs\/(adr|requirements|specs|decisions)\/[^\s)\]\|\\"'`<>{}]+/g;

// Candidate GitHub URLs (blob/raw). ALL such URLs are extracted as candidates;
// the resolution stage checks whether the URL path contains /docs/ to
// distinguish producer-internal (points at this repo's docs) from
// consumer-resolvable (external reference). Per Oracle finding 3: do not
// classify unrelated external GitHub blob URLs as producer-internal.
export const URL_CANDIDATE_PATTERN =
  /(?:github\.com\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+\/(?:blob|raw)\/|raw\.githubusercontent\.com\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+\/)[^\s)\]\\"'`<>{}]+/g;

// Backward-compat re-exports (legacy code may import these names).
export const FIXED_URL_PATTERN = URL_CANDIDATE_PATTERN;
export const RAW_FIXED_URL_PATTERN = URL_CANDIDATE_PATTERN;

// ---------------------------------------------------------------------------
// Helpers (pure)
// ---------------------------------------------------------------------------

/**
 * Decide whether a candidate docs path token (already stripped of surrounding
 * punctuation) is a concrete file reference or a template.
 *
 * Returns true when the token is a CONCRETE reference (i.e. a violation).
 */
export function isConcreteDocsPath(token: string): boolean {
  // README.md is an index, not an individual document. Always allowed.
  if (token.endsWith("/README.md")) return false;
  // Template placeholders anywhere in the token mean it is not concrete.
  if (/[<>{}]/.test(token)) return false;
  // Glob wildcard means it is not concrete.
  if (token.includes("*")) return false;
  // Must end with .md to be a doc reference at all.
  if (!token.endsWith(".md")) return false;
  return true;
}

function trimSnippet(line: string, maxLen: number): string {
  const t = line.trim();
  return t.length <= maxLen ? t : t.substring(0, maxLen);
}

// ---------------------------------------------------------------------------
// Pipeline: extract → resolve → classify
// ---------------------------------------------------------------------------

export type CandidateType = "id" | "path" | "url";

export interface Candidate {
  readonly type: CandidateType;
  readonly value: string;
}

// Pipeline-stage 2: resolve a single candidate in consumer context.
// Returns the classification and detection category for gate decision.
export function resolveCandidate(c: Candidate): {
  classification: DependencyClass;
  category: DetectionCategory;
} {
  if (c.type === "id") {
    return { classification: "producer-internal", category: "concrete-id" };
  }
  if (c.type === "path") {
    if (isConcreteDocsPath(c.value)) {
      return { classification: "producer-internal", category: "concrete-path" };
    }
    return { classification: "generic-or-template", category: "concrete-path" };
  }
  // url: only producer-internal if the URL path contains /docs/.
  // External GitHub URLs (to other repos, code paths, etc.) are
  // consumer-resolvable (Oracle finding 3).
  if (/\/docs\//.test(c.value)) {
    return { classification: "producer-internal", category: "fixed-url" };
  }
  return { classification: "consumer-resolvable", category: "fixed-url" };
}

function extractCandidates(line: string): Candidate[] {
  const out: Candidate[] = [];
  const idMatches = line.match(CONCRETE_ID_PATTERN);
  if (idMatches) for (const m of idMatches) out.push({ type: "id", value: m });
  const pathMatches = line.match(DOCS_PATH_PATTERN);
  if (pathMatches) for (const m of pathMatches) out.push({ type: "path", value: m });
  const urlMatches = line.match(URL_CANDIDATE_PATTERN);
  if (urlMatches) for (const m of urlMatches) out.push({ type: "url", value: m });
  return out;
}

// ---------------------------------------------------------------------------
// Classification (public API: uses pipeline internally)
// ---------------------------------------------------------------------------

/**
 * Classify a single line. Returns zero or more Detection records.
 *
 * Pure: same input => same output, no side effects.
 */
export function classifyLine(input: LineInput): readonly Detection[] {
  const out: Detection[] = [];
  const line = input.text;
  const trimmed = line.trim();
  if (trimmed.length === 0) return out;

  const base = {
    text: line,
    line: input.lineNumber,
    file: input.filePath,
    projection: input.projection,
    snippet: trimSnippet(line, 200),
  };

  const candidates = extractCandidates(line);
  for (const c of candidates) {
    const resolved = resolveCandidate(c);
    // Only emit detections for non-allowed classifications.
    // consumer-resolvable and generic-or-template do not produce Detection
    // records (they pass the gate silently).
    if (resolved.classification === "producer-internal") {
      out.push({
        ...base,
        classification: resolved.classification,
        matched: c.value,
        category: resolved.category,
      });
    }
  }

  return out;
}

/**
 * Classify the full content of a single file. Splits on \r?\n and dispatches
 * each non-empty line through classifyLine.
 */
export function classifyContent(
  content: string,
  filePath: string,
  projection: Projection,
): readonly Detection[] {
  const out: Detection[] = [];
  if (content.length === 0) return out;
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const lineDetections = classifyLine({
      text: lines[i]!,
      lineNumber: i + 1,
      filePath,
      projection,
    });
    for (const d of lineDetections) out.push(d);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Gate decision
// ---------------------------------------------------------------------------

/**
 * Decide whether a set of detections passes the boundary gate.
 *
 * Per DEC-014 decision 5: producer-internal AND unclassified/adapter-failure
 * detections BOTH cause gate-not-passed. Neither is silently treated as clean.
 */
export function decideGate(detections: readonly Detection[]): GateResult {
  const failures: Detection[] = [];
  const errors: Detection[] = [];
  let projection: Projection = "source";
  for (const d of detections) {
    projection = d.projection;
    if (d.classification === "producer-internal") {
      failures.push(d);
    } else if (d.classification === "unclassified") {
      errors.push(d);
    }
    // consumer-resolvable and generic-or-template do not block.
  }
  return {
    pass: failures.length === 0 && errors.length === 0,
    failures,
    errors,
    projection,
  };
}

// ---------------------------------------------------------------------------
// Text/binary distinction (Oracle finding 2: scan ALL text artifacts, not
// just .md). Deterministic extension-based classification. Files with unknown
// or missing extensions are treated as text (conservative: scan rather than
// skip, per DEC-014 decision 5 "errors are gate-not-passed, not clean").
// ---------------------------------------------------------------------------

export const TEXT_EXTENSIONS = new Set([
  ".md", ".markdown", ".txt", ".text",
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".mts", ".cts",
  ".yaml", ".yml",
  ".json", ".jsonc",
  ".ps1", ".psm1", ".psd1",
  ".sh", ".bash", ".zsh",
  ".py",
  ".rs",
  ".go",
  ".xml", ".html", ".htm", ".css", ".scss", ".sass",
  ".toml", ".ini", ".cfg", ".conf",
  ".gitignore", ".gitattributes",
  ".env",
]);

export const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico", ".webp", ".tiff", ".svgz",
  ".pdf",
  ".zip", ".gz", ".tar", ".tgz", ".bz2", ".7z", ".rar",
  ".exe", ".dll", ".so", ".dylib", ".bin",
  ".class", ".jar",
  ".woff", ".woff2", ".ttf", ".otf", ".eot",
  ".mp3", ".mp4", ".avi", ".mov", ".webm",
  ".lockb", ".bin",
  ".DS_Store",
]);

export function isTextFile(filename: string): boolean {
  const lower = filename.toLowerCase();
  // Files with no extension: treat as text (README, LICENSE, Makefile, etc.)
  const lastDot = lower.lastIndexOf(".");
  if (lastDot < 0) return true;
  const ext = lower.slice(lastDot);
  if (BINARY_EXTENSIONS.has(ext)) return false;
  if (TEXT_EXTENSIONS.has(ext)) return true;
  // Unknown extension: treat as text (conservative scan per DEC-014 D5).
  return true;
}
