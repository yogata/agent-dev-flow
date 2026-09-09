// ADF-COVERS(implementation): REQ-053-025, REQ-053-026, REQ-053-029, REQ-053-032
// agentdev-textlint-guard 共通実行基盤: 対象解決。
//
// 標準対象は docs/**/*.md とする。追加対象はルート相対の glob として標準対象へ
// 加算する（加算設定によって標準対象を無効化できない）。対象は常に「標準 + 追加」
// の和集合である。対象外ファイルだけの正常な操作には一般文章検査を適用しない。
//
// glob 意味論（最小実装、決定的）:
// - ** はディレクトリ区切りをまたぐ（0 個以上のパス区間）
// - * は区切りを含まない任意列
// - それ以外の文字はリテラル一致（正規表現メタ文字はエスケープ）
// 対応拡張は .md のみ（Markdown 構造と各規則の機構を利用するため）。

import * as fs from "node:fs";
import * as path from "node:path";
import type { GuardConfig } from "./config.ts";

export const DEFAULT_TARGETS: readonly string[] = ["docs/**/*.md"];

/** ルート相対 glob → 正規表現（区切り / 固定）。**\/ は「0以上のディレクトリ区間」とする。 */
export function globToRegExp(glob: string): RegExp {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  const withStars = escaped.replace(/\*\*\/|\*\*|\*/g, (m) =>
    m === "**/" ? "(?:.*/)?" : m === "**" ? ".*" : "[^/]*",
  );
  return new RegExp(`^${withStars}$`);
}

/** 対象 glob の全リスト（標準 + 追加）。 */
export function targetGlobs(config: GuardConfig): readonly string[] {
  return [...DEFAULT_TARGETS, ...config.additionalTargets];
}

/** ルート相対パス（/ 区切り）が検査対象かどうか。 */
export function isTargetPath(rootRelativePosix: string, config: GuardConfig): boolean {
  if (!rootRelativePosix.endsWith(".md")) return false;
  return targetGlobs(config).some((glob) => globToRegExp(glob).test(rootRelativePosix));
}

/** 対象ファイルの列挙（最終検査入口用）。実ファイル全件を対象 glob で収集する。 */
export function enumerateTargetFiles(root: string, config: GuardConfig): string[] {
  const collected = new Set<string>();
  for (const glob of targetGlobs(config)) {
    for (const rel of walkGlob(root, glob)) {
      collected.add(rel);
    }
  }
  return [...collected].sort();
}

function walkGlob(root: string, glob: string): string[] {
  const segments = glob.split("/");
  const results: string[] = [];
  walk(root, segments, 0, "", results);
  return results;
}

function filePattern(segment: string): RegExp {
  return new RegExp(`^${segment.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*")}$`);
}

function walk(root: string, segments: readonly string[], index: number, relPrefix: string, results: string[]): void {
  if (index >= segments.length) return;
  const segment = segments[index];
  if (segment === undefined) return;
  const isLast = index === segments.length - 1;
  if (segment.includes("**")) {
    // ** 単独セグメントのみ許容（本基盤の glob 生成元は設定スキーマ検証済み）。
    if (segment !== "**") return;
    const baseRel = relPrefix.length === 0 ? root : path.join(root, ...relPrefix.split("/"));
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(baseRel, { withFileTypes: true }) as fs.Dirent[];
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name === ".git" || entry.name === "node_modules") continue;
      const childRel = relPrefix.length === 0 ? entry.name : `${relPrefix}/${entry.name}`;
      if (entry.isDirectory()) {
        walk(root, segments, index, childRel, results);
        walk(root, segments, index + 1, childRel, results);
      } else if (isLast) {
        results.push(childRel);
      } else {
        // ** が末尾でない場合、残りセグメントがこのファイル名に一致すれば対象
        // （docs/**\/*.md が docs/a.md にも一致する 0 ディレクトリ区間のケース）
        const nextIndex = index + 1;
        if (nextIndex === segments.length - 1) {
          const nextSeg = segments[nextIndex];
          if (nextSeg !== undefined && filePattern(nextSeg).test(entry.name)) {
            results.push(childRel);
          }
        }
      }
    }
    return;
  }
  const pattern = filePattern(segment);
  const baseRel = relPrefix.length === 0 ? root : path.join(root, ...relPrefix.split("/"));
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(baseRel, { withFileTypes: true }) as fs.Dirent[];
  } catch {
    return;
  }
  for (const entry of entries) {
    if (!pattern.test(entry.name)) continue;
    const childRel = relPrefix.length === 0 ? entry.name : `${relPrefix}/${entry.name}`;
    if (entry.isDirectory()) {
      if (!isLast) walk(root, segments, index + 1, childRel, results);
    } else if (isLast) {
      results.push(childRel);
    }
  }
}
