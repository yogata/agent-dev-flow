/**
 * REQ番号採番スクリプト（AG-{NNN}、AG-{NNN}、REQ-{NNNN}-{NNN}/160）。
 *
 * 既存の REQ ファイル群から最大番号を特定し、その +1 を採番する。
 * あわせて既知欠番レジストリ（docs/designs/foundations/numbering-policy.md
 * 「既知の欠番」節の `REQ-NNN:` 行頭エントリ）を読み込み、現行ファイル群の
 * 最大番号が既知欠番を下回る場合も既知欠番を埋めない
 * （欠番があっても埋めない REQ-NNNN 安定 ID 規約。numbering-policy の記録との
 * 単一情報源化）。
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

/**
 * 既知欠番レジストリ（numbering-policy.md「既知の欠番」節本文）から欠番番号を
 * 抽出する（純粋関数）。行頭が `REQ-NNN:` で始まる行を欠番エントリとみなし、
 * その番号のみを採番する（本文 prose 中の言及は採番しない）。
 */
export function extractKnownGapNumbers(policyContent: string): number[] {
  const sectionLines: string[] = [];
  let inSection = false;
  for (const line of policyContent.split(/\r?\n/)) {
    if (/^#{2,6}\s*既知の欠番\s*$/.test(line)) {
      inSection = true;
      continue;
    }
    if (inSection && /^#{1,6}\s/.test(line)) {
      break;
    }
    if (inSection) {
      sectionLines.push(line);
    }
  }
  const gaps: number[] = [];
  for (const line of sectionLines) {
    const m = /^REQ-(\d{3,4})\s*:/.exec(line.trim());
    if (m && m[1] !== undefined) {
      gaps.push(Number(m[1]));
    }
  }
  return gaps;
}

/**
 * REQ ディレクトリから既知欠番レジストリ（numbering-policy.md）を読み込む。
 * レジストリが読み取れない場合は空配列を返し、従来どおりファイル群の max+1 で
 * 採番する（レジストリ不在をエラーにしない）。
 */
async function loadKnownGapNumbers(dir: string): Promise<number[]> {
  const policyPath = joinPath(dir, "..", "designs", "foundations", "numbering-policy.md");
  try {
    const content = readFileContent(policyPath);
    return extractKnownGapNumbers(content);
  } catch {
    return [];
  }
}

/** 番号から `REQ-NNNN` 形式の ID を生成する（純粋関数）。 */
export function formatReqId(n: number): string {
  return `REQ-${pad3(n)}`;
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
  const gapNumbers = await loadKnownGapNumbers(dir!);
  const next = nextReqNumber(numbers.concat(gapNumbers));
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
