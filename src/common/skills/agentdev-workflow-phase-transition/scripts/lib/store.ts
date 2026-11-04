/**
 * Transition record store: lookup and idempotent apply over the domain state
 * directory (.agentdev/phase/transitions/). Single-execution control: an apply
 * with an already-recorded key never writes a second record. Technical failures
 * throw; callers report them as failures, never as success.
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseTransitionRecord, type TransitionRecord } from "./schema.ts";

export type LookupResult =
  | { result: "absent" }
  | { result: "existing"; record: TransitionRecord; path: string }
  | { result: "error"; reason: string; path: string };

export type ApplyResult =
  | { result: "recorded"; record: TransitionRecord; path: string }
  | { result: "duplicate"; record: TransitionRecord; path: string };

function encodeFileName(key: string): string {
  return `${encodeURIComponent(key)}.json`;
}

/**
 * Only the record area's own absence counts as "absent". Any other failure to
 * read the record area (e.g. the path is a regular file, permission denied) is
 * unverifiable state and must be reported as "error", never as absence.
 */
function isRecordAreaAbsent(cause: unknown): boolean {
  return typeof cause === "object" && cause !== null && "code" in cause && (cause as { code?: unknown }).code === "ENOENT";
}

/**
 * Look up a transition record by idempotency key. Absent only when the record
 * area itself does not exist or holds no matching record. An unreadable record
 * area is reported as "error" (never as absence). A malformed record file is
 * reported as "error" (never treated as an existing record): the corrupted
 * state must be resolved before any transition can be recorded.
 */
export async function lookupRecord(dir: string, key: string): Promise<LookupResult> {
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch (cause) {
    if (isRecordAreaAbsent(cause)) {
      return { result: "absent" };
    }
    return { result: "error", reason: `record area is unreadable: ${String(cause)}`, path: dir };
  }
  const errors: Array<{ reason: string; path: string }> = [];
  for (const entry of entries.filter((e) => e.endsWith(".json")).sort()) {
    const path = join(dir, entry);
    let content: string;
    try {
      content = await readFile(path, "utf8");
    } catch (cause) {
      errors.push({ reason: `record file is unreadable: ${String(cause)}`, path });
      continue;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (cause) {
      errors.push({ reason: `record file is not valid JSON: ${String(cause)}`, path });
      continue;
    }
    const parseResult = parseTransitionRecord(parsed);
    if (!parseResult.ok) {
      errors.push({ reason: `record file violates the record schema: ${parseResult.reason}`, path });
      continue;
    }
    if (parseResult.record.key === key) {
      return { result: "existing", record: parseResult.record, path };
    }
  }
  if (errors.length > 0) {
    return { result: "error", reason: errors[0]?.reason ?? "unknown lookup error", path: errors[0]?.path ?? "" };
  }
  return { result: "absent" };
}

/**
 * Content match of a same-key re-run: only the transition's semantic fields
 * (scope, fromPhase, toPhase) are compared. recordedAt is recording-time
 * metadata and legitimately differs between re-runs of the same transition,
 * so it is never part of the match (a same-key request is treated as the
 * recorded transition's restoration only when the semantic fields agree).
 */
function isSameRecordedTransition(recorded: TransitionRecord, requested: TransitionRecord): boolean {
  return recorded.scope === requested.scope && recorded.fromPhase === requested.fromPhase && recorded.toPhase === requested.toPhase;
}

/**
 * Apply a transition record with single-execution control.
 * - Invalid input throws (fail-closed parse).
 * - Already-recorded key with matching scope/fromPhase/toPhase returns
 *   "duplicate" without writing a second record (restoration).
 * - Already-recorded key with a differing scope/fromPhase/toPhase is refused
 *   fail-closed: the recorded transition is neither restored as this request's
 *   result nor overwritten or replaced, and this request is not saved.
 * - An unverifiable or corrupted existing state throws instead of recording over it.
 * - Write failures propagate as thrown errors (never success).
 */
export async function applyRecord(dir: string, value: unknown): Promise<ApplyResult> {
  const parseResult = parseTransitionRecord(value);
  if (!parseResult.ok) {
    throw new Error(`transition record input is invalid: ${parseResult.reason}`);
  }
  const record = parseResult.record;
  const lookup = await lookupRecord(dir, record.key);
  if (lookup.result === "existing") {
    if (!isSameRecordedTransition(lookup.record, record)) {
      throw new Error(
        `same-key transition request differs from the recorded transition (scope/fromPhase/toPhase): the recorded transition is not restored, its record is not overwritten or replaced, and this request is not saved: ${lookup.path}`,
      );
    }
    return { result: "duplicate", record: lookup.record, path: lookup.path };
  }
  if (lookup.result === "error") {
    throw new Error(`existing transition state is corrupted and must be resolved before recording: ${lookup.reason}`);
  }
  const path = join(dir, encodeFileName(record.key));
  await mkdir(dir, { recursive: true });
  await writeFile(path, `${JSON.stringify(record, null, 2)}\n`, "utf8");
  return { result: "recorded", record, path };
}
