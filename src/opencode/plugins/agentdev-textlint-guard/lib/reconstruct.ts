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
// 編集意味論の解析・再構成（引数解析、edit 置換適用、V4A パッチ解析・チャンク適用）は
// ガード間共通部 lib/edit-semantics.ts で1箇所管理する
// （Design「共有 detector と adapter の契約」節、B3-5a）。本モジュールは
// fs 読込と textlint guard 固有の拒否条件（引数不正・一意性要求・現行 tool 挙動の再現）を
// 所有し、解析・再構成の本体は共通部へ委譲する。文言と検証順序は現行どおり維持する。
//
// tool 入力不正、必要ファイルの読込失敗、再構成不能はエラーを返し、呼出側は
// tool 全体を拒否する（fail-closed）。曖昧な入力を推測で通過させない。
//
// 適用結果の意味論は OpenCode v1.18.29 の tool 実装（write.ts / edit.ts /
// apply_patch.ts / patch/index.ts、MIT license）に合わせている。

import * as fs from "node:fs";
import * as path from "node:path";
import {
  applyEditToContent,
  applyUpdateChunks,
  hasArg,
  parseApplyPatchToolArgs,
  parseEditToolArgs,
  parsePatch,
  parseWriteToolArgs,
  type UpdateChunk,
} from "./edit-semantics.ts";

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

/** OpenCode の write 引数（content / filePath）。共通部の型解析へそのまま渡す。 */
export interface WriteArgs {
  readonly content?: unknown;
  readonly filePath?: unknown;
  readonly [key: string]: unknown;
}

/** OpenCode の edit 引数（filePath / oldString / newString / replaceAll）。 */
export interface EditArgs {
  readonly filePath?: unknown;
  readonly oldString?: unknown;
  readonly newString?: unknown;
  readonly replaceAll?: unknown;
  readonly [key: string]: unknown;
}

/** OpenCode の apply_patch 引数（patchText）。 */
export interface ApplyPatchArgs {
  readonly patchText?: unknown;
  readonly [key: string]: unknown;
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
  const parsed = parseWriteToolArgs(args);
  if (parsed.filePath === undefined) {
    return { ok: false, detail: "write: filePath argument is missing or not a string" };
  }
  if (parsed.content === undefined) {
    return { ok: false, detail: "write: content argument is missing or not a string" };
  }
  const absolutePath = path.resolve(parsed.filePath);
  const exists = fs.existsSync(absolutePath);
  return {
    ok: true,
    writes: [{ absolutePath, content: parsed.content, kind: exists ? "update" : "create" }],
  };
}

/** edit の再構成。oldString が空の新規作成形式も現行 tool と同じく扱う。 */
export function reconstructEdit(args: EditArgs): ReconstructionResult {
  const parsed = parseEditToolArgs(args);
  if (parsed.filePath === undefined) {
    return { ok: false, detail: "edit: filePath argument is missing or not a string" };
  }
  if (parsed.oldString === undefined || parsed.newString === undefined) {
    return { ok: false, detail: "edit: oldString / newString arguments must be strings" };
  }
  if (parsed.replaceAll === undefined && hasArg(args, "replaceAll")) {
    return { ok: false, detail: "edit: replaceAll argument must be a boolean" };
  }
  if (parsed.oldString === parsed.newString) {
    return { ok: false, detail: "edit: oldString and newString are identical (the tool rejects it too)" };
  }
  const absolutePath = path.resolve(parsed.filePath);
  const replaceAll = parsed.replaceAll === true;

  if (parsed.oldString === "") {
    const existed = fs.existsSync(absolutePath);
    if (existed) {
      return { ok: false, detail: "edit: oldString cannot be empty when editing an existing file" };
    }
    return { ok: true, writes: [{ absolutePath, content: parsed.newString, kind: "create" }] };
  }

  const current = readCurrentFile(absolutePath);
  if (current === null) {
    return { ok: false, detail: `edit: cannot read the current file content of ${absolutePath}` };
  }
  const applied = applyEditToContent(current, parsed.oldString, parsed.newString, replaceAll);
  if (!applied.ok) {
    return {
      ok: false,
      detail: `edit: cannot reconstruct the planned content of ${absolutePath}: oldString is not found verbatim (fuzzy matching is not reconstructed; re-read the file and provide the exact oldString)`,
    };
  }
  if (!replaceAll && applied.result.matchCount > 1) {
    return {
      ok: false,
      detail: `edit: cannot reconstruct the planned content of ${absolutePath}: oldString matches multiple locations (provide more surrounding context or set replaceAll)`,
    };
  }
  return { ok: true, writes: [{ absolutePath, content: applied.result.content, kind: "update" }] };
}

// ---------------------------------------------------------------------------
// V4A patch（OpenCode apply_patch 形式）
// ---------------------------------------------------------------------------

export type PatchHunk =
  | { readonly type: "add"; readonly path: string; readonly contents: string }
  | { readonly type: "delete"; readonly path: string }
  | { readonly type: "update"; readonly path: string; readonly movePath?: string; readonly chunks: readonly UpdateChunk[] };

export type { UpdateChunk } from "./edit-semantics.ts";

/** V4A パッチの解析（現行 tool と同じ形式判定）。解析不能はエラー。 */
export function parsePatchText(patchText: string): PatchHunk[] {
  const outcome = parsePatch(patchText);
  if (!outcome.ok) throw new Error(outcome.reason);
  return outcome.patch.entries.map((entry): PatchHunk => {
    if (entry.kind === "add") return { type: "add", path: entry.path, contents: entry.addContent };
    if (entry.kind === "delete") return { type: "delete", path: entry.path };
    return {
      type: "update",
      path: entry.path,
      ...(entry.moveTo !== null ? { movePath: entry.moveTo } : {}),
      chunks: entry.chunks,
    };
  });
}

export { applyUpdateChunks } from "./edit-semantics.ts";

/** apply_patch の再構成。全対象ファイルの完成予定内容（存在するもの）を返す。 */
export function reconstructApplyPatch(args: ApplyPatchArgs, projectRoot: string): ReconstructionResult {
  const parsed = parseApplyPatchToolArgs(args);
  if (parsed.patchText === undefined || parsed.patchText.length === 0) {
    return { ok: false, detail: "apply_patch: patchText argument is missing or not a string" };
  }
  let hunks: PatchHunk[];
  try {
    hunks = parsePatchText(parsed.patchText);
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
