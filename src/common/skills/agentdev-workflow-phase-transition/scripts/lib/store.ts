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
 * Look up a transition record by idempotency key. Absent when the directory does
 * not exist or holds no matching record. A malformed record file is reported as
 * "error" (never treated as an existing record): the corrupted state must be
 * resolved before any transition can be recorded.
 */
export async function lookupRecord(dir: string, key: string): Promise<LookupResult> {
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return { result: "absent" };
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
 * Apply a transition record with single-execution control.
 * - Invalid input throws (fail-closed parse).
 * - Already-recorded key returns "duplicate" without writing a second record.
 * - A corrupted existing state throws instead of recording over it.
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
