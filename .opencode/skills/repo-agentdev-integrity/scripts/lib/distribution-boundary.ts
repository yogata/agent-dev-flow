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

// Concrete IDs: ADR-NNNN, REQ-NNNN (3 or 4 digits). Excludes ADR-{NNNN},
// REQ-{NNNN}, ADR-*, etc. via the negative-shape of the digit class.
export const CONCRETE_ID_PATTERN = /\b(ADR|REQ)-\d{3,4}\b/g;

// Candidate concrete docs paths. We match any docs/{adr,requirements,specs}/...
// path token and then decide whether it is a concrete file or a template.
export const DOCS_PATH_PATTERN =
  /docs\/(adr|requirements|specs)\/[^\s)\]\|\\"'`<>{}]+/g;

// Fixed URLs that point at a specific blob/raw of this repo. Owner/repo kept
// generic so the rule travels if the self-host repo is renamed.
export const FIXED_URL_PATTERN =
  /github\.com\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+\/(blob|raw)\//g;
export const RAW_FIXED_URL_PATTERN =
  /raw\.githubusercontent\.com\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+\//g;

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
// Classification
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

  // Fixed URL check (never exempted by template hints; URLs are not templated).
  const urlMatches = line.match(FIXED_URL_PATTERN) || line.match(RAW_FIXED_URL_PATTERN);
  if (urlMatches) {
    for (const m of urlMatches) {
      out.push({
        ...base,
        classification: "producer-internal",
        matched: m,
        category: "fixed-url",
      });
    }
  }

  // Concrete ID check.
  const idMatches = line.match(CONCRETE_ID_PATTERN);
  if (idMatches) {
    for (const m of idMatches) {
      out.push({
        ...base,
        classification: "producer-internal",
        matched: m,
        category: "concrete-id",
      });
    }
  }

  // Concrete docs path check.
  const pathCandidates = line.match(DOCS_PATH_PATTERN);
  if (pathCandidates) {
    for (const candidate of pathCandidates) {
      if (isConcreteDocsPath(candidate)) {
        out.push({
          ...base,
          classification: "producer-internal",
          matched: candidate,
          category: "concrete-path",
        });
      }
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
