// Full-file reconstruction for edit and apply_patch operations.
//
// Stage B regression (PR #2092): the pre-write gate must inspect the
// prospective full-file content (not just newString or `+` lines) so that
// violations formed by combining current content with additions are caught.
// For Update File, the patch is applied against the current file content;
// for Move File, the source content is inspected at the destination path.
// Any failure to read or apply results in a fail-closed outcome
// (the distribution boundary DEC, decision 5).
//
// Pure except for the injected readFile callback: same input + same readFile
// output => same reconstruction.
//
// The reconstruction mechanics (edit substitution, chunk application) are
// owned by the shared guard-common part (lib/edit-semantics.ts of the
// agentdev-textlint-guard package; Design "共有 detector と adapter の契約"
// section, B3-5a). This module keeps the plugin-facing result shapes and the
// guard-specific fail-closed normalization (every reconstruction failure is
// a ReconstructResult failure, never a silent clean).

import {
  applyEditToContent,
  applyUpdateChunks,
  joinAddContent,
  splitUpdateChunks,
  safeReadFile,
  type FileReader,
} from "../../../opencode/plugins/agentdev-textlint-guard/lib/edit-semantics.ts";
import type { PatchEntry } from "./distribution-boundary-guard-parser.ts";

export type { FileReader } from "../../../opencode/plugins/agentdev-textlint-guard/lib/edit-semantics.ts";

export type ReconstructResult =
  | { ok: true; content: string }
  | { ok: false; reason: "read-failed" | "old-string-not-found" | "apply-failed" };

// ---------------------------------------------------------------------------
// Edit reconstruction
// ---------------------------------------------------------------------------

/**
 * Reconstruct the post-edit file content from current content + edit args.
 * Fail-closes when oldString is not found in currentContent (or when the
 * combination cannot be applied at all, e.g. empty oldString with replaceAll).
 */
export function reconstructEdit(args: {
  currentContent: string;
  oldString: string;
  newString: string;
  replaceAll: boolean;
}): ReconstructResult {
  const applied = applyEditToContent(args.currentContent, args.oldString, args.newString, args.replaceAll);
  if (!applied.ok) return { ok: false, reason: "old-string-not-found" };
  return { ok: true, content: applied.result.content };
}

// ---------------------------------------------------------------------------
// apply_patch Add reconstruction
// ---------------------------------------------------------------------------

/**
 * Reconstruct the full content for an Add File entry. The body is the new
 * file content as `+`-prefixed lines. A non-`+`, non-anchor body line is
 * this guard's malformed-input signal (fail closed).
 */
export function reconstructAddFile(entry: PatchEntry): ReconstructResult {
  for (const raw of entry.bodyLines) {
    if (raw.startsWith("+") || raw.startsWith("@@")) continue;
    return { ok: false, reason: "apply-failed" };
  }
  return { ok: true, content: joinAddContent(entry.bodyLines) };
}

// ---------------------------------------------------------------------------
// apply_patch Update reconstruction
// ---------------------------------------------------------------------------

/**
 * Reconstruct the post-patch content for an Update File entry by applying
 * the parsed chunks against the current file content (exact match first,
 * then trailing-whitespace-insensitive, then trimmed — the OpenCode tool's
 * matching passes). Any apply failure fail-closes.
 *
 * The `@@` hunk anchors stay informational for this guard (not enforced):
 * the chunks are applied without the context-anchor seek so existing
 * classifications are preserved.
 */
export function reconstructUpdateFile(
  entry: PatchEntry,
  currentContent: string,
): ReconstructResult {
  const chunks = splitUpdateChunks(entry.bodyLines).map((chunk) => ({
    oldLines: chunk.oldLines,
    newLines: chunk.newLines,
    ...(chunk.isEndOfFile === true ? { isEndOfFile: true } : {}),
  }));
  try {
    return { ok: true, content: applyUpdateChunks(currentContent, chunks, entry.path) };
  } catch {
    return { ok: false, reason: "apply-failed" };
  }
}

// ---------------------------------------------------------------------------
// apply_patch Move reconstruction
// ---------------------------------------------------------------------------

/**
 * Resolve the destination path and source content for a Move File operation.
 * The source content is the file's current bytes; the destination is the new
 * path under which the content will land. Returns the destination path and
 * the (unchanged) source content so the orchestrator can classify it at the
 * destination distributed path.
 */
export function resolveMoveSource(
  entry: PatchEntry,
  readFile: FileReader,
): { ok: true; destinationPath: string; sourceContent: string } | { ok: false; reason: "read-failed" | "not-a-move" } {
  if (entry.kind !== "update" || entry.moveTo === null) {
    return { ok: false, reason: "not-a-move" };
  }
  const source = safeReadFile(readFile, entry.path);
  if (source === null) return { ok: false, reason: "read-failed" };
  return {
    ok: true,
    destinationPath: entry.moveTo,
    sourceContent: source,
  };
}

// ---------------------------------------------------------------------------
// Safe read helper
// ---------------------------------------------------------------------------

/**
 * Read a file via the injected reader. Returns null if the reader returns
 * null OR throws. The throw path is fail-closed — we never silently treat
 * a thrown read as "no violations".
 */
export function safeRead(readFile: FileReader, path: string): string | null {
  return safeReadFile(readFile, path);
}
