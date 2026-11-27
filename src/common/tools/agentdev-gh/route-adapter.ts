// agentdev-gh Custom Tool のホスト接続 adapter 共通部（GitHub 実行経路の解決と runner 選択）。
//
// Custom Tool を登録できないホスト（Codex・Antigravity）の adapter が共通に持つ
// 処理（対象リポジトリ解決、実行経路の解決、gh 経路の事前認証確認、runner 選択、
// engine 実行）を所有する。ホスト固有の差し替え（PluginMapping と
// PluginTransport の構築）は deps.createPluginRunnerOf として各ホスト接続領域が渡す。
//
// 経路は導入先リポジトリの .agentdev/config/github-route.json から解決する。
// 記録のないホストは plugin 扱い、設定が読めない・不正な場合は経路を推定せず
// GitHub 操作の前に停止する（config-uninterpretable）。gh 経路は操作前に
// gh repo view で対象リポジトリへの認証と権限を確認し、失敗すれば同じく停止する。
// いずれの失敗も暗黙の経路切り替えを行わない（切替は利用者判断による
// scripts/switch-github-route.ps1 のみ）。

import * as os from "node:os";
import type { GhToolResult } from "./contracts.ts";
import { buildGhToolEnv } from "./engine.ts";
import { runAgentdevGhOperation } from "./index.ts";
import {
  resolveGithubRoute,
  type GithubRouteHost,
  type GithubRouteResolution,
} from "./github-route.ts";
import { createCliRunner, defaultGhExec, type GhExec } from "./runner-cli.ts";
import { defaultResolveRepo, type RepoResolution } from "./repo-resolution.ts";
import type { GhRunner } from "./runner.ts";

/** adapter の差し替え点（テストは偽実装を差し込める）。 */
export interface AgentdevGhRouteAdapterDeps {
  /** 経路設定を持つホスト（設定ファイルのキー）。 */
  readonly host: GithubRouteHost;
  /** プラグイン経路の runner 構築（mapping と transport は各ホスト接続領域が組む）。 */
  readonly createPluginRunnerOf: (repo: string) => GhRunner;
  /** 対象リポジトリ（owner/name）の解決。既定は環境変数 → gh repo view。 */
  readonly resolveRepo?: (worktree: string) => RepoResolution;
  /** 実行経路の解決。既定は worktree を導入先リポジトリ root とした設定読み取り。 */
  readonly resolveRoute?: (worktree: string) => Promise<GithubRouteResolution>;
  /** gh の実行（gh 経路の事前確認と CliRunner の実行）。既定は実 gh。 */
  readonly execGh?: GhExec;
  readonly tmpDir?: () => string;
}

const NO_CONTINGENCY = { fallbacks: [], canContinue: false } as const;

function configFailure(detail: string): GhToolResult {
  return {
    ok: false,
    failure: {
      kind: "config-uninterpretable",
      retryable: false,
      detail,
      contingency: NO_CONTINGENCY,
    },
  };
}

/** gh repo view による gh 経路の事前確認（認証と対象リポジトリへの権限）。 */
function preflightGhRepo(
  exec: GhExec,
  repo: string,
): { ok: true } | { ok: false; detail: string } {
  const r = exec("gh", ["repo", "view", repo, "--json", "nameWithOwner"]);
  if (r.status === 0) return { ok: true };
  const stderr = r.stderr.trim();
  return {
    ok: false,
    detail:
      `gh route preflight failed for ${repo} (exit ${r.status ?? "null"}): ` +
      (stderr.length > 0
        ? stderr
        : "(empty stderr; check gh authentication and the AGENTDEV_GH_REPO setting)"),
  };
}

/** 1 操作を経路解決から engine 実行まで通す（失敗はすべて構造化 GhToolResult）。 */
export async function runAgentdevGhRouteAdapter(
  deps: AgentdevGhRouteAdapterDeps,
  worktree: string,
  rawRequest: unknown,
): Promise<GhToolResult> {
  const resolveRepo = deps.resolveRepo ?? defaultResolveRepo;
  const resolution = resolveRepo(worktree);
  if (resolution.repo === null) {
    const d = resolution.diagnostics;
    return configFailure(
      `cannot resolve the target repository (tried ${d.attemptedMeans.join(", ")}; ` +
        `gh exit ${d.ghExitCode ?? "n/a"}: ${d.ghStderrSummary}); ` +
        "set AGENTDEV_GH_REPO=owner/name or run inside a gh repository",
    );
  }
  const repo = resolution.repo;
  const resolveRoute =
    deps.resolveRoute ?? ((root: string) => resolveGithubRoute(root, deps.host));
  const route = await resolveRoute(worktree);
  if (!route.ok) {
    return configFailure(
      `the GitHub execution route for ${deps.host} is not resolvable (${route.kind}: ${route.detail}); ` +
        "fix or remove .agentdev/config/github-route.json before any GitHub operation",
    );
  }
  let runner: GhRunner;
  if (route.route === "gh") {
    const exec = deps.execGh ?? defaultGhExec();
    const preflight = preflightGhRepo(exec, repo);
    if (!preflight.ok) {
      return configFailure(
        `${preflight.detail}; the gh route requires authentication and permission ` +
          "for the target repository before any GitHub operation",
      );
    }
    runner = createCliRunner({
      repo,
      tempDir: deps.tmpDir?.() ?? os.tmpdir(),
      workspaceRoot: worktree,
      ...(deps.execGh !== undefined ? { exec: deps.execGh } : {}),
    });
  } else {
    runner = deps.createPluginRunnerOf(repo);
  }
  const env = buildGhToolEnv(
    { repo },
    { tempDir: () => deps.tmpDir?.() ?? os.tmpdir() },
    runner,
  );
  if (!env.ok) {
    return { ok: false, failure: env.failure };
  }
  return runAgentdevGhOperation(env.env, rawRequest, { cwd: worktree });
}

/** ホスト接続の操作契約 surface（共通 helper（four-combination-shared）と同じ呼出形式）。 */
export type AgentdevGhAdapterSurface = (
  args: { request: unknown },
  worktree: string,
) => Promise<{ output: string; metadata?: Record<string, unknown> }>;

/** deps から操作契約 surface を構築する。 */
export function createAgentdevGhRouteAdapterSurface(
  deps: AgentdevGhRouteAdapterDeps,
): AgentdevGhAdapterSurface {
  return async (args, worktree) => {
    const raw = args?.request;
    const operation =
      typeof raw === "object" && raw !== null && "operation" in raw
        ? String((raw as Record<string, unknown>).operation)
        : null;
    const result = await runAgentdevGhRouteAdapter(deps, worktree, raw);
    return {
      output: JSON.stringify(result, null, 2),
      metadata: { ok: result.ok, operation },
    };
  };
}
