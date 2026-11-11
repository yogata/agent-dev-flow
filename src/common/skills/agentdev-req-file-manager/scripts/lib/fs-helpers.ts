/**
 * ファイル名・番号・ゼロ埋めヘルパー（REQ 採番用）。
 *
 * 正規所有は agentdev-artifact-validation scripts/lib であり、本ファイルは
 * supported lib interface 経由の再公開のみを行う。
 * adrNumberFromFilename のみ、ADR 採番契約が正規文書から導出不能なため
 * 本スキルの局所定義を維持する（該当統合の停止。導出根拠の記録は case 実行 PR 本文参照）。
 */

export {
  reqNumberFromFilename,
  listMarkdownFiles,
  readFileContent,
  joinPath,
  pad4,
  pad3,
  safeMax,
} from "../../../agentdev-artifact-validation/scripts/lib/fs-helpers.ts";

/** ファイル名 `ADR-NNNN.md` から番号を取り出す。 */
export function adrNumberFromFilename(filename: string): number | null {
  const m = /^ADR-(\d{3,4})\.md$/.exec(filename);
  return m && m[1] ? parseInt(m[1], 10) : null;
}
