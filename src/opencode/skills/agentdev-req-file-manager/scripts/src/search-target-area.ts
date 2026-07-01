/**
 * target_area 見出し検索スクリプト（AG-002、AG-006、REQ-0103-159/160）。
 *
 * 指定 SPEC ファイル群から、target_area（Markdown 見出し行）を検索する。
 * spec-save の update 操作で、target_area に一致するセクションを特定するために使用する。
 *
 * マッチ規約（spec-save command SPEC の target_area ベースのセクション置換ロジックに準拠）:
 *   - 完全一致: 見出しテキストが target_area に完全一致
 *   - 前方一致: 見出しテキストが target_area で始まる
 *   - 複数マッチ時は warning（spec-save G09 で置換拒否の根拠）
 *   - 未検出時は空配列（spec-save でスキップ判定）
 *
 * I/O:
 *   入力: argv[2] = target_area 文字列（見出しテキスト）
 *         argv[3] = 検索対象 SPEC ファイルパス
 *         または stdin に JSON { target_area: string, files: string[] }
 *   出力: stdout に JSON { ok: true, matches: [{file, line, text}] }
 *   エラー: 非ゼロ終了コード + stderr メッセージ
 */

import { readFileContent } from "../lib/fs-helpers.ts";
import { emitJson, emitError, type SearchOk } from "../lib/result.ts";

export type Match = {
  file: string;
  line: number;
  text: string;
};

/**
 * 1ファイルの本文から target_area にマッチする見出しを抽出する（純粋関数）。
 * 見出し行（# で始まる行）のみを対象とする。
 */
export function findTargetAreaHeadings(
  targetArea: string,
  content: string,
  filePath: string,
): Match[] {
  const matches: Match[] = [];
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    if (!headingMatch || headingMatch[2] === undefined) continue;
    const headingText = headingMatch[2].trim();
    if (headingMatchesTarget(headingText, targetArea)) {
      matches.push({ file: filePath, line: i + 1, text: line });
    }
  }
  return matches;
}

/** 完全一致 または 前方一致（target_area で始まる見出し）。 */
export function headingMatchesTarget(headingText: string, targetArea: string): boolean {
  if (headingText === targetArea) return true;
  if (headingText.startsWith(targetArea)) return true;
  return false;
}

/**
 * 複数ファイルに対して target_area を検索し、結果を集約する（純粋関数）。
 * matches が空でもエラーとはしない（spec-save 側でスキップ判定）。
 * 複数マッチは呼び出し元で warning 判断の材料とするため、全て返す。
 */
export function searchTargetArea(
  targetArea: string,
  files: ReadonlyArray<{ path: string; content: string }>,
): SearchOk {
  const matches: Match[] = [];
  for (const f of files) {
    matches.push(...findTargetAreaHeadings(targetArea, f.content, f.path));
  }
  return { ok: true, matches };
}

async function main(): Promise<void> {
  // argv 入力: target_area file
  if (process.argv[2] && process.argv[3]) {
    const targetArea = process.argv[2]!;
    const files = process.argv.slice(3).map((path) => ({
      path,
      content: readFileContent(path),
    }));
    emitJson(searchTargetArea(targetArea, files));
    return;
  }

  // stdin JSON 入力: { target_area, files: string[] }
  const stdinContent = await readStdin();
  if (stdinContent) {
    let parsed: { target_area?: unknown; files?: unknown };
    try {
      parsed = JSON.parse(stdinContent);
    } catch {
      emitError(`Invalid JSON on stdin: ${stdinContent}`);
    }
    if (typeof parsed.target_area !== "string" || !Array.isArray(parsed.files)) {
      emitError('stdin JSON must be { target_area: string, files: string[] }');
    }
    const files = (parsed.files as unknown[]).map((path) => {
      if (typeof path !== "string") {
        emitError(`files entries must be strings, got: ${typeof path}`);
      }
      return { path: path!, content: readFileContent(path!) };
    });
    emitJson(searchTargetArea(parsed.target_area as string, files));
    return;
  }

  emitError('Usage: search-target-area <target_area> <spec-file> [spec-file...]  OR  stdin JSON { target_area: string, files: string[] }');
}

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) return "";
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

if (import.meta.main) {
  await main();
}
