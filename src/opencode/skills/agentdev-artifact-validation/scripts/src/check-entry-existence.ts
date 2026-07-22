/**
 * README / DOC-MAP / mapping-table のエントリ存在確認スクリプト
 * （AG-002、AG-006、REQ-0103-159/160）。
 *
 * 指定 ID（例: REQ-0103、ADR-0128）が、対象インデックスファイル本文に
 * 出現するかを確認する。出現しない場合はエラーとして報告する。
 *
 * I/O:
 *   入力: argv[2] = 検索対象 ID（例: REQ-0103）
 *         argv[3..] = インデックスファイルパス群（可変長）
 *         または stdin に JSON { id: string, files: string[] }
 *   出力: stdout に JSON { ok: boolean, errors: string[], warnings: string[], found: string[] }
 *   エラー: 非ゼロ終了コード + stderr メッセージ
 */

import { readFileContent } from "../lib/fs-helpers.ts";
import { emitJson, emitError } from "../lib/result.ts";

export type EntryResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  found: string[];
};

/**
 * 指定 ID がファイル本文に含まれるかを判定する（純粋関数）。
 * 単純な部分文字列探索（インデックスファイルは ID をそのまま記載する運用）。
 */
export function idExistsInContent(id: string, content: string): boolean {
  return content.includes(id);
}

/**
 * 複数ファイルに対して ID の存在を確認し、結果を集約する（純粋関数）。
 * found は ID が見つかったファイルパスのリスト。
 */
export function checkIdInFiles(
  id: string,
  files: ReadonlyArray<{ path: string; content: string }>,
): EntryResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const found: string[] = [];
  for (const f of files) {
    if (idExistsInContent(id, f.content)) {
      found.push(f.path);
    }
  }
  if (found.length === 0) {
    errors.push(`id "${id}" not found in any of the provided index files`);
  }
  return { ok: errors.length === 0, errors, warnings, found };
}

async function main(): Promise<void> {
  // argv 入力: id file1 [file2 ...]
  if (process.argv[2] && process.argv[3]) {
    const id = process.argv[2]!;
    const files = process.argv.slice(3).map((path) => ({
      path,
      content: readFileContent(path),
    }));
    emitJson(checkIdInFiles(id, files));
    return;
  }

  // stdin JSON 入力: { id, files: string[] }
  const stdinContent = await readStdin();
  if (stdinContent) {
    let parsed: { id?: unknown; files?: unknown };
    try {
      parsed = JSON.parse(stdinContent);
    } catch {
      emitError(`Invalid JSON on stdin: ${stdinContent}`);
    }
    if (typeof parsed.id !== "string" || !Array.isArray(parsed.files)) {
      emitError('stdin JSON must be { id: string, files: string[] }');
    }
    const files = (parsed.files as unknown[]).map((path) => {
      if (typeof path !== "string") {
        emitError(`files entries must be strings, got: ${typeof path}`);
      }
      return { path: path!, content: readFileContent(path!) };
    });
    emitJson(checkIdInFiles(parsed.id as string, files));
    return;
  }

  emitError('Usage: check-entry-existence <id> <file1> [file2 ...]  OR  stdin JSON { id: string, files: string[] }');
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
