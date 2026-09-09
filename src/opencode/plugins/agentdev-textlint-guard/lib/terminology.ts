// ADF-COVERS(implementation): REQ-053-004, REQ-053-024, REQ-053-030
// agentdev-textlint-guard 共通実行基盤: プロジェクト固有用語の接続点。
//
// プロジェクトが所有する native な prh 形式の用語辞書は、対象プロジェクトの
// 慣行パス .agentdev/config/plugins/agentdev-textlint-guard-prh.yml から接続する
// （Plugin 設定スキーマ version: 1 は additional_targets のみを扱い、用語辞書は
// この別経路で追加合成する。ADF 独自の辞書スキーマは設けない）。
// - 辞書なし: 標準構成だけの正常状態（標準規則は用語設定がない場合も有効）
// - 辞書は標準構成へ「追加合成」され、標準規則・標準対象を無効化しない
// - 発見は検査のたびに行われ、追加・削除は再起動なしで次回操作から反映される
// - 辞書の内容の妥当性は prh 規則自身の読込み検証に委譲する（native 形式の
//   検証を二重実装しない）。読込み不能は原因とパスを付して検査不能として扱う

import * as fs from "node:fs";
import * as path from "node:path";

export const PROJECT_PRH_RELATIVE_PATH = ".agentdev/config/plugins/agentdev-textlint-guard-prh.yml";

export type ProjectPrhResult =
  | { readonly ok: true; readonly path: string | null }
  | { readonly ok: false; readonly prhPath: string; readonly detail: string };

export function projectPrhPathFor(root: string): string {
  return path.join(root, ...PROJECT_PRH_RELATIVE_PATH.split("/"));
}

/** 慣行パスの辞書発見。不在は null（標準構成だけの正常状態）。 */
export function discoverProjectPrh(root: string): ProjectPrhResult {
  const prhPath = projectPrhPathFor(root);
  let stat: fs.Stats | null = null;
  try {
    stat = fs.statSync(prhPath);
  } catch {
    return { ok: true, path: null };
  }
  if (!stat.isFile()) {
    return { ok: false, prhPath, detail: `project prh path is not a regular file (${prhPath})` };
  }
  try {
    fs.accessSync(prhPath, fs.constants.R_OK);
  } catch (e) {
    return {
      ok: false,
      prhPath,
      detail: `cannot read the project prh dictionary: ${e instanceof Error ? e.message : String(e)} (${prhPath})`,
    };
  }
  return { ok: true, path: prhPath };
}

/** 辞書読込みエラー文言（原因 + 辞書パス + 修復案内）。 */
export function formatProjectPrhError(result: Extract<ProjectPrhResult, { ok: false }>): string {
  return (
    `agentdev-textlint-guard: project prh dictionary is unreadable: ${result.detail}. ` +
    `Fix the dictionary file with an external editor; write, edit, and apply_patch stay blocked (including writes to non-target files) until the dictionary is readable. Dictionary path: ${result.prhPath}`
  );
}
