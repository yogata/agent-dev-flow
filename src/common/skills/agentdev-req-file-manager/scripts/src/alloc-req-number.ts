/**
 * REQ番号採番スクリプト（「Script 所有権と委譲契約」に基づく本 skill 正規所有）。
 *
 * 既存の REQ ファイル群（retired/ 配下を含む。numbering-policy.md
 * 「新規識別子は、当該種別の現行ファイル群（retired/ を含む）の最大番号に 1 を
 * 加えた値とする」）から最大番号を特定し、その +1 を採番する。
 *
 * I/O:
 *   入力: argv[2] = REQ ディレクトリパス（例: docs/requirements）
 *   出力: stdout に JSON { ok: true, allocated: "REQ-NNNN", max: N }
 *   エラー: 非ゼロ終了コード + stderr メッセージ
 */

import { listMarkdownFiles, joinPath, readFileContent, pad3, reqNumberFromFilename, safeMax } from "../lib/fs-helpers.ts";
import { extractReqNumber } from "../lib/frontmatter.ts";
import { emitJson, emitError } from "../lib/result.ts";

/** 既存番号のリストから次番号（max+1）を計算する（純粋関数）。空の場合は 1。 */
export function nextReqNumber(existingNumbers: number[]): number {
  const max = safeMax(existingNumbers);
  return max + 1;
}

/** 番号から `REQ-NNNN` 形式の ID を生成する（純粋関数）。 */
export function formatReqId(n: number): string {
  return `REQ-${pad3(n)}`;
}

/**
 * 当該種別の現行ファイル群（retired/ を含む）から既存 REQ 番号を収集する
 * （numbering-policy.md「新規識別子は、当該種別の現行ファイル群（retired/ を含む）
 * の最大番号に 1 を加えた値とする」準拠）。
 * 各ファイルはファイル名由来（REQ-NNNN.md）を優先し、ファイル名が形式に合わない
 * 場合は frontmatter id 由来でフォールバックする。
 */
export function collectExistingReqNumbers(dir: string): number[] {
  const numbers: number[] = [];
  for (const target of [dir, joinPath(dir, "retired")]) {
    for (const filename of listMarkdownFiles(target)) {
      // ファイル名由来
      const fromName = reqNumberFromFilename(filename);
      if (fromName !== null) {
        numbers.push(fromName);
        continue;
      }
      // frontmatter id 由来（ファイル名が REQ-NNNN.md でない場合のフォールバック）
      const content = readFileContent(joinPath(target, filename));
      const fm = parseFrontmatterForReq(content);
      if (fm !== null) {
        numbers.push(fm);
      }
    }
  }
  return numbers;
}

async function main(): Promise<void> {
  const dir = process.argv[2];
  if (!dir) {
    emitError("Usage: alloc-req-number <req-dir>");
  }

  const numbers = collectExistingReqNumbers(dir!);

  const max = safeMax(numbers);
  const next = nextReqNumber(numbers);
  emitJson({ ok: true, allocated: formatReqId(next), max });
}

function parseFrontmatterForReq(content: string): number | null {
  // テスト容易性のため frontmatter.ts の関数を直接呼ばず、ここで簡易抽出
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(content);
  if (!match || match[1] === undefined) return null;
  for (const line of match[1].split(/\r?\n/)) {
    const m = /^id:\s*(.*)$/.exec(line);
    if (m && m[1] !== undefined) {
      const n = extractReqNumber(m[1].trim());
      if (n !== null) return n;
    }
  }
  return null;
}

if (import.meta.main) {
  await main();
}
