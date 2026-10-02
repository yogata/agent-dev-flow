// テスト用 GitHub 互換 mock ソース（ローカル HTTP サーバ）。
//
// 外部ネットワークに依存しない再現可能な検証のため、raw contents と
// contents API の最小互換を Bun.serve で提供する。


export interface MockSourceSpec {
  /** リポジトリ相対パス → ファイル内容。 */
  readonly files: ReadonlyMap<string, string>;
  /** ディレクトリとして存在するリポジトリ相対パス。 */
  readonly directories: ReadonlySet<string>;
  /** 取得が失敗する（HTTP 500 を返す）リポジトリ相対パス。 */
  readonly failPaths?: ReadonlySet<string>;
  readonly owner?: string;
  readonly repo?: string;
  readonly ref?: string;
  /** gist raw エンドポイントで提供するファイル（gist 相対パス → 内容）。 */
  readonly gistFiles?: ReadonlyMap<string, string>;
  readonly gistUser?: string;
  readonly gistId?: string;
}

export interface MockSourceServer {
  readonly rawBaseUrl: string;
  readonly gistRawBaseUrl: string;
  readonly apiBaseUrl: string;
  readonly owner: string;
  readonly repo: string;
  readonly ref: string;
  /** デバッグ用の要求記録。 */
  readonly requests: string[];
  stop(): Promise<void>;
}

const JSON_HEADERS = { "Content-Type": "application/json" };

/** GitHub raw / contents API の最小互換 mock を起動する。 */
export async function startMockGitHubSource(spec: MockSourceSpec): Promise<MockSourceServer> {
  const owner = spec.owner ?? "mock-owner";
  const repo = spec.repo ?? "mock-repo";
  const ref = spec.ref ?? "main";
  const requests: string[] = [];

  const server = Bun.serve({
    port: 0,
    fetch(request) {
      const url = new URL(request.url);
      requests.push(url.pathname + url.search);

      const isContentsApi = url.pathname.startsWith(`/repos/${owner}/${repo}/contents`);
      if (isContentsApi) {
        const dirParam = url.pathname.slice(`/repos/${owner}/${repo}/contents`.length).replace(/^\/+|\/+$/g, "");
        const requestRef = url.searchParams.get("ref") ?? "";
        if (requestRef !== ref) {
          return new Response(JSON.stringify({ message: "ref not found" }), { status: 404, headers: JSON_HEADERS });
        }
        if (spec.failPaths?.has(dirParam)) {
          return new Response(JSON.stringify({ message: "simulated failure" }), { status: 500, headers: JSON_HEADERS });
        }
        const entries = new Array<Record<string, unknown>>();
        const prefix = dirParam.length > 0 ? `${dirParam}/` : "";
        for (const [repoPath] of spec.files) {
          if (!repoPath.startsWith(prefix)) continue;
          const rest = repoPath.slice(prefix.length);
          if (rest.includes("/")) continue;
          entries.push({ name: rest, path: repoPath, type: "file" });
        }
        for (const dirPath of spec.directories) {
          if (!dirPath.startsWith(prefix)) continue;
          const rest = dirPath.slice(prefix.length);
          if (rest.includes("/")) continue;
          entries.push({ name: rest, path: dirPath, type: "dir" });
        }
        return new Response(JSON.stringify(entries), { status: 200, headers: JSON_HEADERS });
      }

      const rawPrefix = `/${owner}/${repo}/${ref}/`;
      if (url.pathname.startsWith(rawPrefix)) {
        const repoPath = url.pathname.slice(rawPrefix.length).replace(/\/+$/g, "");
        if (spec.failPaths?.has(repoPath)) {
          return new Response("simulated failure", { status: 500 });
        }
        const content = spec.files.get(repoPath);
        if (content !== undefined) {
          return new Response(content, { status: 200, headers: { "Content-Type": "text/plain" } });
        }
        return new Response("not found", { status: 404 });
      }

      const gistUser = spec.gistUser ?? "gist-user";
      const gistId = spec.gistId ?? "gist123";
      const gistRawPrefix = `/${gistUser}/${gistId}/raw/`;
      if (spec.gistFiles !== undefined && url.pathname.startsWith(gistRawPrefix)) {
        const gistPath = url.pathname.slice(gistRawPrefix.length).replace(/\/+$/g, "");
        const gistContent = spec.gistFiles.get(gistPath);
        if (gistContent !== undefined) {
          return new Response(gistContent, { status: 200, headers: { "Content-Type": "text/plain" } });
        }
        return new Response("not found", { status: 404 });
      }

      return new Response("not found", { status: 404 });
    },
  });

  const address = `http://127.0.0.1:${server.port}`;
  return {
    rawBaseUrl: address,
    gistRawBaseUrl: address,
    apiBaseUrl: address,
    owner,
    repo,
    ref,
    requests,
    async stop() {
      server.stop(true);
    },
  };
}
