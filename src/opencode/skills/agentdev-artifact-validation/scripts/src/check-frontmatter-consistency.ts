/**
 * frontmatter id ↔ ファイル名整合性確認スクリプト（AG-002、AG-006、REQ-0103-159/160）。
 *
 * 指定ディレクトリ配下の `REQ-NNNN.md` / `ADR-NNNN.md` について、
 * frontmatter の `id:` とファイル名が一致するか検証する。
 *
 * I/O:
 *   入力: argv[2] = 検証対象ディレクトリパス
 *         argv[3] = kind（"req" | "adr"、デフォルト: ファイル名から推定）
 *   出力: stdout に JSON { ok: boolean, errors: string[], warnings: string[] }
 *   エラー時: ok: false, errors に理由。致命的I/Oエラーは非ゼロ終了コード + stderr
 */

import { listMarkdownFiles, joinPath, readFileContent, reqNumberFromFilename, adrNumberFromFilename } from "../lib/fs-helpers.ts";
import { parseFrontmatter, extractReqNumber, extractAdrNumber } from "../lib/frontmatter.ts";
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
  kind: "req" | "adr",
): { ok: boolean; issues: ConsistencyIssue } {
  const filenameNumber =
    kind === "req" ? reqNumberFromFilename(filename) : adrNumberFromFilename(filename);
  const fm = parseFrontmatter(content);
  const frontmatterId = fm?.id ?? null;
  let frontmatterNumber: number | null = null;
  if (frontmatterId !== null) {
    frontmatterNumber =
      kind === "req" ? extractReqNumber(frontmatterId) : extractAdrNumber(frontmatterId);
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
  const kind = (process.argv[3] as "req" | "adr" | undefined) ?? "req";
  if (!dir) {
    emitError("Usage: check-frontmatter-consistency <dir> [req|adr]");
  }
  if (kind !== "req" && kind !== "adr") {
    emitError(`kind must be "req" or "adr", got: ${kind}`);
  }

  const files = listMarkdownFiles(dir!);
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const filename of files) {
    // REQ/ADR 以外の .md（README.md 等）はスキップ
    const isTarget =
      (kind === "req" && /^REQ-\d{4}\.md$/.test(filename)) ||
      (kind === "adr" && /^ADR-\d{4}\.md$/.test(filename));
    if (!isTarget) continue;

    const content = readFileContent(joinPath(dir!, filename));
    const result = checkSingleFile(filename, content, kind);
    if (!result.ok) {
      const i = result.issues;
      const expected = i.filenameNumber !== null ? `${kind.toUpperCase()}-${String(i.filenameNumber).padStart(4, "0")}` : "(no filename number)";
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
