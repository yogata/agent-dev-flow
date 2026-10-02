// Typed argument parsing and apply_patch text parsing for the
// distribution-boundary-guard plugin.
//
// Stage B regression (PR #2092): the plugin must parse external args
// (Record<string, unknown>) into typed values without `as string`, without
// broad catch swallow, and without unsafe casts. apply_patch text parsing
// must produce a structured result that the reconstruction module can apply
// against the current file content. Malformed patches return a structured
// `malformed` result so the gate layer fail-closes (the distribution
// boundary DEC, decision 5).
//
// Pure: no fs/path/I/O imports; same input => same output.

// ---------------------------------------------------------------------------
// Argument parsing (from OpenCode tool.execute.before output.args)
// ---------------------------------------------------------------------------
//
// OpenCode 1.18.x tool schemas (verified against @opencode-ai/sdk):
//   write       -> { path: string,         content: string }
//   edit        -> { path: string,         oldString: string, newString: string, replaceAll?: boolean }
//   apply_patch -> { patchText: string }
//
// The `path` field is the file path the tool will write; it MAY be repo-
// relative or absolute (the harness passes whatever the caller supplied).
// Path classification (distributed / non-distributed / outside-root) is the
// evaluator's job; the parser only normalises arg shape into typed values.

export interface ParsedWrite {
  readonly filePath: string;
  readonly content: string;
}

export interface ParsedEdit {
  readonly filePath: string;
  readonly oldString: string;
  readonly newString: string;
  readonly replaceAll: boolean;
}

export interface ParsedApplyPatch {
  readonly patchText: string;
}

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function isBoolean(v: unknown): v is boolean {
  return typeof v === "boolean";
}

/**
 * Parse the `write` tool args. Returns null when `path` or `content` is
 * absent, non-string, or `path` is empty. Null is interpreted by the plugin
 * shell as inspection-error (fail closed per the distribution boundary
 * DEC, decision 5): a write
 * call we cannot classify must NOT pass silently.
 *
 * `filePath` is also accepted as a legacy alias so existing programmatic
 * callers (and tests) that constructed args before the OpenCode field name
 * was finalised keep working. At runtime, OpenCode emits `path`.
 */
export function parseWriteArgs(
  args: Record<string, unknown>,
): ParsedWrite | null {
  const filePath = args["path"] ?? args["filePath"];
  const content = args["content"];
  if (!isString(filePath) || !isString(content)) return null;
  if (filePath.length === 0) return null;
  return { filePath, content };
}

/**
 * Parse the `edit` tool args. Missing oldString/newString default to empty
 * string (the edit tool contract: empty oldString means insert at start).
 * replaceAll defaults to false. Returns null when `path` is absent, not a
 * string, or empty; the plugin shell fail-closes on null.
 */
export function parseEditArgs(
  args: Record<string, unknown>,
): ParsedEdit | null {
  const filePath = args["path"] ?? args["filePath"];
  if (!isString(filePath) || filePath.length === 0) return null;
  const oldString = args["oldString"];
  const newString = args["newString"];
  const replaceAll = args["replaceAll"];
  return {
    filePath,
    oldString: isString(oldString) ? oldString : "",
    newString: isString(newString) ? newString : "",
    replaceAll: isBoolean(replaceAll) ? replaceAll : false,
  };
}

/**
 * Parse the `apply_patch` tool args. Returns null when `patchText` is absent
 * or non-string.
 */
export function parseApplyPatchArgs(
  args: Record<string, unknown>,
): ParsedApplyPatch | null {
  const patchText = args["patchText"];
  if (!isString(patchText)) return null;
  return { patchText };
}

// ---------------------------------------------------------------------------
// apply_patch text parsing
// ---------------------------------------------------------------------------

export type PatchOpKind = "add" | "update" | "delete" | "move";

export interface PatchEntry {
  readonly kind: PatchOpKind;
  /** Source path for update/delete/move; destination for add. */
  readonly path: string;
  /** Destination path for move-only operations; null otherwise. */
  readonly moveTo: string | null;
  /**
   * Body lines for add/update (excluding the header and trailer markers).
   * Each line retains its single-char prefix (`+`, `-`, ` `) so the
   * reconstruction module can apply context/add/remove semantics.
   */
  readonly bodyLines: readonly string[];
}

export type ParsedPatch =
  | { kind: "ok"; entries: readonly PatchEntry[] }
  | { kind: "malformed"; reason: string };

const HEADER_RE = /^\*\*\* (Add|Update|Delete) File: (.+)$/;
const MOVE_RE = /^\*\*\* Move to: (.+)$/;
const BEGIN_RE = /^\*\*\* Begin Patch$/;
const END_RE = /^\*\*\* End Patch$/;

/**
 * Parse the OpenCode apply_patch text format. Recognized headers:
 *   *** Begin Patch / *** End Patch    — required wrappers
 *   *** Add File: <path>               — body is full new file content (+ lines)
 *   *** Update File: <path>            — body is context/+/- lines
 *   *** Move to: <new_path>            — under Update File: relocate the file
 *   *** Delete File: <path>            — no body
 *
 * Malformed inputs return a structured result so the gate layer fail-closes.
 */
export function parseApplyPatchText(patchText: string): ParsedPatch {
  if (!isString(patchText) || patchText.length === 0) {
    return { kind: "malformed", reason: "empty patch text" };
  }
  const lines = patchText.split(/\r?\n/);
  if (lines.length === 0) return { kind: "malformed", reason: "no lines" };

  let beginSeen = false;
  let endSeen = false;
  const entries: PatchEntry[] = [];
  let current: {
    kind: PatchOpKind;
    path: string;
    moveTo: string | null;
    bodyLines: string[];
  } | null = null;

  const flushCurrent = (): void => {
    if (current === null) return;
    entries.push({
      kind: current.kind,
      path: current.path,
      moveTo: current.moveTo,
      bodyLines: current.bodyLines,
    });
    current = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (BEGIN_RE.test(line)) {
      beginSeen = true;
      continue;
    }
    if (END_RE.test(line)) {
      endSeen = true;
      flushCurrent();
      continue;
    }
    const headerMatch = line.match(HEADER_RE);
    if (headerMatch) {
      const op = headerMatch[1];
      const path = (headerMatch[2] ?? "").trim();
      if (path.length === 0) {
        return { kind: "malformed", reason: `missing path at line ${i + 1}` };
      }
      flushCurrent();
      if (op === "Add") current = { kind: "add", path, moveTo: null, bodyLines: [] };
      else if (op === "Update") current = { kind: "update", path, moveTo: null, bodyLines: [] };
      else if (op === "Delete") current = { kind: "delete", path, moveTo: null, bodyLines: [] };
      continue;
    }
    const moveMatch = line.match(MOVE_RE);
    if (moveMatch) {
      const dest = (moveMatch[1] ?? "").trim();
      if (dest.length === 0) {
        return { kind: "malformed", reason: `missing move destination at line ${i + 1}` };
      }
      if (current === null || current.kind !== "update") {
        return {
          kind: "malformed",
          reason: `Move to: outside Update File context at line ${i + 1}`,
        };
      }
      current.moveTo = dest;
      continue;
    }
    if (line.startsWith("@@")) {
      // Context anchor — kept in body so reconstruction can preserve ordering.
      if (current !== null) current.bodyLines.push(line);
      continue;
    }
    if (
      line.startsWith("+") ||
      line.startsWith("-") ||
      line.startsWith(" ")
    ) {
      if (current !== null) current.bodyLines.push(line);
      continue;
    }
    // Unknown line — malformed.
    return {
      kind: "malformed",
      reason: `unrecognized patch line ${i + 1}: ${line.slice(0, 60)}`,
    };
  }

  if (!beginSeen || !endSeen) {
    return {
      kind: "malformed",
      reason: beginSeen ? "missing *** End Patch marker" : "missing *** Begin Patch marker",
    };
  }
  if (entries.length === 0) {
    return { kind: "malformed", reason: "no operation entries" };
  }
  return { kind: "ok", entries };
}

/**
 * Extract added-line content from an Add or Update patch entry body.
 * Returns the array of added text (prefix-stripped) with synthetic line
 * numbers starting at 1. Used by the Add path where the full content is
 * the new file.
 */
export function extractAddedContent(entry: PatchEntry): string[] {
  const out: string[] = [];
  for (const raw of entry.bodyLines) {
    if (raw.startsWith("+")) {
      out.push(raw.slice(1));
    }
  }
  return out;
}
