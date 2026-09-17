// Side-effect-free distribution boundary detector — Stage A aligned core.
//
// Mirrors trusted-distribution-gate/boundary-pipeline.ts semantics without
// importing candidate code into Stage A. Handles arbitrary producer-internal
// ID families via DetectorConfig.producer_internal_id_prefixes; classifies
// URLs by configured repository identity (NOT by /docs/ path heuristic);
// normalizes backslash / percent-encoded / query / fragment path variants;
// fail-closes on unclassified IDs and empty repository identity.
//
// Pure: no fs/path/I/O imports; same input => same output; never throws for
// input-shape reasons. The gate layer treats `unclassified` as
// gate-not-passed (DEC-014 decision 5).

import type {
  DependencyClass,
  Detection,
  DetectionCategory,
  LineInput,
  ProducerMetadataEnforcement,
  Projection,
} from "./distribution-boundary.ts";
import {
  DOCS_PATH_PATTERN,
  DOCS_PATH_PERCENT_PATTERN,
  GENERIC_ID_PATTERN,
  ID_EVASION_PATTERN,
  URL_CANDIDATE_PATTERN,
  containsAdfCoversMarker,
  isAdfCoversDeclarationLine,
  isConcreteDocsPath,
  isProducerOwnedUrl,
  isTemplateWrappedId,
  trimSnippet,
} from "./distribution-boundary-patterns.ts";

export {
  GENERIC_ID_PATTERN,
  CONCRETE_ID_PATTERN,
  DOCS_PATH_PATTERN,
  DOCS_PATH_PERCENT_PATTERN,
  URL_CANDIDATE_PATTERN,
  ID_EVASION_PATTERN,
  FIXED_URL_PATTERN,
  RAW_FIXED_URL_PATTERN,
  normalizePathToken,
  stripQueryAndFragment,
  isConcreteDocsPath,
  isAdfCoversDeclarationLine,
  extractOwnerRepo,
  isProducerOwnedUrl,
} from "./distribution-boundary-patterns.ts";

// ---------------------------------------------------------------------------
// Detector configuration
// ---------------------------------------------------------------------------

export interface RepositoryIdentity {
  /** e.g. "yogata/agent-dev-flow". Empty string disables URL classification. */
  readonly owner_slash_name: string;
  /** Default branch name used in producer URLs, e.g. "main". */
  readonly default_branch: string;
}

export interface DetectorConfig {
  readonly repository_identity: RepositoryIdentity;
  /** Producer-internal ID prefixes (UPPER-CASE letters only, e.g. "ADR"). */
  readonly producer_internal_id_prefixes: readonly string[];
  /**
   * Distributed workflow control label prefixes (UPPER-CASE letters only).
   * These are legitimate workflow vocabulary that ships in restored
   * executable docs (case-close STEP/QG labels) and MUST NOT trip the
   * boundary gate. Distinct from producer_internal_id_prefixes so adding
   * STEP/QG here cannot accidentally relax a real producer-internal family.
   */
  readonly distributed_workflow_control_prefixes: readonly string[];
  /**
   * Producer-side traceability metadata enforcement mode (DEC-030 decision 5).
   * "report" keeps the current operating level: inline ADF-COVERS declarations
   * in the distribution closure are detected as producer-metadata findings but
   * do not fail the gate, and the declaration-line extraction skip stays in
   * effect. "enforce" is the Wave 4 activation state: the extraction skip is
   * removed and producer-metadata detections fail the gate as unclassified.
   */
  readonly producer_metadata_enforcement: ProducerMetadataEnforcement;
}

/**
 * Default producer identity for the agent-dev-flow self-hosting repo. The
 * plugin exposes this at the boundary so consumers can override it via
 * makeGuardEnv({ repository_identity }) when self-hosting.
 */
export const DEFAULT_REPOSITORY_IDENTITY: RepositoryIdentity = {
  owner_slash_name: "yogata/agent-dev-flow",
  default_branch: "main",
};

export const DEFAULT_DETECTOR_CONFIG: DetectorConfig = {
  repository_identity: DEFAULT_REPOSITORY_IDENTITY,
  producer_internal_id_prefixes: ["ADR", "REQ", "DEC"],
  distributed_workflow_control_prefixes: ["STEP", "QG"],
  // Activation stays at "report" until the Wave 4 issue performs the switch
  // (RA-006 activation part); inline declarations still exist in src/opencode.
  producer_metadata_enforcement: "report",
};

// ---------------------------------------------------------------------------
// Pipeline: extract → resolve → classify
// ---------------------------------------------------------------------------

export type CandidateType = "id" | "path" | "url" | "evasion";

export interface Candidate {
  readonly type: CandidateType;
  readonly value: string;
}

export function detectCandidates(
  line: string,
  cfg: DetectorConfig,
): Candidate[] {
  const out: Candidate[] = [];

  // DEC-030 decision 5 removed the ADF-COVERS exemption. The declaration-line
  // id/path/url extraction skip is no longer an unconditional exemption: it
  // survives only outside "enforce" mode to keep the current operating level
  // during the migration window, and is removed in "enforce" mode so
  // declaration contents are scanned like any other line. Anything other than
  // an explicit "enforce" (including an undefined field on a hand-built
  // DetectorConfig) stays at the report level. Evasion extraction stays
  // fail-closed in both modes — an escape sequence must not hide inside a
  // declaration comment.
  if (
    cfg.producer_metadata_enforcement !== "enforce" &&
    isAdfCoversDeclarationLine(line)
  ) {
    for (const m of line.matchAll(ID_EVASION_PATTERN)) {
      out.push({ type: "evasion", value: m[0] });
    }
    return out;
  }

  for (const m of line.matchAll(GENERIC_ID_PATTERN)) {
    const start = m.index ?? 0;
    const end = start + m[0].length;
    if (isTemplateWrappedId(line, start, end)) continue;
    if (/^UTF-(?:8|16|32)$/.test(m[0])) continue;
    out.push({ type: "id", value: m[0] });
  }

  for (const m of line.matchAll(DOCS_PATH_PATTERN)) {
    out.push({ type: "path", value: m[0] });
  }

  for (const m of line.matchAll(DOCS_PATH_PERCENT_PATTERN)) {
    out.push({ type: "path", value: m[0] });
  }

  // URLs are always extracted. When repository_identity.owner_slash_name is
  // empty, resolveCandidateConfig returns `unclassified` for them so the gate
  // fails closed (DEC-014 decision 5). Skipping extraction here was a
  // false-clean: URLs in unscanned lines passed silently. The adapter layer
  // additionally enforces non-empty identity at its boundary.
  for (const m of line.matchAll(URL_CANDIDATE_PATTERN)) {
    out.push({ type: "url", value: m[0] });
  }

  // Evasion: an UPPER-prefix followed by an escape sequence (\\uXXXX, \\xXX,
  // 0xXX) instead of literal digits. Treated as a distinct candidate so
  // resolveCandidateConfig can fail-closed it regardless of the prefix.
  for (const m of line.matchAll(ID_EVASION_PATTERN)) {
    out.push({ type: "evasion", value: m[0] });
  }

  return out;
}

/**
 * Resolve a candidate under the configured DetectorConfig. IDs whose prefix
 * is in producer_internal_id_prefixes are producer-internal; IDs whose prefix
 * is in distributed_workflow_control_prefixes are distributed-control (the
 * gate does not flag legitimate workflow labels like STEP/QG); all other ID
 * families return `unclassified` so the gate layer fails closed. URLs are
 * classified by repository identity (NOT by `/docs/` path content). Evasion
 * candidates (escape-sequence IDs) always fail closed.
 */
export function resolveCandidateConfig(
  c: Candidate,
  cfg: DetectorConfig,
): { classification: DependencyClass; category: DetectionCategory } {
  if (c.type === "evasion") {
    return { classification: "unclassified", category: "evasion-attempt" };
  }

  if (c.type === "id") {
    const m = /^([A-Z]{2,})-\d{1,}$/.exec(c.value);
    if (!m) {
      return { classification: "unclassified", category: "unclassified-entry" };
    }
    const prefix = m[1] ?? "";
    if (cfg.producer_internal_id_prefixes.includes(prefix)) {
      return { classification: "producer-internal", category: "concrete-id" };
    }
    if (cfg.distributed_workflow_control_prefixes.includes(prefix)) {
      return { classification: "distributed-control", category: "distributed-control" };
    }
    return { classification: "unclassified", category: "unclassified-entry" };
  }

  if (c.type === "path") {
    if (isConcreteDocsPath(c.value)) {
      return { classification: "producer-internal", category: "concrete-path" };
    }
    return { classification: "generic-or-template", category: "concrete-path" };
  }

  // url
  if (cfg.repository_identity.owner_slash_name.length === 0) {
    return { classification: "unclassified", category: "unclassified-entry" };
  }
  if (isProducerOwnedUrl(c.value, cfg.repository_identity)) {
    return { classification: "producer-internal", category: "fixed-url" };
  }
  return { classification: "consumer-resolvable", category: "fixed-url" };
}

/**
 * Backward-compat resolveCandidate (no config). Uses DEFAULT_DETECTOR_CONFIG
 * so existing callers retain Stage-A-aligned behavior.
 */
export function resolveCandidate(c: Candidate): {
  classification: DependencyClass;
  category: DetectionCategory;
} {
  return resolveCandidateConfig(c, DEFAULT_DETECTOR_CONFIG);
}

// ---------------------------------------------------------------------------
// Public classification API
// ---------------------------------------------------------------------------

export function classifyLineConfig(
  input: LineInput,
  cfg: DetectorConfig,
): readonly Detection[] {
  const out: Detection[] = [];
  const trimmed = input.text.trim();
  if (trimmed.length === 0) return out;

  const base = {
    text: input.text,
    line: input.lineNumber,
    file: input.filePath,
    projection: input.projection,
    snippet: trimSnippet(input.text, 200),
  };

  // Producer-side traceability metadata detection signal (DEC-030 decision 5):
  // a bare ADF-COVERS declaration marker match, no role or path filter, over
  // the full artifact text. Always emitted; the classification decides whether
  // the gate fails (enforce => producer-internal) or the finding is reported
  // without failing the gate (report => distributed-control).
  const hasProducerMetadata = containsAdfCoversMarker(input.text);

  const candidates = detectCandidates(input.text, cfg);
  for (const c of candidates) {
    const resolved = resolveCandidateConfig(c, cfg);
    // Only emit detections for non-allowed classifications.
    // consumer-resolvable and generic-or-template pass silently.
    if (
      resolved.classification === "producer-internal" ||
      resolved.classification === "unclassified"
    ) {
      out.push({
        ...base,
        classification: resolved.classification,
        matched: c.value,
        category: resolved.category,
      });
    }
  }

  if (hasProducerMetadata) {
    out.push({
      ...base,
      // "enforce": producer-side traceability metadata is a producer-internal
      // contamination (violation). "report": distributed-control keeps the
      // finding observable without failing the gate (current operating level;
      // the activation switch belongs to the Wave 4 issue).
      classification:
        cfg.producer_metadata_enforcement === "enforce"
          ? "producer-internal"
          : "distributed-control",
      matched: "ADF-COVERS",
      category: "producer-metadata",
    });
  }

  return out;
}

/**
 * Backward-compat classifyLine (no config). Uses DEFAULT_DETECTOR_CONFIG.
 */
export function classifyLine(input: LineInput): readonly Detection[] {
  return classifyLineConfig(input, DEFAULT_DETECTOR_CONFIG);
}

export function classifyContentConfig(
  content: string,
  filePath: string,
  projection: Projection,
  cfg: DetectorConfig,
): readonly Detection[] {
  const out: Detection[] = [];
  if (content.length === 0) return out;
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const lineDetections = classifyLineConfig(
      {
        text: lines[i] ?? "",
        lineNumber: i + 1,
        filePath,
        projection,
      },
      cfg,
    );
    for (const d of lineDetections) out.push(d);
  }
  return out;
}

/**
 * Backward-compat classifyContent (no config). Uses DEFAULT_DETECTOR_CONFIG.
 */
export function classifyContent(
  content: string,
  filePath: string,
  projection: Projection,
): readonly Detection[] {
  return classifyContentConfig(
    content,
    filePath,
    projection,
    DEFAULT_DETECTOR_CONFIG,
  );
}
