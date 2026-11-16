/**
 * frontmatter id ↔ ファイル名整合性確認スクリプト（「Script 所有権と委譲契約」による共通検証 script としての正規所有）。
 *
 * 指定ディレクトリ配下の `REQ-NNNN.md` / `ADR-NNNN.md` / `DEC-NNN.md` について、
 * frontmatter の `id:` とファイル名が一致するか検証する。
 *
 * I/O:
 *   入力: argv[2] = 検証対象ディレクトリパス
 *         argv[3] = kind（"req" | "decision"、デフォルト: ファイル名から推定）
 *   出力: stdout に JSON { ok: boolean, errors: string[], warnings: string[] }
 *   エラー時: ok: false, errors に理由。致命的I/Oエラーは非ゼロ終了コード + stderr
 */

import { listMarkdownFiles, joinPath, readFileContent, reqNumberFromFilename, decisionNumberFromFilename } from "../lib/fs-helpers.ts";
import { parseFrontmatter, extractReqNumber, extractDecisionNumber } from "../lib/frontmatter.ts";
import { emitJson, emitError } from "../lib/result.ts";

export type ConsistencyIssue = {
  file: string;
  filenameNumber: number | null;
  frontmatterId: string | null;
  frontmatterNumber: number | null;
};

/** ファイル名と frontmatter id の番号一致を検証する（純粋関数）。 */
export function checkSingleFile(
  filename: string,
  content: string,
  kind: "req" | "decision",
): { ok: boolean; issues: ConsistencyIssue } {
  const filenameNumber =
    kind === "req"
      ? reqNumberFromFilename(filename)
      : decisionNumberFromFilename(filename);
  const fm = parseFrontmatter(content);
  const frontmatterId = fm?.id ?? null;
  let frontmatterNumber: number | null = null;
  if (frontmatterId !== null) {
    frontmatterNumber =
      kind === "req"
        ? extractReqNumber(frontmatterId)
        : extractDecisionNumber(frontmatterId);
  }

  const ok =
    filenameNumber !== null &&
    frontmatterNumber !== null &&
    filenameNumber === frontmatterNumber;

  return {
    ok,
    issues: {
      file: filename,
      filenameNumber,
      frontmatterId,
      frontmatterNumber,
    },
  };
}

async function main(): Promise<void> {
  const dir = process.argv[2];
  const kind = (process.argv[3] as "req" | "decision" | undefined) ?? "req";
  if (!dir) {
    emitError("Usage: check-frontmatter-consistency <dir> [req|decision]");
  }
  if (kind !== "req" && kind !== "decision") {
    emitError(`kind must be "req" or "decision", got: ${kind}`);
  }

  const files = listMarkdownFiles(dir!);
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const filename of files) {
    // REQ/DEC 以外の .md（README.md 等）はスキップ。
    // REQ の受理は桁数上限なし（各セグメント最小1桁）。
    const isTarget =
      (kind === "req" && /^REQ-\d+\.md$/.test(filename)) ||
      (kind === "decision" && /^DEC-\d{3}\.md$/.test(filename));
    if (!isTarget) continue;

    const content = readFileContent(joinPath(dir!, filename));
    const result = checkSingleFile(filename, content, kind);
    if (!result.ok) {
      const i = result.issues;
      const prefix = kind === "req" ? "REQ" : "DEC";
      // 期待表示は numbering-policy の最小幅ゼロ埋め（REQ は pad3 最小幅。切詰めなし）。
      const width = 3;
      const expected = i.filenameNumber !== null ? `${prefix}-${String(i.filenameNumber).padStart(width, "0")}` : "(no filename number)";
      errors.push(
        `${filename}: frontmatter id "${i.frontmatterId ?? "(missing)"}" does not match expected "${expected}"`,
      );
    }
  }

  emitJson({ ok: errors.length === 0, errors, warnings });
}

if (import.meta.main) {
  await main();
}
