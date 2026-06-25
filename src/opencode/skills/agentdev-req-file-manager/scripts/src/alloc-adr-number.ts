/**
 * ADR番号採番スクリプト（AG-002、AG-006、REQ-0103-159/160）。
 *
 * 既存の ADR ファイル群から最大番号を特定し、その +1 を採番する。
 * 欠番埋め禁止（agentdev-adr-file-manager 採番ルール）。
 *
 * I/O:
 *   入力: argv[2] = ADR ディレクトリパス（例: docs/adr）
 *   出力: stdout に JSON { ok: true, allocated: "ADR-NNNN", max: N }
 *   エラー: 非ゼロ終了コード + stderr メッセージ
 */

import { listMarkdownFiles, joinPath, readFileContent, pad4, adrNumberFromFilename, safeMax } from "../lib/fs-helpers.ts";
import { extractAdrNumber } from "../lib/frontmatter.ts";
import { emitJson, emitError } from "../lib/result.ts";

/** 既存番号のリストから次番号（max+1）を計算する（純粋関数）。 */
export function nextAdrNumber(existingNumbers: number[]): number {
  const max = safeMax(existingNumbers);
  return max + 1;
}

/** 番号から `ADR-NNNN` 形式の ID を生成する（純粋関数）。 */
export function formatAdrId(n: number): string {
  return `ADR-${pad4(n)}`;
}

async function main(): Promise<void> {
  const dir = process.argv[2];
  if (!dir) {
    emitError("Usage: alloc-adr-number <adr-dir>");
  }

  const files = listMarkdownFiles(dir!);
  const numbers: number[] = [];
  for (const filename of files) {
    const fromName = adrNumberFromFilename(filename);
    if (fromName !== null) {
      numbers.push(fromName);
      continue;
    }
    const content = readFileContent(joinPath(dir!, filename));
    const fm = parseFrontmatterForAdr(content);
    if (fm !== null) {
      numbers.push(fm);
    }
  }

  const max = safeMax(numbers);
  const next = nextAdrNumber(numbers);
  emitJson({ ok: true, allocated: formatAdrId(next), max });
}

function parseFrontmatterForAdr(content: string): number | null {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(content);
  if (!match || match[1] === undefined) return null;
  for (const line of match[1].split(/\r?\n/)) {
    const m = /^id:\s*(.*)$/.exec(line);
    if (m && m[1] !== undefined) {
      const n = extractAdrNumber(m[1].trim());
      if (n !== null) return n;
    }
  }
  return null;
}

if (import.meta.main) {
  await main();
}
