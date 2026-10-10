// 正規成果物コーパスの直接走査（agentdev-traceability Design「実装構成」の実装）。
//
// - root 配下を再帰走査し、拡張子に合致する通常ファイルの宣言をその場で解決する
// - inline declaration の走査対象は producer-only artifact の .md / .ts
//   （checker 実行契約 Design の走査対象方針）
// - `docs/reports/` 配下（監査・評価・観測の Report）は履歴記録領域として走査対象から
//   除外する（checker 実行契約 Design「検出対象除外規定」の正規列挙に従う除外。
//   Report 文書内の要件行 ID 参照は歴史記録として対応関係管理対象外）
// - top-level traceability/ 配下の YAML（component / package 単位 sidecar）も
//   走査対象とし、inline と同一の論理対応関係へ正規化して declarations に統合する
//   （policy.yaml は検証スコープポリシーであり verification_scope.ts が正規所有するため
//   sidecar 走査から除外する。checker 実行契約 Design の traceability corpus 走査対象方針）
// - `.agentdev/graph/` 等の派生 Graph を必須入力・必須生成物としない
// - シンボリックリンク・ジャンクションのディレクトリは降下しない
// - 列挙順は名前順で決定的とし、相対パスはフォワードスラッシュで返す
// - 読取に失敗したファイルは読取不能ファイルとして報告する（evidence-unavailable 検査の入力）。
//   sidecar ファイルの読取失敗は sidecarIssues（unreadable-sidecar）で報告する
//   （sidecar は対応関係の情報源であり成果物パスではないため evidence 計上から分離する）

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { parseDeclarations } from "./declarations.ts";
import type { CoverDeclaration, DeclarationIssue } from "./declarations.ts";
import { parseLinkDeclarations } from "./links.ts";
import type { LinkRelation, LinkIssue } from "./links.ts";
import { parseSidecar, TRACEABILITY_DIR } from "./sidecar.ts";
import type { SidecarIssue } from "./sidecar.ts";

export const DEFAULT_SCAN_EXTENSIONS = [".md", ".ts"] as const;
export const SIDECAR_SCAN_EXTENSIONS = [".yaml", ".yml"] as const;
export const POLICY_FILE_REL = `${TRACEABILITY_DIR}/policy.yaml`;
export const DEFAULT_EXCLUDE_DIRS = [
  ".git",
  ".agentdev",
  ".agentdev-plugin",
  ".worktrees",
  "node_modules",
] as const;
export const DEFAULT_EXCLUDE_DIR_PATHS = ["docs/reports"] as const;

export interface ScanOptions {
  readonly extensions?: readonly string[];
  readonly excludeDirs?: readonly string[];
  readonly excludeDirPaths?: readonly string[];
}

export interface SidecarMissingArtifact {
  /** sidecar が参照する artifact のリポジトリ相対パス。 */
  readonly artifact: string;
  /** 当該参照を保持する sidecar ファイル。 */
  readonly sidecarFile: string;
}

export interface LinkMissingArtifact {
  /** 存在しない links 参照先（source または target）のリポジトリ相対パス。 */
  readonly artifact: string;
  /** 参照先を宣言する側（sidecar links の source、または inline 宣言ファイルの target）。 */
  readonly linkFile: string;
  /** 参照の役目（source: 下流側 / target: 上流側）。 */
  readonly role: "source" | "target";
}

export interface ScanResult {
  readonly declarations: readonly CoverDeclaration[];
  readonly issues: readonly DeclarationIssue[];
  /** sidecar の解析 issues（構文不正・schema 不適合・読取不能。check の fail-closed 判定入力）。 */
  readonly sidecarIssues: readonly SidecarIssue[];
  /** sidecar が参照する artifact のうち存在しないもの（check の invalid-artifact-paths 入力）。 */
  readonly sidecarMissingArtifacts: readonly SidecarMissingArtifact[];
  /** 隣接工程間対応（inline 宣言 + sidecar links 正規化分）。 */
  readonly links: readonly LinkRelation[];
  /** links 宣言の解析 issues（形式不備・不明方向・sidecar links schema 不正）。 */
  readonly linkIssues: readonly LinkIssue[];
  /** links の source / target のうち存在しないもの（check の dangling-links 入力）。 */
  readonly linkMissingArtifacts: readonly LinkMissingArtifact[];
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
  excludeDirPaths: ReadonlySet<string>,
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
      if (excludeDirPaths.has(rel)) continue;
      walkFiles(rootDir, rel, extensions, excludeDirs, excludeDirPaths, out);
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
  const excludeDirPaths = new Set(options.excludeDirPaths ?? DEFAULT_EXCLUDE_DIR_PATHS);
  const out: string[] = [];
  walkFiles(
    root.replaceAll("\\", "/").replace(/\/$/, ""),
    "",
    extensions,
    excludeDirs,
    excludeDirPaths,
    out,
  );
  return out.sort();
}

export function enumerateSidecarFiles(root: string): readonly string[] {
  const out: string[] = [];
  walkFiles(
    root.replaceAll("\\", "/").replace(/\/$/, ""),
    TRACEABILITY_DIR,
    SIDECAR_SCAN_EXTENSIONS,
    new Set(DEFAULT_EXCLUDE_DIRS),
    new Set(DEFAULT_EXCLUDE_DIR_PATHS),
    out,
  );
  return out.sort();
}

/**
 * root 配下のコーパスを直接走査し、全対応宣言（inline + sidecar 正規化分）・
 * 解析 issues・sidecar 解析 issues・読取不能ファイルを返す。
 * sidecar 由来の対応宣言は inline と同一の論理対応関係へ正規化される
 * （file = sidecar 内の artifact パス、line = 0、source = sidecar）。
 */
export function scanCorpus(root: string, options: ScanOptions = {}): ScanResult {
  const declarations: CoverDeclaration[] = [];
  const issues: DeclarationIssue[] = [];
  const sidecarIssues: SidecarIssue[] = [];
  const sidecarMissingArtifacts: SidecarMissingArtifact[] = [];
  const links: LinkRelation[] = [];
  const linkIssues: LinkIssue[] = [];
  const linkMissingArtifacts: LinkMissingArtifact[] = [];
  const unreadableFiles: string[] = [];
  const files = enumerateCorpusFiles(root, options);
  for (const rel of files) {
    try {
      statSync(join(root, rel));
      const content = readFileSync(join(root, rel), "utf-8");
      const parsed = parseDeclarations(rel, content);
      declarations.push(...parsed.declarations);
      issues.push(...parsed.issues);
      const parsedLinks = parseLinkDeclarations(rel, content);
      links.push(...parsedLinks.links);
      linkIssues.push(...parsedLinks.issues);
    } catch {
      unreadableFiles.push(rel);
    }
  }
  for (const rel of enumerateSidecarFiles(root)) {
    // policy.yaml は検証スコープポリシーであり sidecar ではない
    if (rel === POLICY_FILE_REL) continue;
    try {
      statSync(join(root, rel));
      const content = readFileSync(join(root, rel), "utf-8");
      const parsed = parseSidecar(rel, content);
      sidecarIssues.push(...parsed.issues);
      for (const relation of parsed.relations) {
        declarations.push({
          role: relation.role,
          reqIds: relation.reqIds,
          file: relation.artifact,
          line: 0,
          source: "sidecar",
          sourceFile: rel,
        });
        let artifactStat;
        try {
          artifactStat = statSync(join(root, relation.artifact));
        } catch {
          artifactStat = undefined;
        }
        if (artifactStat === undefined || !artifactStat.isFile()) {
          sidecarMissingArtifacts.push({ artifact: relation.artifact, sidecarFile: rel });
        }
      }
      links.push(...parsed.links);
      linkIssues.push(...parsed.linkIssues);
      for (const link of parsed.links) {
        for (const [path, role] of [
          [link.source, "source"],
          [link.target, "target"],
        ] as const) {
          let targetStat;
          try {
            targetStat = statSync(join(root, path));
          } catch {
            targetStat = undefined;
          }
          if (targetStat === undefined || !targetStat.isFile()) {
            linkMissingArtifacts.push({ artifact: path, linkFile: rel, role });
          }
        }
      }
    } catch {
      sidecarIssues.push({
        reason: "unreadable-sidecar",
        file: rel,
        detail: "sidecar ファイルを読み取れない",
      });
    }
  }
  for (const link of links) {
    if (link.origin !== "inline") continue;
    // inline 宣言の source は宣言ファイル自身（実在自明）。target のみ存在確認する
    let targetStat;
    try {
      targetStat = statSync(join(root, link.target));
    } catch {
      targetStat = undefined;
    }
    if (targetStat === undefined || !targetStat.isFile()) {
      linkMissingArtifacts.push({ artifact: link.target, linkFile: link.source, role: "target" });
    }
  }
  return {
    declarations,
    issues,
    sidecarIssues,
    sidecarMissingArtifacts,
    links,
    linkIssues,
    linkMissingArtifacts,
    unreadableFiles,
    fileCount: files.length,
  };
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
