/**
 * 変更範囲検証スクリプト（AG-002、AG-006、REQ-0103-159/160）。
 *
 * 変更対象ファイルパスのリストと、許可パスリスト（glob 風プレフィックス）を比較し、
 * 許可範囲外の変更を検出する。req-save G02 / spec-save G02 のファイル操作制約を
 * 機械的に検証するために使用する。
 *
 * I/O:
 *   入力: argv[2] = 変更ファイルパスを1行1件で並べたテキストファイルパス
 *         argv[3] = 許可パスプレフィックスを1行1件で並べたテキストファイルパス
 *         または stdin に JSON { changed: string[], allowed: string[] }
 *   出力: stdout に JSON { ok: boolean, errors: string[], warnings: string[], violations: string[] }
 *   エラー: 非ゼロ終了コード + stderr メッセージ
 */

import { readFileContent } from "../lib/fs-helpers.ts";
import { emitJson, emitError } from "../lib/result.ts";

export type ChangeImpactResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  violations: string[];
};

/** 前方一致マッチ（`docs/requirements/**` は `docs/requirements/` で始まるパス全てにマッチ）。 */
export function pathMatchesPrefix(path: string, prefixPattern: string): boolean {
  if (prefixPattern === "**" || prefixPattern === "**/*") return true;
  if (!prefixPattern.includes("**")) {
    return path === prefixPattern;
  }
  const prefix = prefixPattern.replace(/\/\*+$/, "");
  if (path === prefix) return true;
  if (path.startsWith(prefix + "/")) return true;
  return false;
}

/** 変更パスリストの各要素が許可リストのいずれかにマッチするか検証する（純粋関数）。 */
export function checkChangeImpact(
  changedPaths: readonly string[],
  allowedPatterns: readonly string[],
): ChangeImpactResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const violations: string[] = [];

  for (const changed of changedPaths) {
    const matched = allowedPatterns.some((p) => pathMatchesPrefix(changed, p));
    if (!matched) {
      violations.push(changed);
    }
  }

  if (violations.length > 0) {
    errors.push(`${violations.length} path(s) outside allowed scope`);
  }

  return { ok: errors.length === 0, errors, warnings, violations };
}

async function main(): Promise<void> {
  // argv 入力: changedFile allowedFile
  if (process.argv[2] && process.argv[3]) {
    const changedRaw = readFileContent(process.argv[2]!);
    const allowedRaw = readFileContent(process.argv[3]!);
    const changed = parsePathList(changedRaw);
    const allowed = parsePathList(allowedRaw);
    emitJson(checkChangeImpact(changed, allowed));
    return;
  }

  // stdin JSON 入力: { changed: string[], allowed: string[] }
  const stdinContent = await readStdin();
  if (stdinContent) {
    let parsed: { changed?: unknown; allowed?: unknown };
    try {
      parsed = JSON.parse(stdinContent);
    } catch {
      emitError(`Invalid JSON on stdin: ${stdinContent}`);
    }
    if (!Array.isArray(parsed.changed) || !Array.isArray(parsed.allowed)) {
      emitError('stdin JSON must be { changed: string[], allowed: string[] }');
    }
    emitJson(
      checkChangeImpact(
        parsed.changed as string[],
        parsed.allowed as string[],
      ),
    );
    return;
  }

  emitError('Usage: check-change-impact <changed-paths-file> <allowed-patterns-file>  OR  stdin JSON { changed: string[], allowed: string[] }');
}

function parsePathList(content: string): string[] {
  return content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"));
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
