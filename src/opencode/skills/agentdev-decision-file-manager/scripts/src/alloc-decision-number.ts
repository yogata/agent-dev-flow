/**
 * Decision番号採番スクリプト（AG-{NNN}、AG-{NNN}、REQ-{NNNN}-{NNN}/160、OU-{NNN} 移行）。
 *
 * 既存の Decision ファイル群から最大番号を特定し、その +1 を採番する。
 * 欠番埋め禁止（agentdev-decision-file-manager 採番ルール）。
 *
 * 本スクリプトは self-contained であり、外部 lib import に依存しない
 * （artifact-contracts SPEC「Script 所有権と委譲契約」準拠、兄弟 skill の lib 直接参照禁止）。
 *
 * I/O:
 *   入力: argv[2] = Decision ディレクトリパス（例: docs/decisions）
 *   出力: stdout に JSON { ok: true, allocated: "DEC-NNN", max: N }
 *   エラー: 非ゼロ終了コード + stderr メッセージ
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** 指定ディレクトリ直下の `.md` ファイル名一覧（非再帰）。存在しない場合は空配列。 */
function listMarkdownFiles(dir: string): string[] {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && e.name.endsWith(".md"))
      .map((e) => e.name);
  } catch {
    return [];
  }
}

/** 3桁ゼロ埋め。 */
function pad3(n: number): string {
  return n.toString().padStart(3, "0");
}

/** 正の整数のみを max 計算対象とする（NaN/負数を弾く）。 */
function safeMax(numbers: number[]): number {
  const valid = numbers.filter((n) => Number.isFinite(n) && n > 0);
  if (valid.length === 0) return 0;
  return valid.reduce((a, b) => (a > b ? a : b));
}

/** ファイル名 `DEC-NNN.md` から番号を取り出す。 */
function decisionNumberFromFilename(filename: string): number | null {
  const m = /^DEC-(\d{3,4})\.md$/.exec(filename);
  return m && m[1] ? parseInt(m[1], 10) : null;
}

/** `DEC-NNN` 形式から数値を取り出す。未整形式は null。 */
function extractDecisionNumber(id: string): number | null {
  const m = /^DEC-(\d{3,4})$/.exec(id);
  return m && m[1] ? parseInt(m[1], 10) : null;
}

/** stdout に JSON を出力する（argv/stdin → stdout JSON 契約）。 */
function emitJson(value: unknown): void {
  process.stdout.write(JSON.stringify(value, null, 2) + "\n");
}

/** stderr にエラーを出力し非ゼロ終了コードで終了する。 */
function emitError(message: string, code = 1): never {
  process.stderr.write(message + "\n");
  process.exit(code);
}

/** 既存番号のリストから次番号（max+1）を計算する（純粋関数）。 */
export function nextDecisionNumber(existingNumbers: number[]): number {
  const max = safeMax(existingNumbers);
  return max + 1;
}

/** 番号から `DEC-NNN` 形式の ID を生成する（純粋関数）。 */
export function formatDecisionId(n: number): string {
  return `DEC-${pad3(n)}`;
}

async function main(): Promise<void> {
  const dir = process.argv[2];
  if (!dir) {
    emitError("Usage: alloc-decision-number <decision-dir>");
  }

  const files = listMarkdownFiles(dir!);
  const numbers: number[] = [];
  for (const filename of files) {
    const fromName = decisionNumberFromFilename(filename);
    if (fromName !== null) {
      numbers.push(fromName);
      continue;
    }
    const content = readFileSync(join(dir!, filename), "utf-8");
    const fm = parseFrontmatterForDecision(content);
    if (fm !== null) {
      numbers.push(fm);
    }
  }

  const max = safeMax(numbers);
  const next = nextDecisionNumber(numbers);
  emitJson({ ok: true, allocated: formatDecisionId(next), max });
}

function parseFrontmatterForDecision(content: string): number | null {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(content);
  if (!match || match[1] === undefined) return null;
  for (const line of match[1].split(/\r?\n/)) {
    const m = /^id:\s*(.*)$/.exec(line);
    if (m && m[1] !== undefined) {
      const n = extractDecisionNumber(m[1].trim());
      if (n !== null) return n;
    }
  }
  return null;
}

if (import.meta.main) {
  await main();
}
