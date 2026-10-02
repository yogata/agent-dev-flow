// agentdev-gh Custom Tool の対象リポジトリ解決（host 非依存）。
//
// リポジトリ解決（環境変数 → gh repo view の順、診断情報付き失敗）は runner 構築前の
// 構成解決であり、OpenCode（plugins/agentdev-gh-tool）と Senpi（src/senpi/tools/）
// の両ホスト接続が本モジュールを参照する（ホスト別複製を持たない）。

import { spawnSync } from "node:child_process";

export const REPO_ENV = "AGENTDEV_GH_REPO";
const REPO_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

/** リポジトリ解決失敗時の診断情報（解決手続き導線と併せて failure detail へ転記する）。 */
export type RepoResolveDiagnostics = {
  /** 試行した解決手段（環境変数、gh repo view の順）。 */
  readonly attemptedMeans: readonly string[];
  /** gh repo view の終了コード（起動不能・シグナル終了時は null）。 */
  readonly ghExitCode: number | null;
  /** gh repo view の stderr 要因の要約（最初の非空行・切詰め）。 */
  readonly ghStderrSummary: string;
};

/** リポジトリ解決の結果。解決順（環境変数 → gh repo view）は変更しない。 */
export type RepoResolution =
  | { readonly repo: string }
  | { readonly repo: null; readonly diagnostics: RepoResolveDiagnostics };

/** 外部コマンド出力の要因要約（最初の非空行、200文字で切詰め）。 */
function summarizeCause(text: unknown): string {
  if (typeof text !== "string") return "(unavailable)";
  const firstLine = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line !== "");
  if (firstLine === undefined) return "(empty)";
  return firstLine.length > 200 ? `${firstLine.slice(0, 200)}...` : firstLine;
}

function resolveRepoFromGh(worktree: string): {
  repo: string | null;
  exitCode: number | null;
  cause: string;
} {
  const r = spawnSync("gh", ["repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner"], {
    encoding: "utf8",
    cwd: worktree,
    maxBuffer: 1024 * 1024,
  });
  const cause = r.error !== undefined ? summarizeCause(r.error.message) : summarizeCause(r.stderr);
  if (r.status !== 0 || typeof r.stdout !== "string") {
    return { repo: null, exitCode: r.status, cause };
  }
  const repo = r.stdout.trim();
  if (!REPO_PATTERN.test(repo)) {
    return { repo: null, exitCode: r.status, cause: `unexpected output: ${summarizeCause(r.stdout)}` };
  }
  return { repo, exitCode: r.status, cause };
}

export function defaultResolveRepo(worktree: string): RepoResolution {
  const fromEnv = process.env[REPO_ENV];
  if (fromEnv !== undefined && REPO_PATTERN.test(fromEnv)) {
    return { repo: fromEnv };
  }
  const envMean =
    fromEnv === undefined
      ? `${REPO_ENV} environment variable (not set)`
      : `${REPO_ENV} environment variable (set but invalid format)`;
  const gh = resolveRepoFromGh(worktree);
  if (gh.repo !== null) return { repo: gh.repo };
  return {
    repo: null,
    diagnostics: {
      attemptedMeans: [envMean, "gh repo view"],
      ghExitCode: gh.exitCode,
      ghStderrSummary: gh.cause,
    },
  };
}
