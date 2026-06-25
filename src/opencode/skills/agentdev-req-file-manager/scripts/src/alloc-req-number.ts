/**
 * REQ番号採番スクリプト（AG-002、AG-006、REQ-0103-159/160）。
 *
 * 既存の REQ ファイル群から最大番号を特定し、その +1 を採番する。
 * 欠番があっても埋めない（REQ-NNNN 安定 ID 規約）。
 *
 * I/O:
 *   入力: argv[2] = REQ ディレクトリパス（例: docs/requirements）
 *   出力: stdout に JSON { ok: true, allocated: "REQ-NNNN", max: N }
 *   エラー: 非ゼロ終了コード + stderr メッセージ
 */

import { listMarkdownFiles, joinPath, readFileContent, pad4, reqNumberFromFilename, safeMax } from "../lib/fs-helpers.ts";
import { extractReqNumber } from "../lib/frontmatter.ts";
import { emitJson, emitError } from "../lib/result.ts";

/** 既存番号のリストから次番号（max+1）を計算する（純粋関数）。空の場合は 1。 */
export function nextReqNumber(existingNumbers: number[]): number {
  const max = safeMax(existingNumbers);
  return max + 1;
}

/** 番号から `REQ-NNNN` 形式の ID を生成する（純粋関数）。 */
export function formatReqId(n: number): string {
  return `REQ-${pad4(n)}`;
}

async function main(): Promise<void> {
  const dir = process.argv[2];
  if (!dir) {
    emitError("Usage: alloc-req-number <req-dir>");
  }

  const files = listMarkdownFiles(dir!);
  const numbers: number[] = [];
  for (const filename of files) {
    // ファイル名由来
    const fromName = reqNumberFromFilename(filename);
    if (fromName !== null) {
      numbers.push(fromName);
      continue;
    }
    // frontmatter id 由来（ファイル名が REQ-NNNN.md でない場合のフォールバック）
    const content = readFileContent(joinPath(dir!, filename));
    const fm = parseFrontmatterForReq(content);
    if (fm !== null) {
      numbers.push(fm);
    }
  }

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
