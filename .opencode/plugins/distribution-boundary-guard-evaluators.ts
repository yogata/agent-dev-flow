// Pre-write evaluation functions for the distribution boundary guard.
//
// Each evaluate* function takes the parsed tool args plus a GuardEnv and
// returns a GuardDetectionsResult. The orchestrator (distribution-boundary-guard.ts)
// uses these to decide whether to throw and block the write.
//
// Pure except for the injected GuardEnv.readFile: same input + same readFile
// output => same evaluation result. Inspection failures (read failure,
// malformed patch input, unclassified entry) fail closed per DEC-014 decision 5.

import {
  classifyContentConfig,
  decideGate,
  type Detection,
} from "../skills/repo-agentdev-integrity/scripts/lib/distribution-boundary.ts";
import {
  parseApplyPatchText,
  type ParsedApplyPatch,
  type ParsedEdit,
  type PatchEntry,
} from "./distribution-boundary-guard-parser.ts";
import {
  reconstructAddFile,
  reconstructEdit,
  reconstructUpdateFile,
  resolveMoveSource,
  safeRead,
} from "./distribution-boundary-guard-reconstruction.ts";
import type { GuardEnv } from "./distribution-boundary-guard.ts";

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

// ---------------------------------------------------------------------------
// evaluateWriteContent
// ---------------------------------------------------------------------------

export function evaluateWriteContentEnv(
  filePath: string,
  content: string,
  env: GuardEnv,
  isDistributed: (p: string) => boolean,
): GuardDetectionsResult {
  if (!isDistributed(filePath)) return emptyOk();
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
  isDistributed: (p: string) => boolean,
  currentContentOverride?: string,
): GuardDetectionsResult {
  if (!isDistributed(args.filePath)) return emptyOk();
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
  isDistributed: (p: string) => boolean,
): GuardDetectionsResult {
  const parsed = parseApplyPatchText(args.patchText);
  if (parsed.kind === "malformed") return inspectionError();

  const detections: Detection[] = [];
  for (const entry of parsed.entries) {
    const entryDetections = inspectPatchEntry(entry, env, isDistributed);
    if (entryDetections === null) return inspectionError();
    for (const d of entryDetections) detections.push(d);
  }
  return fromDetections(detections);
}

/**
 * Returns null when inspection itself fails (read failure, apply failure).
 * Returns an array (possibly empty) of detections for a successfully
 * reconstructed entry.
 */
function inspectPatchEntry(
  entry: PatchEntry,
  env: GuardEnv,
  isDistributed: (p: string) => boolean,
): readonly Detection[] | null {
  if (entry.kind === "delete") return [];
  if (entry.kind === "add") {
    if (!isDistributed(entry.path)) return [];
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
    return inspectUpdateEntry(entry, env, isDistributed);
  }
  return null;
}

function inspectUpdateEntry(
  entry: PatchEntry,
  env: GuardEnv,
  isDistributed: (p: string) => boolean,
): readonly Detection[] | null {
  if (entry.moveTo !== null) {
    const move = resolveMoveSource(entry, env.readFile);
    if (!move.ok) return null;
    if (!isDistributed(move.destinationPath)) return [];
    return classifyContentConfig(
      move.sourceContent,
      move.destinationPath,
      env.projection,
      env.detector_config,
    );
  }
  if (!isDistributed(entry.path)) return [];
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
