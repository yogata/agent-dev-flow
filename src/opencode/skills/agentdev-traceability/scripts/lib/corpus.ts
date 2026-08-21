// 正規成果物コーパスの直接走査（agentdev-traceability Design「実装構成」の実装）。
//
// - root 配下を再帰走査し、拡張子に合致する通常ファイルの宣言をその場で解決する
// - `.agentdev/graph/` 等の派生 Graph を必須入力・必須生成物としない
// - シンボリックリンク・ジャンクションのディレクトリは降下しない
// - 列挙順は名前順で決定的とし、相対パスはフォワードスラッシュで返す
// - 読取に失敗したファイルは読取不能ファイルとして報告する（evidence-unavailable 検査の入力）

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { parseDeclarations } from "./declarations.ts";
import type { CoverDeclaration, DeclarationIssue } from "./declarations.ts";

export const DEFAULT_SCAN_EXTENSIONS = [".md", ".ts"] as const;
export const DEFAULT_EXCLUDE_DIRS = [
  ".git",
  ".agentdev",
  ".agentdev-plugin",
  ".worktrees",
  "node_modules",
] as const;

export interface ScanOptions {
  readonly extensions?: readonly string[];
  readonly excludeDirs?: readonly string[];
}

export interface ScanResult {
  readonly declarations: readonly CoverDeclaration[];
  readonly issues: readonly DeclarationIssue[];
  readonly unreadableFiles: readonly string[];
  readonly fileCount: number;
}

function toForwardSlash(value: string): string {
  return value.replaceAll("\\", "/");
}

function walkFiles(
  rootDir: string,
  relDir: string,
  extensions: readonly string[],
  excludeDirs: ReadonlySet<string>,
  out: string[],
): void {
  let entries;
  try {
    entries = readdirSync(join(rootDir, relDir), { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const rel = relDir === "" ? entry.name : `${relDir}/${entry.name}`;
    if (entry.isDirectory()) {
      // junction / symlink ディレクトリは降下しない（isDirectory はリンク先を追従した結果のため isSymbolicLink で除外）
      if (entry.isSymbolicLink()) continue;
      if (excludeDirs.has(entry.name)) continue;
      walkFiles(rootDir, rel, extensions, excludeDirs, out);
      continue;
    }
    if (!entry.isFile()) continue;
    if (entry.isSymbolicLink()) continue;
    if (!extensions.some((ext) => entry.name.endsWith(ext))) continue;
    out.push(rel);
  }
}

export function enumerateCorpusFiles(
  root: string,
  options: ScanOptions = {},
): readonly string[] {
  const extensions = options.extensions ?? DEFAULT_SCAN_EXTENSIONS;
  const excludeDirs = new Set(options.excludeDirs ?? DEFAULT_EXCLUDE_DIRS);
  const out: string[] = [];
  walkFiles(
    root.replaceAll("\\", "/").replace(/\/$/, ""),
    "",
    extensions,
    excludeDirs,
    out,
  );
  return out.sort();
}

/**
 * root 配下のコーパスを直接走査し、全対応宣言・解析 issues・読取不能ファイルを返す。
 */
export function scanCorpus(root: string, options: ScanOptions = {}): ScanResult {
  const declarations: CoverDeclaration[] = [];
  const issues: DeclarationIssue[] = [];
  const unreadableFiles: string[] = [];
  const files = enumerateCorpusFiles(root, options);
  for (const rel of files) {
    try {
      statSync(join(root, rel));
      const content = readFileSync(join(root, rel), "utf-8");
      const parsed = parseDeclarations(rel, content);
      declarations.push(...parsed.declarations);
      issues.push(...parsed.issues);
    } catch {
      unreadableFiles.push(rel);
    }
  }
  return { declarations, issues, unreadableFiles, fileCount: files.length };
}

/**
 * 成果物パス（リポジトリ相対）の根拠を検証する。
 * ファイル不在・ディレクトリ指定・読取不能のときは理由を返す（evidence-unavailable）。
 */
export function locateEvidence(
  root: string,
  artifact: string,
): { ok: true; file: string; content: string } | { ok: false; artifact: string; reason: string } {
  const normalized = toForwardSlash(artifact).replace(/^\.\//, "");
  const full = join(root, normalized);
  let st;
  try {
    st = statSync(full);
  } catch {
    return { ok: false, artifact: normalized, reason: "file-not-found" };
  }
  if (!st.isFile()) {
    return { ok: false, artifact: normalized, reason: "not-a-regular-file" };
  }
  try {
    return { ok: true, file: normalized, content: readFileSync(full, "utf-8") };
  } catch {
    return { ok: false, artifact: normalized, reason: "unreadable" };
  }
}
