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
//
// The edit-semantics parsing/reconstruction itself is owned by the shared
// guard-common part (lib/edit-semantics.ts of the agentdev-textlint-guard
// package; Design "共有 detector と adapter の契約" section, B3-5a). This
// module keeps the plugin-facing types and the guard-specific rejection
// conditions: unrecognized patch lines are inspection errors (malformed)
// for this guard, and missing/typed-unsupported args are null (fail closed).

import {
  extractAddedLines,
  parseApplyPatchToolArgs,
  parseEditToolArgs,
  parsePatch,
  parseWriteToolArgs,
  type UnknownPatchLine,
} from "../../../opencode/plugins/agentdev-textlint-guard/lib/edit-semantics.ts";

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
  const parsed = parseWriteToolArgs(args);
  if (parsed.filePath === undefined || parsed.content === undefined) return null;
  return { filePath: parsed.filePath, content: parsed.content };
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
  const parsed = parseEditToolArgs(args);
  if (parsed.filePath === undefined) return null;
  return {
    filePath: parsed.filePath,
    oldString: parsed.oldString ?? "",
    newString: parsed.newString ?? "",
    replaceAll: parsed.replaceAll ?? false,
  };
}

/**
 * Parse the `apply_patch` tool args. Returns null when `patchText` is absent
 * or non-string.
 */
export function parseApplyPatchArgs(
  args: Record<string, unknown>,
): ParsedApplyPatch | null {
  const parsed = parseApplyPatchToolArgs(args);
  if (parsed.patchText === undefined) return null;
  return { patchText: parsed.patchText };
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

/**
 * Parse the OpenCode apply_patch text format. Recognized headers:
 *   *** Begin Patch / *** End Patch    — required wrappers
 *   *** Add File: <path>               — body is full new file content (+ lines)
 *   *** Update File: <path>            — body is context/+/- lines
 *   *** Move to: <new_path>            — under Update File: relocate the file
 *   *** Delete File: <path>            — no body
 *
 * Malformed inputs return a structured result so the gate layer fail-closes.
 * Unrecognized (bare) lines are this guard's inspection errors, unlike the
 * textlint guard which skips them.
 */
export function parseApplyPatchText(patchText: string): ParsedPatch {
  const outcome = parsePatch(patchText);
  if (!outcome.ok) return { kind: "malformed", reason: outcome.reason };
  const firstUnknown: UnknownPatchLine | undefined = outcome.patch.unknownLines[0];
  if (firstUnknown !== undefined) {
    return {
      kind: "malformed",
      reason: `unrecognized patch line ${firstUnknown.line}: ${firstUnknown.text.slice(0, 60)}`,
    };
  }
  const entries: PatchEntry[] = outcome.patch.entries.map((entry) => ({
    kind: entry.kind,
    path: entry.path,
    moveTo: entry.moveTo,
    bodyLines: entry.bodyLines,
  }));
  return { kind: "ok", entries };
}

/**
 * Extract added-line content from an Add or Update patch entry body.
 * Returns the array of added text (prefix-stripped) with synthetic line
 * numbers starting at 1. Used by the Add path where the full content is
 * the new file.
 */
export function extractAddedContent(entry: PatchEntry): string[] {
  return extractAddedLines(entry.bodyLines);
}
