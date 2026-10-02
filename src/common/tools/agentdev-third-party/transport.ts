// third-party Skill 取得のトランスポート境界。
//
// 取得トランスポートの実装判断（Design third-party-skill-management
// 「Design で確定する実装判断」）: git 依存なしの HTTPS 取得とする。
// ZIP 展開チェックアウト（.git なし、git-less 環境）でも動作する。
// 単一ファイルは raw HTTPS、ディレクトリ一覧は GitHub contents API を使用する。
//
// 実装詳細（HTTP 取得、Accept ヘッダ等）はこの境界の内側に隠蔽され、
// 契約（acquisition.ts）を利用する呼び出し側には現れない。テストは
// endpoints を差し替えたローカル mock サーバを注入できる。


/** ソース上の1エントリ（ディレクトリ走査の結果）。 */
export interface SourceEntry {
  /** エントリ名（Skill ディレクトリ相対のパス構成要素）。 */
  readonly name: string;
  /** リポジトリ相対のフルパス。 */
  readonly repoPath: string;
  readonly type: "file" | "dir";
}

export type FetchFileResult =
  | { readonly ok: true; readonly content: Uint8Array }
  | { readonly ok: false; readonly error: string };

export type ListDirectoryResult =
  | { readonly ok: true; readonly entries: readonly SourceEntry[] }
  | { readonly ok: false; readonly error: string };

/** GitHub 実装の接続先（本番は GitHub、テストはローカル mock）。 */
export interface GitHubFetcherEndpoints {
  /** raw contents のベース URL。既定: https://raw.githubusercontent.com */
  readonly rawBaseUrl: string;
  /** gist raw のベース URL。既定: https://gist.githubusercontent.com */
  readonly gistRawBaseUrl: string;
  /** contents API のベース URL。既定: https://api.github.com */
  readonly apiBaseUrl: string;
}

/** 取得トランスポート境界。実装は構造化要求を実際の HTTP 取得へ写像する。 */
export interface SourceFetcher {
  /** 接続先（URL 構築は呼び出し側が endpoints を用いて行う）。 */
  readonly endpoints: GitHubFetcherEndpoints;
  /** 指定 URL のファイル内容を取得する。 */
  fetchFile(url: string): Promise<FetchFileResult>;
  /** 指定 URL（ディレクトリ）の直下エントリ一覧を取得する。 */
  listDirectory(url: string): Promise<ListDirectoryResult>;
}

const DEFAULT_ENDPOINTS: GitHubFetcherEndpoints = {
  rawBaseUrl: "https://raw.githubusercontent.com",
  gistRawBaseUrl: "https://gist.githubusercontent.com",
  apiBaseUrl: "https://api.github.com",
};

/**
 * GitHub 実装の SourceFetcher。raw HTTPS（単一ファイル）と contents API
 * （ディレクトリ一覧）を使用し、git に依存しない。
 */
export function createGitHubSourceFetcher(endpoints?: Partial<GitHubFetcherEndpoints>): SourceFetcher {
  const resolved: GitHubFetcherEndpoints = {
    rawBaseUrl: trimTrailingSlash(endpoints?.rawBaseUrl ?? DEFAULT_ENDPOINTS.rawBaseUrl),
    gistRawBaseUrl: trimTrailingSlash(endpoints?.gistRawBaseUrl ?? DEFAULT_ENDPOINTS.gistRawBaseUrl),
    apiBaseUrl: trimTrailingSlash(endpoints?.apiBaseUrl ?? DEFAULT_ENDPOINTS.apiBaseUrl),
  };

  return {
    endpoints: resolved,

    async fetchFile(url: string): Promise<FetchFileResult> {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          return { ok: false, error: `HTTP ${response.status} for ${url}` };
        }
        const buffer = await response.arrayBuffer();
        return { ok: true, content: new Uint8Array(buffer) };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    },

    async listDirectory(url: string): Promise<ListDirectoryResult> {
      let response: Response;
      try {
        response = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
      if (!response.ok) {
        return { ok: false, error: `HTTP ${response.status} for ${url}` };
      }
      let body: unknown;
      try {
        body = await response.json();
      } catch (e) {
        return { ok: false, error: `contents API reply is not JSON: ${e instanceof Error ? e.message : String(e)}` };
      }
      if (!Array.isArray(body)) {
        return { ok: false, error: `contents API reply is not an array: ${url}` };
      }
      const entries: SourceEntry[] = [];
      for (const raw of body) {
        if (typeof raw !== "object" || raw === null) {
          return { ok: false, error: `contents API entry is not an object: ${url}` };
        }
        const obj = raw as Record<string, unknown>;
        const name = obj.name;
        const repoPath = obj.path;
        const type = obj.type;
        if (typeof name !== "string" || typeof repoPath !== "string") {
          return { ok: false, error: `contents API entry lacks name/path: ${url}` };
        }
        if (type !== "file" && type !== "dir") {
          // symlink / submodule は取得対象外（Skill ディレクトリ外への参照となり得るため）
          continue;
        }
        entries.push({ name, repoPath, type });
      }
      return { ok: true, entries };
    },
  };
}

/** contents API URL の構築（ディレクトリ一覧用）。 */
export function buildContentsApiUrl(apiBase: string, owner: string, repo: string, ref: string, dir: string): string {
  const pathPart = dir.length > 0 ? `/${dir}` : "";
  return `${apiBase}/repos/${owner}/${repo}/contents${pathPart}?ref=${encodeURIComponent(ref)}`;
}

/** raw URL の構築（ディレクトリ配下のファイル用）。 */
export function buildRawFileUrl(rawBase: string, owner: string, repo: string, ref: string, repoPath: string): string {
  return `${rawBase}/${owner}/${repo}/${ref}/${repoPath}`;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}
