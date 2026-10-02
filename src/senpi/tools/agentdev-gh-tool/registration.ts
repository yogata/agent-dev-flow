// Senpi 向け Custom Tool `agentdev_gh` の登録単位。
//
// 操作契約・fail-closed ゲート・VERIFY は Tool engine（src/common/tools/agentdev-gh/）が
// 所有し、本モジュールは Tool 登録単位と、引数（host 非依存公開スキーマの参照）、
// 結果（SenpiToolResult への直列化）、実行 context（worktree から runner 構築）の
// 変換のみを担う。
//
// バックエンド選択（単一選択。両バックエンドの同時有効化は行わない）:
//   - 既定: GitHub 実装（runner-cli.ts）で gh CLI を実行する
//   - ローカル版: Senpi 向け投影パスに Local 実装（runner-local.ts）が存在する場合、
//     それを動的に読み込んで差し替える。Workflow は差を認識しない
//
// 公開スキーマ・リポジトリ解決は host 非依存の正本（public-schema.ts、
// repo-resolution.ts）を参照する（ホスト別複製を持たない）。

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import {
  AGENTDEV_GH_PUBLIC_CONTRACTS,
  runAgentdevGhOperation,
} from "../../../common/tools/agentdev-gh/index.ts";
import { createCliRunner } from "../../../common/tools/agentdev-gh/runner-cli.ts";
import { buildGhToolEnv } from "../../../common/tools/agentdev-gh/engine.ts";
import { AGENTDEV_GH_REQUEST_PROPERTY_SCHEMA } from "../../../common/tools/agentdev-gh/public-schema.ts";
import { defaultResolveRepo, type RepoResolution } from "../../../common/tools/agentdev-gh/repo-resolution.ts";
import type { GhRunner } from "../../../common/tools/agentdev-gh/runner.ts";
import type { SenpiToolContext, SenpiToolDefinition, SenpiToolResult } from "../tool-registration.ts";

/** Senpi 向け Local 実装の投影パス（worktree 相対。仮確定、Design確定候補参照）。 */
export const LOCAL_RUNNER_PROJECTION = path.join(".senpi", "tools", "agentdev-gh", "runner-local.ts");

/** 依存の注入点（テストは偽実装を差し込める）。 */
export interface AgentdevGhSenpiDeps {
  /** リポジトリ（owner/name）の解決。失敗時は null。既定は gh repo view と環境変数。 */
  readonly resolveRepo?: () => string | RepoResolution | null;
  /** 実行の構築。既定は投影パスの Local 実装検出 → GitHub 実装。 */
  readonly createRunner?: (worktree: string, repo: string) => GhRunner | Promise<GhRunner>;
  /** Local 実装投影パスの検出。既定は worktree 配下の LOCAL_RUNNER_PROJECTION。 */
  readonly detectLocalRunner?: (worktree: string) => string | null;
  readonly tmpDir?: () => string;
}

function defaultDetectLocalRunner(worktree: string): string | null {
  const localPath = path.join(worktree, LOCAL_RUNNER_PROJECTION);
  return fs.existsSync(localPath) ? localPath : null;
}

function createDefaultRunner(
  detectLocalRunner: (worktree: string) => string | null,
): (worktree: string, repo: string) => Promise<GhRunner> {
  return async (worktree: string, repo: string): Promise<GhRunner> => {
    const localPath = detectLocalRunner(worktree);
    if (localPath !== null) {
      const mod = (await import(pathToFileURL(localPath).href)) as {
        createLocalRunner?: (options: { issuesDir: string }) => GhRunner;
      };
      if (typeof mod.createLocalRunner === "function") {
        return mod.createLocalRunner({ issuesDir: path.join(worktree, ".agentdev", "issues") });
      }
    }
    return createCliRunner({ repo, tempDir: os.tmpdir() });
  };
}

function describeOperations(): string {
  return AGENTDEV_GH_PUBLIC_CONTRACTS.map(
    (c) => `${c.operation} (${c.sideEffect ? "side-effect, fail-closed" : "read-only, canContinue"})`,
  ).join(", ");
}

/** 登録する Tool 定義（host 非依存の構造的定義。zod 非依存）。 */
export function createAgentdevGhSenpiRegistration(deps: AgentdevGhSenpiDeps = {}): SenpiToolDefinition {
  // 単一 runner のみ構築・保持する（バックエンドの同時有効化を行わない構造の中心）。
  let cachedRunner: GhRunner | null = null;
  let cachedRepo: string | null = null;

  async function runnerFor(worktree: string): Promise<GhRunner | { error: string }> {
    if (cachedRunner !== null && cachedRepo !== null) return cachedRunner;
    const resolution = deps.resolveRepo ? deps.resolveRepo() : defaultResolveRepo(worktree);
    const repo = typeof resolution === "string" ? resolution : (resolution?.repo ?? null);
    if (repo === null) {
      return { error: `cannot resolve the target repository (set AGENTDEV_GH_REPO=owner/name or run inside a gh repo)` };
    }
    const create = deps.createRunner ?? createDefaultRunner(deps.detectLocalRunner ?? defaultDetectLocalRunner);
    cachedRunner = await create(worktree, repo);
    cachedRepo = repo;
    return cachedRunner;
  }

  return {
    name: "agentdev_gh",
    description:
      "Structured GitHub issue/PR operations with a verified operation contract. " +
      "Operations: " +
      describeOperations() +
      ". Every side-effect operation is read back and verified before success is returned; " +
      "verification failures never return success (fail-closed).",
    args: {
      request: AGENTDEV_GH_REQUEST_PROPERTY_SCHEMA,
    },
    async execute(args, context: SenpiToolContext): Promise<SenpiToolResult> {
      const raw = args?.request;
      const operation =
        typeof raw === "object" && raw !== null && "operation" in raw
          ? String((raw as Record<string, unknown>).operation)
          : null;
      const resolved = await runnerFor(context.worktree);
      if ("error" in resolved) {
        return {
          title: `agentdev_gh ${operation ?? "?"} failed (config-uninterpretable)`,
          output: JSON.stringify(
            {
              ok: false,
              failure: { kind: "config-uninterpretable", retryable: false, detail: resolved.error },
            },
            null,
            2,
          ),
          metadata: { ok: false, operation },
        };
      }
      const env = buildGhToolEnv(
        { repo: cachedRepo ?? "unresolved/repo" },
        { tempDir: () => deps.tmpDir?.() ?? os.tmpdir() },
        resolved,
      );
      if (!env.ok) {
        return {
          title: `agentdev_gh ${operation ?? "?"} failed (${env.failure.kind})`,
          output: JSON.stringify({ ok: false, failure: env.failure }, null, 2),
          metadata: { ok: false, operation },
        };
      }
      const result = await runAgentdevGhOperation(env.env, raw);
      const ok = result.ok;
      return {
        title: ok
          ? `agentdev_gh ${result.success.operation} ok`
          : `agentdev_gh ${operation ?? "?"} failed (${result.failure.kind})`,
        output: JSON.stringify(result, null, 2),
        metadata: { ok, operation },
      };
    },
  };
}
