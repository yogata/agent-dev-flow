// Pre-write evaluation functions for the distribution boundary guard.
//
// Each evaluate* function takes the parsed tool args plus a GuardEnv and
// returns a GuardDetectionsResult. The orchestrator (distribution-boundary-guard.ts)
// uses these to decide whether to throw and block the write.
//
// Path classification is three-valued (distributed / non-distributed /
// outside-root) so the gate fail-closes when a tool targets a path the
// plugin cannot classify (absolute path outside the worktree, traversal
// escape, malformed). See distribution-boundary-guard-paths.ts.
//
// Pure except for the injected GuardEnv.readFile: same input + same readFile
// output => same evaluation result. Inspection failures (read failure,
// malformed patch input, unclassified entry, outside-root target) fail
// closed per the distribution boundary DEC (fail-closed).

import {
  classifyContentConfig,
  decideGate,
  type Detection,
} from "../../../../../.opencode/skills/repo-agentdev-integrity/scripts/lib/distribution-boundary.ts";
import {
  parseApplyPatchText,
  type ParsedApplyPatch,
  type ParsedEdit,
  type PatchEntry,
} from "./distribution-boundary-guard-parser.ts";
import type { PathClass } from "./distribution-boundary-guard-paths.ts";
import {
  reconstructAddFile,
  reconstructEdit,
  reconstructUpdateFile,
  safeRead,
} from "./distribution-boundary-guard-reconstruction.ts";
import type { GuardEnv } from "../plugin.ts";

export type PathClassifier = (rawPath: string) => PathClass;

export type GuardDetectionsResult =
  | { ok: true; detections: readonly Detection[] }
  | {
      ok: false;
      detections: readonly Detection[];
      errorKind: "violation" | "inspection-error";
    };

export function emptyOk(): GuardDetectionsResult {
  return { ok: true, detections: [] };
}

export function inspectionError(): GuardDetectionsResult {
  return { ok: false, detections: [], errorKind: "inspection-error" };
}

export function fromDetections(
  detections: readonly Detection[],
): GuardDetectionsResult {
  if (detections.length === 0) return { ok: true, detections };
  const gate = decideGate(detections);
  if (gate.pass) return { ok: true, detections };
  const hasErrors = gate.errors.length > 0;
  return {
    ok: false,
    detections,
    errorKind: hasErrors ? "inspection-error" : "violation",
  };
}

/**
 * Translate a PathClass into a no-op pass / fail-closed inspection error /
 * continue signal. Returns "continue" only for distributed paths.
 */
function gateOnClass(cls: PathClass): "continue" | GuardDetectionsResult {
  if (cls === "non-distributed") return emptyOk();
  if (cls === "outside-root") return inspectionError();
  return "continue";
}

// ---------------------------------------------------------------------------
// evaluateWriteContent
// ---------------------------------------------------------------------------

export function evaluateWriteContentEnv(
  filePath: string,
  content: string,
  env: GuardEnv,
  classify: PathClassifier,
): GuardDetectionsResult {
  const gate = gateOnClass(classify(filePath));
  if (gate !== "continue") return gate;
  return fromDetections(
    classifyContentConfig(content, filePath, env.projection, env.detector_config),
  );
}

// ---------------------------------------------------------------------------
// evaluateEdit
// ---------------------------------------------------------------------------

export function evaluateEditEnv(
  args: ParsedEdit,
  env: GuardEnv,
  classify: PathClassifier,
  currentContentOverride?: string,
): GuardDetectionsResult {
  const gate = gateOnClass(classify(args.filePath));
  if (gate !== "continue") return gate;
  const current =
    currentContentOverride !== undefined
      ? currentContentOverride
      : safeRead(env.readFile, args.filePath);
  if (current === null) return inspectionError();
  const r = reconstructEdit({
    currentContent: current,
    oldString: args.oldString,
    newString: args.newString,
    replaceAll: args.replaceAll,
  });
  if (!r.ok) return inspectionError();
  return fromDetections(
    classifyContentConfig(r.content, args.filePath, env.projection, env.detector_config),
  );
}

// ---------------------------------------------------------------------------
// evaluateApplyPatch
// ---------------------------------------------------------------------------

export function evaluateApplyPatchEnv(
  args: ParsedApplyPatch,
  env: GuardEnv,
  classify: PathClassifier,
): GuardDetectionsResult {
  const parsed = parseApplyPatchText(args.patchText);
  if (parsed.kind === "malformed") return inspectionError();

  const detections: Detection[] = [];
  for (const entry of parsed.entries) {
    const entryDetections = inspectPatchEntry(entry, env, classify);
    if (entryDetections === null) return inspectionError();
    for (const d of entryDetections) detections.push(d);
  }
  return fromDetections(detections);
}

/**
 * Returns null when inspection itself fails (read failure, apply failure,
 * outside-root target). Returns an array (possibly empty) of detections for
 * a successfully reconstructed entry.
 */
function inspectPatchEntry(
  entry: PatchEntry,
  env: GuardEnv,
  classify: PathClassifier,
): readonly Detection[] | null {
  if (entry.kind === "delete") return [];
  if (entry.kind === "add") {
    const gate = gateOnClass(classify(entry.path));
    if (gate !== "continue") return gate.ok ? [] : null;
    const r = reconstructAddFile(entry);
    if (!r.ok) return null;
    return classifyContentConfig(
      r.content,
      entry.path,
      env.projection,
      env.detector_config,
    );
  }
  if (entry.kind === "update") {
    return inspectUpdateEntry(entry, env, classify);
  }
  return null;
}

function inspectUpdateEntry(
  entry: PatchEntry,
  env: GuardEnv,
  classify: PathClassifier,
): readonly Detection[] | null {
  if (entry.moveTo !== null) {
    return inspectMoveEntry(entry, env, classify);
  }
  const gate = gateOnClass(classify(entry.path));
  if (gate !== "continue") return gate.ok ? [] : null;
  const current = safeRead(env.readFile, entry.path);
  if (current === null) return null;
  if (entry.bodyLines.length === 0) return [];
  const r = reconstructUpdateFile(entry, current);
  if (!r.ok) return null;
  return classifyContentConfig(
    r.content,
    entry.path,
    env.projection,
    env.detector_config,
  );
}

/**
 * Inspect a Move (Update File with `*** Move to:`). When the patch carries
 * body lines, the destination content is the source content with the body
 * applied (rename + content edit). When the body is empty, the destination
 * content is the source content unchanged (pure rename). In both cases the
 * inspected content is classified at the destination path so a rename into
 * a distributed directory re-runs the detector.
 *
 * Outside-root destination (or source read failure / apply failure) returns
 * null so the orchestrator fail-closes.
 */
function inspectMoveEntry(
  entry: PatchEntry,
  env: GuardEnv,
  classify: PathClassifier,
): readonly Detection[] | null {
  if (entry.moveTo === null) return null;
  const destGate = gateOnClass(classify(entry.moveTo));
  if (destGate !== "continue") {
    if (destGate.ok) return [];
    return null;
  }
  const source = safeRead(env.readFile, entry.path);
  if (source === null) return null;
  let destinationContent: string;
  if (entry.bodyLines.length === 0) {
    destinationContent = source;
  } else {
    const r = reconstructUpdateFile(entry, source);
    if (!r.ok) return null;
    destinationContent = r.content;
  }
  return classifyContentConfig(
    destinationContent,
    entry.moveTo,
    env.projection,
    env.detector_config,
  );
}
