// source URL 形式判定（Design third-party-skill-management「Design で確定する
// 実装判断」: source URL 形式判定規則）。
//
// 判定規則（決定論的）:
//   1. URL パス末尾が SKILL.md（クエリ・フラグメント除去後）→ 単一ファイル型
//   2. github.com/{owner}/{repo}/blob/{ref}/{path} → 単一ファイル型（SKILL.md
//      の blob URL。SKILL.md 以外の blob URL はプロファイル非対応として拒否）
//   3. github.com/{owner}/{repo}/tree/{ref}/{path} → ディレクトリ型
//   4. raw.githubusercontent.com/{owner}/{repo}/{ref}/{path} → 末尾 SKILL.md
//      のみ単一ファイル型。raw はディレクトリ一覧が不能なため、その他は拒否
//   5. 上記以外 → 判定不能（取得しない）
//
// ref は最初のパスセグメントとして解釈する（スラッシュを含むブランチ名は
// 宣言側で URL エンコードすることを前提とする運用規約）。
//
// 取得トランスポートが git に依存しないことは、ZIP 展開チェックアウト
// （.git なし、git-less 環境）との整合条件である。本判定も GitHub HTTPS
// URL のみを扱い、git clone URL（git@、.git 末尾）は対応しない。


import type { AcquisitionProfile } from "./contracts.ts";

/** 判定済み source。取得トランスポートが消費する構造化形式。 */
export interface ResolvedSource {
  readonly profile: AcquisitionProfile;
  readonly owner: string;
  readonly repo: string;
  readonly ref: string;
  /** Skill ディレクトリのリポジトリ相対パス（先頭・末尾の / なし）。単一ファイル型は空文字列。 */
  readonly dir: string;
  /** 単一ファイル型の SKILL.md リポジトリ相対パス。ディレクトリ型は空文字列。 */
  readonly path: string;
  /** 単一ファイル型の正規化済み SKILL.md raw URL（表示・provenance 用。取得は fetcher.endpoints 経由で行う）。 */
  readonly rawUrl: string;
  /** 宣言に記録された元 URL（provenance 記録用）。 */
  readonly sourceUrl: string;
}

export type SourceResolution =
  | { readonly ok: true; readonly source: ResolvedSource }
  | { readonly ok: false; readonly detail: string };

const GITHUB_HOST = "github.com";
const RAW_HOST = "raw.githubusercontent.com";

interface ParsedGitHubPath {
  readonly owner: string;
  readonly repo: string;
  readonly rest: readonly string[];
}

function parseGitHubPathSegments(pathname: string): ParsedGitHubPath | null {
  const segments = pathname.split("/").filter((s) => s.length > 0);
  if (segments.length < 2) return null;
  const [owner, repo, ...rest] = segments;
  if (owner === undefined || repo === undefined) return null;
  return { owner, repo, rest };
}

function trimSlashes(value: string): string {
  return value.replace(/^\/+/, "").replace(/\/+$/, "");
}

/** source URL を判定・正規化する。判定不能な source は取得しない（fail-closed）。 */
export function resolveSourceUrl(rawUrl: string): SourceResolution {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { ok: false, detail: `source is not a valid URL: ${rawUrl}` };
  }
  if (url.protocol !== "https:") {
    return { ok: false, detail: `source must be an https:// URL: ${rawUrl}` };
  }

  const host = url.hostname.toLowerCase();
  const parsed = parseGitHubPathSegments(url.pathname);
  if (parsed === null) {
    return { ok: false, detail: `source URL has no owner/repo path: ${rawUrl}` };
  }
  const { owner, repo, rest } = parsed;

  const lastSegment = rest[rest.length - 1] ?? "";
  const endsWithSkillMd = decodeURIComponent(lastSegment).endsWith("SKILL.md");

  if (host === RAW_HOST) {
    // raw.githubusercontent.com/{owner}/{repo}/{ref}/{path}
    const [ref, ...pathSegments] = rest;
    if (ref === undefined || pathSegments.length === 0) {
      return { ok: false, detail: `raw source URL must point at a file: ${rawUrl}` };
    }
    if (!endsWithSkillMd) {
      return {
        ok: false,
        detail: `raw source URL can only reference SKILL.md (directory listing is not available via raw): ${rawUrl}`,
      };
    }
    const path = trimSlashes(pathSegments.join("/"));
    return {
      ok: true,
      source: {
        profile: "single-file",
        owner,
        repo,
        ref,
        dir: "",
        path,
        rawUrl: buildRawUrl(owner, repo, ref, path),
        sourceUrl: rawUrl,
      },
    };
  }

  if (host === GITHUB_HOST) {
    const [kind, ref, ...pathSegments] = rest;
    if (kind === "blob") {
      if (!endsWithSkillMd) {
        return {
          ok: false,
          detail: `blob source URL must reference SKILL.md (use a tree URL for a Skill directory): ${rawUrl}`,
        };
      }
      if (ref === undefined || pathSegments.length === 0) {
        return { ok: false, detail: `blob source URL must include ref and path: ${rawUrl}` };
      }
      const path = trimSlashes(pathSegments.join("/"));
      return {
        ok: true,
        source: {
          profile: "single-file",
          owner,
          repo,
          ref,
          dir: "",
          path,
          rawUrl: buildRawUrl(owner, repo, ref, path),
          sourceUrl: rawUrl,
        },
      };
    }
    if (kind === "tree") {
      if (ref === undefined) {
        return { ok: false, detail: `tree source URL must include a ref: ${rawUrl}` };
      }
      const dir = trimSlashes(pathSegments.join("/"));
      if (dir.length === 0) {
        return {
          ok: false,
          detail: `tree source URL must point at the Skill directory (repository root is not a Skill directory): ${rawUrl}`,
        };
      }
      return {
        ok: true,
        source: {
          profile: "directory",
          owner,
          repo,
          ref,
          dir,
          path: "",
          rawUrl: "",
          sourceUrl: rawUrl,
        },
      };
    }
    return {
      ok: false,
      detail: `unsupported github.com URL kind "${kind ?? ""}" (expected blob/tree): ${rawUrl}`,
    };
  }

  return {
    ok: false,
    detail: `unsupported source host "${host}" (expected github.com or raw.githubusercontent.com): ${rawUrl}`,
  };
}

function buildRawUrl(owner: string, repo: string, ref: string, path: string): string {
  return `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path}`;
}
