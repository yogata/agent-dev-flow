// ADF-COVERS(implementation): REQ-053-025, REQ-053-026, REQ-053-027
// agentdev-textlint-guard 共通実行基盤: 完成予定全文のメモリ上再構成。
//
// OpenCode 1.18.x の write / edit / apply_patch 入力形式（現行 API で固定）から、
// ディスクへ反映される予定の全文をメモリ上で再構成する。書込み後に戻す方式を
// とらないため、再構成は検査の前提である。
//
// - write  : file_path + content（新規作成と更新の両方で content が全文）
// - edit   : 現行ディスク内容に old_string → new_string 置換を適用した全文
//            （改行正規化は現行 tool と同じ意味論: 入力を LF 正規化し、
//             ファイルの改行を検出して再適用する。置換は完全一致のみで
//             一意（replaceAll 時は全置換）を要求し、曖昧な入力は再構成不能とする）
// - apply_patch: V4A パッチ（*** Begin Patch / End Patch、Add / Update / Delete / Move to、
//            @@ コンテキスト付きチャンク）を解析し、全対象ファイルの完成予定全文を組む
//
// tool 入力不正、必要ファイルの読込失敗、再構成不能はエラーを返し、呼出側は
// tool 全体を拒否する（fail-closed）。曖昧な入力を推測で通過させない。
//
// 適用結果の意味論は OpenCode v1.18.29 の tool 実装（write.ts / edit.ts /
// apply_patch.ts / patch/index.ts、MIT license）に合わせている。

import * as fs from "node:fs";
import * as path from "node:path";

export type ToolName = "write" | "edit" | "apply_patch";

/** 再構成された1ファイルの完成予定内容。 */
export interface PlannedWrite {
  /** 絶対パス（OpenCode の各 tool が絶対パス化した後の値）。 */
  readonly absolutePath: string;
  readonly content: string;
  readonly kind: "create" | "update" | "delete";
  /** move 先（apply_patch の *** Move to）。 */
  readonly movePath?: string;
}

export type ReconstructionResult =
  | { readonly ok: true; readonly writes: readonly PlannedWrite[] }
  | { readonly ok: false; readonly detail: string };

/** OpenCode の write 引数（content / filePath）。 */
export interface WriteArgs {
  readonly content?: unknown;
  readonly filePath?: unknown;
}

/** OpenCode の edit 引数（filePath / oldString / newString / replaceAll）。 */
export interface EditArgs {
  readonly filePath?: unknown;
  readonly oldString?: unknown;
  readonly newString?: unknown;
  readonly replaceAll?: unknown;
}

/** OpenCode の apply_patch 引数（patchText）。 */
export interface ApplyPatchArgs {
  readonly patchText?: unknown;
}

function readCurrentFile(absolutePath: string): string | null {
  try {
    return fs.readFileSync(absolutePath, "utf8");
  } catch {
    return null;
  }
}

/** write の再構成。content がそのまま完成予定全文（新規・更新同一形状）。 */
export function reconstructWrite(args: WriteArgs): ReconstructionResult {
  if (typeof args.filePath !== "string" || args.filePath.length === 0) {
    return { ok: false, detail: "write: filePath argument is missing or not a string" };
  }
  if (typeof args.content !== "string") {
    return { ok: false, detail: "write: content argument is missing or not a string" };
  }
  const absolutePath = path.resolve(args.filePath);
  const exists = fs.existsSync(absolutePath);
  return {
    ok: true,
    writes: [{ absolutePath, content: args.content, kind: exists ? "update" : "create" }],
  };
}

/** edit の再構成。oldString が空の新規作成形式も現行 tool と同じく扱う。 */
export function reconstructEdit(args: EditArgs): ReconstructionResult {
  if (typeof args.filePath !== "string" || args.filePath.length === 0) {
    return { ok: false, detail: "edit: filePath argument is missing or not a string" };
  }
  if (typeof args.oldString !== "string" || typeof args.newString !== "string") {
    return { ok: false, detail: "edit: oldString / newString arguments must be strings" };
  }
  if (args.replaceAll !== undefined && typeof args.replaceAll !== "boolean") {
    return { ok: false, detail: "edit: replaceAll argument must be a boolean" };
  }
  if (args.oldString === args.newString) {
    return { ok: false, detail: "edit: oldString and newString are identical (the tool rejects it too)" };
  }
  const absolutePath = path.resolve(args.filePath);
  const replaceAll = args.replaceAll === true;

  if (args.oldString === "") {
    const existed = fs.existsSync(absolutePath);
    if (existed) {
      return { ok: false, detail: "edit: oldString cannot be empty when editing an existing file" };
    }
    return { ok: true, writes: [{ absolutePath, content: args.newString, kind: "create" }] };
  }

  const current = readCurrentFile(absolutePath);
  if (current === null) {
    return { ok: false, detail: `edit: cannot read the current file content of ${absolutePath}` };
  }
  const ending = current.includes("\r\n") ? "\r\n" : "\n";
  const oldString = normalizeLineEndings(args.oldString, ending);
  const newString = normalizeLineEndings(args.newString, ending);
  const first = current.indexOf(oldString);
  if (first === -1) {
    return {
      ok: false,
      detail: `edit: cannot reconstruct the planned content of ${absolutePath}: oldString is not found verbatim (fuzzy matching is not reconstructed; re-read the file and provide the exact oldString)`,
    };
  }
  if (!replaceAll) {
    const last = current.lastIndexOf(oldString);
    if (first !== last) {
      return {
        ok: false,
        detail: `edit: cannot reconstruct the planned content of ${absolutePath}: oldString matches multiple locations (provide more surrounding context or set replaceAll)`,
      };
    }
    const content = current.slice(0, first) + newString + current.slice(first + oldString.length);
    return { ok: true, writes: [{ absolutePath, content, kind: "update" }] };
  }
  return {
    ok: true,
    writes: [{ absolutePath, content: current.split(oldString).join(newString), kind: "update" }],
  };
}

function normalizeLineEndings(text: string, ending: "\n" | "\r\n"): string {
  const lf = text.replaceAll("\r\n", "\n");
  if (ending === "\n") return lf;
  return lf.replaceAll("\n", "\r\n");
}

// ---------------------------------------------------------------------------
// V4A patch（OpenCode apply_patch 形式）
// ---------------------------------------------------------------------------

export type PatchHunk =
  | { readonly type: "add"; readonly path: string; readonly contents: string }
  | { readonly type: "delete"; readonly path: string }
  | { readonly type: "update"; readonly path: string; readonly movePath?: string; readonly chunks: readonly UpdateChunk[] };

export interface UpdateChunk {
  readonly oldLines: readonly string[];
  readonly newLines: readonly string[];
  readonly changeContext?: string;
  readonly isEndOfFile?: boolean;
}

/** V4A パッチの解析（現行 tool と同じ形式判定）。解析不能はエラー。 */
export function parsePatchText(patchText: string): PatchHunk[] {
  const cleaned = stripHeredoc(patchText.trim());
  const lines = cleaned.split("\n");
  const beginIdx = lines.findIndex((line) => line.trim() === "*** Begin Patch");
  const endIdx = lines.findIndex((line) => line.trim() === "*** End Patch");
  if (beginIdx === -1 || endIdx === -1 || beginIdx >= endIdx) {
    throw new Error("invalid patch format: missing Begin/End markers");
  }
  const hunks: PatchHunk[] = [];
  let i = beginIdx + 1;
  while (i < endIdx) {
    const line = lines[i] ?? "";
    if (line.startsWith("*** Add File:")) {
      const filePath = line.slice("*** Add File:".length).trim();
      if (filePath === "") throw new Error("invalid patch: empty Add File path");
      const { content, next } = parseAddContent(lines, i + 1, endIdx);
      hunks.push({ type: "add", path: filePath, contents: content });
      i = next;
      continue;
    }
    if (line.startsWith("*** Delete File:")) {
      const filePath = line.slice("*** Delete File:".length).trim();
      if (filePath === "") throw new Error("invalid patch: empty Delete File path");
      hunks.push({ type: "delete", path: filePath });
      i += 1;
      continue;
    }
    if (line.startsWith("*** Update File:")) {
      const filePath = line.slice("*** Update File:".length).trim();
      if (filePath === "") throw new Error("invalid patch: empty Update File path");
      let movePath: string | undefined;
      let next = i + 1;
      const following = lines[next];
      if (following !== undefined && following.startsWith("*** Move to:")) {
        movePath = following.slice("*** Move to:".length).trim();
        if (movePath === "") throw new Error("invalid patch: empty Move to path");
        next += 1;
      }
      const { chunks, next: afterChunks } = parseUpdateChunks(lines, next, endIdx);
      hunks.push(
        movePath !== undefined
          ? { type: "update", path: filePath, movePath, chunks }
          : { type: "update", path: filePath, chunks },
      );
      i = afterChunks;
      continue;
    }
    i += 1;
  }
  if (hunks.length === 0) throw new Error("invalid patch: no hunks found");
  return hunks;
}

function stripHeredoc(input: string): string {
  const m = input.match(/^(?:cat\s+)?<<['"]?(\w+)['"]?\s*\n([\s\S]*?)\n\1\s*$/);
  return m !== null ? (m[2] ?? input) : input;
}

function parseAddContent(lines: readonly string[], start: number, end: number): { content: string; next: number } {
  let content = "";
  let i = start;
  while (i < end && !(lines[i] ?? "").startsWith("***")) {
    const line = lines[i] ?? "";
    if (line.startsWith("+")) content += `${line.slice(1)}\n`;
    i += 1;
  }
  if (content.endsWith("\n")) content = content.slice(0, -1);
  return { content, next: i };
}

function parseUpdateChunks(lines: readonly string[], start: number, end: number): { chunks: UpdateChunk[]; next: number } {
  const chunks: UpdateChunk[] = [];
  let i = start;
  while (i < end && !(lines[i] ?? "").startsWith("***")) {
    const line = lines[i] ?? "";
    if (line.startsWith("@@")) {
      const changeContext = line.substring(2).trim();
      i += 1;
      const oldLines: string[] = [];
      const newLines: string[] = [];
      let isEndOfFile = false;
      while (i < end) {
        const changeLine = lines[i] ?? "";
        if (changeLine === "*** End of File") {
          isEndOfFile = true;
          i += 1;
          break;
        }
        if (changeLine.startsWith("@@") || changeLine.startsWith("***")) break;
        if (changeLine.startsWith(" ")) {
          oldLines.push(changeLine.substring(1));
          newLines.push(changeLine.substring(1));
        } else if (changeLine.startsWith("-")) {
          oldLines.push(changeLine.substring(1));
        } else if (changeLine.startsWith("+")) {
          newLines.push(changeLine.substring(1));
        }
        i += 1;
      }
      chunks.push({
        oldLines,
        newLines,
        ...(changeContext !== "" ? { changeContext } : {}),
        ...(isEndOfFile ? { isEndOfFile: true } : {}),
      });
      continue;
    }
    i += 1;
  }
  return { chunks, next: i };
}

/** update チャンクの適用（現行 tool と同じ一致パス: 完全一致 → 末尾空白無視 → trim）。 */
export function applyUpdateChunks(originalText: string, chunks: readonly UpdateChunk[], filePath: string): string {
  let originalLines = originalText.split("\n");
  if (originalLines.length > 0 && originalLines[originalLines.length - 1] === "") {
    originalLines = originalLines.slice(0, -1);
  }
  const replacements: Array<[number, number, string[]]> = [];
  let lineIndex = 0;
  for (const chunk of chunks) {
    if (chunk.changeContext !== undefined) {
      const contextIdx = seekSequence(originalLines, [chunk.changeContext], lineIndex, false, filePath);
      if (contextIdx === -1) {
        throw new Error(`failed to find context '${chunk.changeContext}' in ${filePath}`);
      }
      lineIndex = contextIdx + 1;
    }
    if (chunk.oldLines.length === 0) {
      const insertionIdx =
        originalLines.length > 0 && originalLines[originalLines.length - 1] === ""
          ? originalLines.length - 1
          : originalLines.length;
      replacements.push([insertionIdx, 0, [...chunk.newLines]]);
      continue;
    }
    let pattern = [...chunk.oldLines];
    let newSlice = [...chunk.newLines];
    let found = seekSequence(originalLines, pattern, lineIndex, chunk.isEndOfFile === true, filePath);
    if (found === -1 && pattern.length > 0 && pattern[pattern.length - 1] === "") {
      pattern = pattern.slice(0, -1);
      if (newSlice.length > 0 && newSlice[newSlice.length - 1] === "") {
        newSlice = newSlice.slice(0, -1);
      }
      found = seekSequence(originalLines, pattern, lineIndex, chunk.isEndOfFile === true, filePath);
    }
    if (found === -1) {
      throw new Error(`failed to find expected lines in ${filePath}:\n${chunk.oldLines.join("\n")}`);
    }
    replacements.push([found, pattern.length, newSlice]);
    lineIndex = found + pattern.length;
  }
  replacements.sort((a, b) => a[0] - b[0]);
  const result = [...originalLines];
  for (let i = replacements.length - 1; i >= 0; i--) {
    const [startIdx, oldLen, newSegment] = replacements[i] as [number, number, string[]];
    result.splice(startIdx, oldLen);
    result.splice(startIdx, 0, ...newSegment);
  }
  if (result.length === 0 || result[result.length - 1] !== "") {
    result.push("");
  }
  return result.join("\n");
}

function seekSequence(lines: readonly string[], pattern: readonly string[], startIndex: number, eof: boolean, filePath: string): number {
  if (pattern.length === 0) return -1;
  const passes: Array<(a: string, b: string) => boolean> = [
    (a, b) => a === b,
    (a, b) => a.trimEnd() === b.trimEnd(),
    (a, b) => a.trim() === b.trim(),
  ];
  for (const compare of passes) {
    const hit = tryMatch(lines, pattern, startIndex, compare, eof);
    if (hit !== -1) return hit;
  }
  throw new Error(`failed to find expected lines in ${filePath} (unicode-normalized matching is not reconstructed):\n${pattern.join("\n")}`);
}

function tryMatch(lines: readonly string[], pattern: readonly string[], startIndex: number, compare: (a: string, b: string) => boolean, eof: boolean): number {
  if (eof) {
    const fromEnd = lines.length - pattern.length;
    if (fromEnd >= startIndex && matchesAt(lines, fromEnd, pattern, compare)) return fromEnd;
  }
  for (let i = startIndex; i <= lines.length - pattern.length; i++) {
    if (matchesAt(lines, i, pattern, compare)) return i;
  }
  return -1;
}

function matchesAt(lines: readonly string[], start: number, pattern: readonly string[], compare: (a: string, b: string) => boolean): boolean {
  for (let j = 0; j < pattern.length; j++) {
    if (!compare(lines[start + j] ?? "", pattern[j] ?? "")) return false;
  }
  return true;
}

/** apply_patch の再構成。全対象ファイルの完成予定内容（存在するもの）を返す。 */
export function reconstructApplyPatch(args: ApplyPatchArgs, projectRoot: string): ReconstructionResult {
  if (typeof args.patchText !== "string" || args.patchText.length === 0) {
    return { ok: false, detail: "apply_patch: patchText argument is missing or not a string" };
  }
  let hunks: PatchHunk[];
  try {
    hunks = parsePatchText(args.patchText);
  } catch (e) {
    return { ok: false, detail: `apply_patch: patch parse failed (${e instanceof Error ? e.message : String(e)})` };
  }
  const writes: PlannedWrite[] = [];
  for (const hunk of hunks) {
    const absolutePath = path.resolve(projectRoot, hunk.path);
    if (hunk.type === "add") {
      writes.push({ absolutePath, content: hunk.contents, kind: "create" });
      continue;
    }
    if (hunk.type === "delete") {
      const current = readCurrentFile(absolutePath);
      if (current === null) {
        return { ok: false, detail: `apply_patch: cannot read the file to delete: ${absolutePath}` };
      }
      writes.push({ absolutePath, content: "", kind: "delete" });
      continue;
    }
    const current = readCurrentFile(absolutePath);
    if (current === null) {
      return { ok: false, detail: `apply_patch: cannot read the file to update: ${absolutePath}` };
    }
    let content: string;
    try {
      content = applyUpdateChunks(current, hunk.chunks, absolutePath);
    } catch (e) {
      return { ok: false, detail: `apply_patch: ${e instanceof Error ? e.message : String(e)}` };
    }
    writes.push({
      absolutePath,
      content,
      kind: "update",
      ...(hunk.movePath !== undefined ? { movePath: path.resolve(projectRoot, hunk.movePath) } : {}),
    });
  }
  return { ok: true, writes };
}
