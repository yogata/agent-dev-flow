/**
 * ファイル名・番号・ゼロ埋めヘルパー（REQ 採番用）。
 *
 * 正規所有は agentdev-artifact-validation scripts/lib であり、本ファイルは
 * supported lib interface 経由の再公開のみを行う。
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
