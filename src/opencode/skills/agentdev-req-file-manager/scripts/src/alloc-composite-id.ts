/**
 * 複合ID（要件行ID）採番スクリプト（AG-002、AG-006、REQ-0103-159/160）。
 *
 * 指定 REQ ファイル本文から既存の `REQ-NNNN-MMM` 形式の要件行IDを抽出し、
 * その最大行番号 + 1 を採番する。欠番埋め禁止。
 *
 * I/O:
 *   入力: argv[2] = 対象 REQ ファイルパス、argv[3] = 親 REQ 番号（例: 0103、オプション・ファイル名から推定）
 *   出力: stdout に JSON { ok: true, allocated: "REQ-NNNN-MMM", req: N, max: M }
 *   エラー: 非ゼロ終了コード + stderr メッセージ
 */

import { readFileContent, pad3, pad4, reqNumberFromFilename, safeMax } from "../lib/fs-helpers.ts";
import { extractCompositeIdNumbers } from "../lib/frontmatter.ts";
import { emitJson, emitError } from "../lib/result.ts";
import { basename } from "node:path";

/** 既存の行番号リストから次の行番号（max+1）を計算する（純粋関数）。 */
export function nextRowNumber(existingRows: number[]): number {
  const max = safeMax(existingRows);
  return max + 1;
}

/** REQ番号と行番号から `REQ-NNNN-MMM` 形式のIDを生成する（純粋関数）。 */
export function formatCompositeId(req: number, row: number): string {
  return `REQ-${pad4(req)}-${pad3(row)}`;
}

/**
 * 本文から `REQ-NNNN-MMM` 形式のIDを全て抽出する（純粋関数）。
 * 重複除去は行わない（重複は整合性チェックの対象）。
 */
export function extractAllCompositeIds(content: string): string[] {
  const re = /REQ-(\d{4})-(\d{3})/g;
  const ids: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    if (m[0]) ids.push(m[0]);
  }
  return ids;
}

async function main(): Promise<void> {
  const filePath = process.argv[2];
  if (!filePath) {
    emitError("Usage: alloc-composite-id <req-file-path> [req-number]");
  }

  // 親 REQ 番号の決定: argv[3] 優先、無ければファイル名から推定
  let reqNumber: number | null = null;
  const explicit = process.argv[3];
  if (explicit) {
    reqNumber = Number.parseInt(explicit, 10);
    if (!Number.isFinite(reqNumber) || reqNumber <= 0) {
      emitError(`Invalid req-number: ${explicit}`);
    }
  } else {
    reqNumber = reqNumberFromFilename(basename(filePath!));
  }
  if (reqNumber === null) {
    emitError("req-number is required (argv[3] or filename REQ-NNNN.md)");
  }

  const content = readFileContent(filePath!);
  const ids = extractAllCompositeIds(content);
  const rows: number[] = [];
  for (const id of ids) {
    const parsed = extractCompositeIdNumbers(id);
    if (parsed === null) continue;
    if (parsed.req === reqNumber) {
      rows.push(parsed.row);
    }
  }

  const max = safeMax(rows);
  const next = nextRowNumber(rows);
  emitJson({ ok: true, allocated: formatCompositeId(reqNumber!, next), req: reqNumber, max });
}

if (import.meta.main) {
  await main();
}
