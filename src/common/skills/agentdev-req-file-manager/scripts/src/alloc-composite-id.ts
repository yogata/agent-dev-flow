/**
 * 複合ID（要件行ID）採番スクリプト（AG-{NNN}、AG-{NNN}、REQ-{NNNN}-{NNN}/160）。
 *
 * 指定 REQ ファイル本文から既存の要件行IDを抽出し、
 * その最大行番号 + 1 を採番する。欠番埋め禁止。
 *
 * 既存IDの抽出は形式妥当性のみで受理する（REQ- 接頭辞・ハイフン区切り・数値
 * セグメント2つ・各セグメント最小1桁。桁数上限なし）。採番結果の出力は
 * pad3/pad4 の最小幅ゼロ埋め表示（切詰めなし）とする。表示規則は受理上限として
 * 機能させない。
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
 * 本文から複合ID（REQ-{NNN}-{NNN} 形式。桁数上限なし）を全て抽出する（純粋関数）。
 * 受理は形式妥当性のみ（REQ- 接頭辞・ハイフン区切り・数値セグメント2つ・各セグメント
 * 最小1桁）。前置一致と後続数字の非消費（lookaround）により長い行番号の
 * 部分一致を防ぐ（非曖昧抽出）。
 * 重複除去は行わない（重複は整合性チェックの対象）。
 */
export function extractAllCompositeIds(content: string): string[] {
  const re = /(?<![\w-])REQ-\d+-\d+(?![\w-])/g;
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
