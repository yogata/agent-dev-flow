// ADF-COVERS(implementation): REQ-053-025, REQ-053-026, REQ-053-029, REQ-053-032, REQ-053-039
// agentdev-textlint-guard 共通実行基盤: 対象解決。
//
// 標準対象は docs/**/*.md とする。追加対象はルート相対の glob として標準対象へ
// 加算する（加算設定によって標準対象を無効化できない）。対象は常に「標準 + 追加」
// の和集合である。対象外ファイルだけの正常な操作には一般文章検査を適用しない。
//
// 解決順（Design「プロジェクトと対象の解決」が所有する契約）:
// 1. 標準対象の解決結果から機構固定の既定除外パターンを除外する
//    （node_modules は依存成果物、歴史記録サブツリー retired/reports は ADF の
//    文書配置規約に基づく歴史記録として除外する）
// 2. 追加対象（加算設定）は歴史記録サブツリーの既定除外に優先する。導入先が同じ
//    パスを現行文書として使う場合は明示的な加算で検査対象に再包含される
// 3. node_modules は依存成果物として機構固定で除外し、加算設定でも再包含しない
//    （glob の ** 展開が依存配置に入り込む場合も対象外とする）
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

/** 機構固定の既定除外パターン（Design「プロジェクトと対象の解決」が所有）。 */
export const DEFAULT_EXCLUSIONS: readonly string[] = [
  "**/node_modules/**",
  "docs/requirements/retired/**",
  "docs/reports/**",
];

const NODE_MODULES_EXCLUDED = globToRegExp("**/node_modules/**");

/** ルート相対 glob → 正規表現（区切り / 固定）。**\/ は「0以上のディレクトリ区間」とする。 */
export function globToRegExp(glob: string): RegExp {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  const withStars = escaped.replace(/\*\*\/|\*\*|\*/g, (m) =>
    m === "**/" ? "(?:.*/)?" : m === "**" ? ".*" : "[^/]*",
  );
  return new RegExp(`^${withStars}$`);
}

/** ルート相対パス（/ 区切り）が機構固定の既定除外に該当するか。 */
export function isExcludedByDefault(rootRelativePosix: string): boolean {
  return DEFAULT_EXCLUSIONS.some((glob) => globToRegExp(glob).test(rootRelativePosix));
}

/**
 * ルート相対パス（/ 区切り）が検査対象かどうか。
 * 解決順: 追加対象（加算設定）は歴史記録サブツリーの既定除外に優先し、node_modules
 * は依存成果物として加算設定でも対象外とする（設計契約による）。
 */
export function isTargetPath(rootRelativePosix: string, config: GuardConfig): boolean {
  if (!rootRelativePosix.endsWith(".md")) return false;
  if (NODE_MODULES_EXCLUDED.test(rootRelativePosix)) return false;
  if (config.additionalTargets.some((glob) => globToRegExp(glob).test(rootRelativePosix))) return true;
  if (isExcludedByDefault(rootRelativePosix)) return false;
  return DEFAULT_TARGETS.some((glob) => globToRegExp(glob).test(rootRelativePosix));
}

/** 対象ファイルの列挙（最終検査入口用）。実ファイル全件を対象 glob で収集する。 */
export function enumerateTargetFiles(root: string, config: GuardConfig): string[] {
  const collected = new Set<string>();
  for (const glob of DEFAULT_TARGETS) {
    for (const rel of collectGlob(root, glob, true)) {
      collected.add(rel);
    }
  }
  for (const glob of config.additionalTargets) {
    for (const rel of collectGlob(root, glob, false)) {
      collected.add(rel);
    }
  }
  return [...collected].sort();
}

/** 1 glob の列挙。既定除外の適用対象（標準対象）は除外パターン配下を走査しない。 */
function collectGlob(root: string, glob: string, applyDefaultExclusions: boolean): string[] {
  const found = walkGlob(root, glob, applyDefaultExclusions);
  if (!applyDefaultExclusions) return found;
  return found.filter((rel) => !isExcludedByDefault(rel));
}

function walkGlob(root: string, glob: string, applyDefaultExclusions: boolean): string[] {
  const segments = glob.split("/");
  const results: string[] = [];
  walk(root, segments, 0, "", results, applyDefaultExclusions);
  return results;
}

function filePattern(segment: string): RegExp {
  return new RegExp(`^${segment.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*")}$`);
}

function walk(
  root: string,
  segments: readonly string[],
  index: number,
  relPrefix: string,
  results: string[],
  applyDefaultExclusions: boolean,
): void {
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
        walk(root, segments, index, childRel, results, applyDefaultExclusions);
        walk(root, segments, index + 1, childRel, results, applyDefaultExclusions);
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
      if (!isLast) walk(root, segments, index + 1, childRel, results, applyDefaultExclusions);
    } else if (isLast) {
      results.push(childRel);
    }
  }
}
