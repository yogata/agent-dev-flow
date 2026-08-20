// Canonical side-effect-free distribution boundary detector — entry point.
//
// Stable implementation contract per docs/designs/integrity/distribution-boundary.md.
// Performs classification only and performs NO filesystem or network I/O. All
// enforcement layers (the existing checker adapter, the repo-local pre-write
// plugin, the case-run/case-close final gate, the release archive
// pre-publication check) consume this module.
//
// The detector core lives in distribution-boundary-detector.ts (patterns,
// config, candidate extraction, classification). Text/binary classification
// lives in distribution-boundary-text-binary.ts. This file owns only the
// shared types and the gate decision. The split keeps each focused module
// under the 250 pure-LOC ceiling.
//
// Side-effect-free contract (DEC-014 decision 2):
//   - No imports of "fs" or "path" or any I/O library.
//   - All functions are pure: same input => same output, no mutation, no
//     external observation.
//   - Classification never throws for input-shape reasons; it returns
//     `unclassified` for input it cannot classify so the gate layer treats
//     it as gate-not-passed (DEC-014 decision 5).

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
  | "distributed-control"
  | "unclassified";

export type DetectionCategory =
  | "concrete-id"
  | "concrete-path"
  | "fixed-url"
  | "unclassified-entry"
  | "adapter-failure"
  | "distributed-control"
  | "evasion-attempt";

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
  readonly text: string;
  readonly line: number;
  readonly file: string;
  readonly projection: Projection;
  readonly classification: DependencyClass;
  readonly matched: string;
  readonly snippet: string;
  readonly category: DetectionCategory;
}

export interface GateResult {
  readonly pass: boolean;
  readonly failures: readonly Detection[];
  readonly errors: readonly Detection[];
  readonly projection: Projection;
}

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
  }
  return {
    pass: failures.length === 0 && errors.length === 0,
    failures,
    errors,
    projection,
  };
}

// Re-export detector core (patterns, config, classification).
export {
  GENERIC_ID_PATTERN,
  CONCRETE_ID_PATTERN,
  DOCS_PATH_PATTERN,
  DOCS_PATH_PERCENT_PATTERN,
  URL_CANDIDATE_PATTERN,
  ID_EVASION_PATTERN,
  FIXED_URL_PATTERN,
  RAW_FIXED_URL_PATTERN,
  DEFAULT_REPOSITORY_IDENTITY,
  DEFAULT_DETECTOR_CONFIG,
  normalizePathToken,
  stripQueryAndFragment,
  isConcreteDocsPath,
  extractOwnerRepo,
  isProducerOwnedUrl,
  detectCandidates,
  resolveCandidate,
  resolveCandidateConfig,
  classifyLine,
  classifyLineConfig,
  classifyContent,
  classifyContentConfig,
  type RepositoryIdentity,
  type DetectorConfig,
  type CandidateType,
  type Candidate,
} from "./distribution-boundary-detector.ts";

// Re-export text/binary classification.
export {
  TEXT_EXTENSIONS,
  BINARY_EXTENSIONS,
  isTextFile,
  isBinaryFile,
  isUnknownExtension,
  isValidStrictUtf8,
  isBinaryBytes,
  classifyBytes,
  classifyByExtension,
  decodeStrictUtf8,
  InvalidUtf8Error,
  type ByteSource,
  type ByteClassification,
} from "./distribution-boundary-text-binary.ts";
