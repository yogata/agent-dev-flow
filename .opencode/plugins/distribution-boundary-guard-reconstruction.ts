// Full-file reconstruction for edit and apply_patch operations.
//
// Stage B regression (PR #2092): the pre-write gate must inspect the
// prospective full-file content (not just newString or `+` lines) so that
// violations formed by combining current content with additions are caught.
// For Update File, the patch is applied against the current file content;
// for Move File, the source content is inspected at the destination path.
// Any failure to read or apply results in a fail-closed outcome
// (DEC-014 decision 5).
//
// Pure except for the injected readFile callback: same input + same readFile
// output => same reconstruction.

import type { PatchEntry } from "./distribution-boundary-guard-parser.ts";

/**
 * File reader contract. Returns the file content as a string, or null if the
 * file cannot be read (missing, permission denied, etc.). Throw is permitted;
 * the orchestrator catches and fail-closes.
 */
export type FileReader = (path: string) => string | null;

export type ReconstructResult =
  | { ok: true; content: string }
  | { ok: false; reason: "read-failed" | "old-string-not-found" | "apply-failed" };

// ---------------------------------------------------------------------------
// Edit reconstruction
// ---------------------------------------------------------------------------

/**
 * Reconstruct the post-edit file content from current content + edit args.
 * Fail-closes when oldString is not found in currentContent.
 */
export function reconstructEdit(args: {
  currentContent: string;
  oldString: string;
  newString: string;
  replaceAll: boolean;
}): ReconstructResult {
  if (args.oldString.length === 0 && !args.replaceAll) {
    // Insert at start (edit tool contract: empty oldString inserts newString
    // at the beginning).
    return { ok: true, content: args.newString + args.currentContent };
  }
  if (args.replaceAll) {
    if (!args.currentContent.includes(args.oldString)) {
      return { ok: false, reason: "old-string-not-found" };
    }
    return {
      ok: true,
      content: args.currentContent.split(args.oldString).join(args.newString),
    };
  }
  const idx = args.currentContent.indexOf(args.oldString);
  if (idx < 0) {
    return { ok: false, reason: "old-string-not-found" };
  }
  return {
    ok: true,
    content:
      args.currentContent.slice(0, idx) +
      args.newString +
      args.currentContent.slice(idx + args.oldString.length),
  };
}

// ---------------------------------------------------------------------------
// apply_patch Add reconstruction
// ---------------------------------------------------------------------------

/**
 * Reconstruct the full content for an Add File entry. The body is the new
 * file content as `+`-prefixed lines.
 */
export function reconstructAddFile(entry: PatchEntry): ReconstructResult {
  const lines: string[] = [];
  for (const raw of entry.bodyLines) {
    if (raw.startsWith("+")) {
      lines.push(raw.slice(1));
    } else if (raw.startsWith("@@")) {
      // Context anchors are ignored for Add: body is full content.
      continue;
    } else {
      // Add body should only have `+` lines; anything else is malformed.
      return { ok: false, reason: "apply-failed" };
    }
  }
  return { ok: true, content: lines.join("\n") };
}

// ---------------------------------------------------------------------------
// apply_patch Update reconstruction
// ---------------------------------------------------------------------------

/**
 * Reconstruct the post-patch content for an Update File entry by applying
 * context/add/remove hunks against the current file content.
 *
 * The OpenCode apply_patch format uses these body-line prefixes:
 *   ` ` (single space) — context line (must match current content)
 *   `-`                — line removed from current content
 *   `+`                — line added to the result
 *   `@@ ...`           — hunk anchor (informational, not enforced here)
 *
 * The reconstruction is hunk-aware: for each hunk (delimited by `@@`), we
 * walk context+removed lines against the current content and emit context+
 * added lines to the result. If the current content does not match the
 * context+removed sequence, fail-closed.
 */
export function reconstructUpdateFile(
  entry: PatchEntry,
  currentContent: string,
): ReconstructResult {
  const currentLines = currentContent.split(/\r?\n/);
  const result: string[] = [];
  let cursor = 0;
  let i = 0;
  const body = entry.bodyLines;

  while (i < body.length) {
    const line = body[i] ?? "";
    if (line.startsWith("@@")) {
      i++;
      continue;
    }
    if (line.startsWith(" ")) {
      const expected = line.slice(1);
      const got = currentLines[cursor] ?? null;
      if (got !== expected) return { ok: false, reason: "apply-failed" };
      result.push(expected);
      cursor++;
      i++;
      continue;
    }
    if (line.startsWith("-")) {
      const expected = line.slice(1);
      const got = currentLines[cursor] ?? null;
      if (got !== expected) return { ok: false, reason: "apply-failed" };
      cursor++;
      i++;
      continue;
    }
    if (line.startsWith("+")) {
      result.push(line.slice(1));
      i++;
      continue;
    }
    return { ok: false, reason: "apply-failed" };
  }

  // Append any remaining current content beyond the last hunk.
  while (cursor < currentLines.length) {
    result.push(currentLines[cursor] ?? "");
    cursor++;
  }

  return { ok: true, content: result.join("\n") };
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
  const source = safeRead(readFile, entry.path);
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
  try {
    return readFile(path);
  } catch {
    return null;
  }
}
