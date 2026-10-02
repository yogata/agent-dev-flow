// agentdev-gh-tool Plugin（Custom Tool `agentdev_gh` の harness 登録配線）。
//
// OpenCode のプラグイン機構（.opencode/plugins/ 直下の depth-1 ファイルから読み込まれる）
// 経由で、agentdev-gh Custom Tool をモデルに公開する。Plugin は登録の配線のみを担い、
// 操作契約・fail-closed ゲート・VERIFY は Tool engine（src/common/tools/agentdev-gh/）が所有する。
//
// 実行の差し替え（REQ-{NNNN}-{NNN} / DEC-{NNN}）:
//   - 既定: GitHub 実装（runner-cli.ts）で gh CLI を実行する
//   - ローカル版: 投影パス（.opencode/tools/agentdev-gh/runner-local.ts）に Local 実装が
//     存在する場合（install -LocalMode により junction 先が src/common/tools/agentdev-gh/local/
//     に差し替わっている場合）は、それを動的に読み込んで差し替える。Workflow は差を認識しない
//
// args スキーマは zod を用いない（依存ゼロの構造的定義）。OpenCode の registry は
// 非 zod の args を JSON Schema として扱う legacy 経路で登録する。入力の検証は
// Tool 本体（runAgentdevGhOperation）が操作契約で厳密に行う。


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
// host 非依存の公開スキーマ・リポジトリ解決は Tool engine 領域の正本を参照する（ホスト別複製を持たない）。
import { AGENTDEV_GH_REQUEST_PROPERTY_SCHEMA as REQUEST_PROPERTY_SCHEMA } from "../../../common/tools/agentdev-gh/public-schema.ts";
import {
  defaultResolveRepo,
  REPO_ENV,
  type RepoResolution,
  type RepoResolveDiagnostics,
} from "../../../common/tools/agentdev-gh/repo-resolution.ts";
import type { GhRunner } from "../../../common/tools/agentdev-gh/runner.ts";

// 公開名・公開型は旧 plugin 定義名のまま維持（既存の参照・テスト互換）。
export { AGENTDEV_GH_REQUEST_PROPERTY_SCHEMA as REQUEST_PROPERTY_SCHEMA } from "../../../common/tools/agentdev-gh/public-schema.ts";
export type { RepoResolution, RepoResolveDiagnostics } from "../../../common/tools/agentdev-gh/repo-resolution.ts";

// OpenCode plugin plumbing 型（@opencode-ai/plugin 1.x と同じ形状。
// 本 plugin が消費するフィールドのみ宣言する。依存ゼロを保つため直接 import しない）。

export type PluginInput = {
  readonly worktree: string;
  readonly directory: string;
  readonly [key: string]: unknown;
};

export type PluginHooks = Record<string, unknown>;

export type PluginServer = (input: PluginInput) => Promise<PluginHooks>;

export type ToolContext = {
  readonly sessionID: string;
  readonly directory: string;
  readonly worktree: string;
  readonly [key: string]: unknown;
};

export type ToolResultObject = {
  readonly title?: string;
  readonly output: string;
  readonly metadata?: Record<string, unknown>;
};

/** 依存の注入点（テストは偽実装を差し込める）。 */
export interface AgentdevGhToolDeps {
  /** リポジトリ（owner/name）の解決。失敗時は null。既定は gh repo view と環境変数。診断情報付き失敗は RepoResolution で返す。 */
  readonly resolveRepo?: () => string | RepoResolution | null;
  /** 実行の構築。既定は投影パスの Local 実装検出 → GitHub 実装。 */
  readonly createRunner?: (worktree: string, repo: string) => GhRunner | Promise<GhRunner>;
  readonly now?: () => Date;
}

/** リポジトリ解決失敗時の診断情報（解決手続き導線と併せて failure detail へ転記する）。 */
export type RepoResolveDiagnostics = {
  /** 試行した解決手段（環境変数、gh repo view の順）。 */
  readonly attemptedMeans: readonly string[];
  /** gh repo view の終了コード（起動不能・シグナル終了時は null）。 */
  readonly ghExitCode: number | null;
  /** gh repo view の stderr 要因の要約（最初の非空行・切詰め）。 */
  readonly ghStderrSummary: string;
};

const LOCAL_RUNNER_PROJECTION = path.join(".opencode", "tools", "agentdev-gh", "runner-local.ts");

async function defaultCreateRunner(worktree: string, repo: string): Promise<GhRunner> {
  const localPath = path.join(worktree, LOCAL_RUNNER_PROJECTION);
  if (fs.existsSync(localPath)) {
    const mod = (await import(pathToFileURL(localPath).href)) as {
      createLocalRunner?: (options: { issuesDir: string }) => GhRunner;
    };
    if (typeof mod.createLocalRunner === "function") {
      return mod.createLocalRunner({ issuesDir: path.join(worktree, ".agentdev", "issues") });
    }
  }
  return createCliRunner({ repo, tempDir: os.tmpdir() });
}

function describeOperations(): string {
  return AGENTDEV_GH_PUBLIC_CONTRACTS.map(
    (c) => `${c.operation} (${c.sideEffect ? "side-effect, fail-closed" : "read-only, canContinue"})`,
  ).join(", ");
}

/** 登録する Tool 定義（構造的定義。zod 非依存）。 */
export function createAgentdevGhToolDefinition(deps: AgentdevGhToolDeps = {}): {
  readonly description: string;
  readonly args: Record<string, unknown>;
  readonly execute: (args: { request?: unknown }, context: ToolContext) => Promise<ToolResultObject>;
} {
  let cachedRunner: GhRunner | null = null;
  let cachedRepo: string | null = null;

  async function runnerFor(worktree: string): Promise<GhRunner | { error: string }> {
    if (cachedRunner !== null && cachedRepo !== null) return cachedRunner;
    const resolution = deps.resolveRepo ? deps.resolveRepo() : defaultResolveRepo(worktree);
    const repo = typeof resolution === "string" ? resolution : (resolution?.repo ?? null);
    if (repo === null) {
      const diagnostics =
        resolution !== null && typeof resolution !== "string" && resolution.repo === null
          ? resolution.diagnostics
          : undefined;
      let detail = `cannot resolve the target repository (set ${REPO_ENV}=owner/name or run inside a gh repo)`;
      if (diagnostics !== undefined) {
        detail +=
          `; attempted: ${diagnostics.attemptedMeans.join(", ")}` +
          `; gh repo view exitCode=${String(diagnostics.ghExitCode)}` +
          `; gh repo view stderr cause: ${diagnostics.ghStderrSummary}`;
      }
      return { error: detail };
    }
    const create = deps.createRunner ?? defaultCreateRunner;
    const runner = await create(worktree, repo);
    cachedRunner = runner;
    cachedRepo = repo;
    return runner;
  }

  return {
    description:
      "Structured GitHub issue/PR operations with a verified operation contract. " +
      "Operations: " +
      describeOperations() +
      ". Every side-effect operation is read back and verified before success is returned; " +
      "verification failures never return success (fail-closed).",
    args: {
      request: REQUEST_PROPERTY_SCHEMA,
    },
    async execute(args, context) {
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
        { tempDir: () => os.tmpdir() },
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

/** Plugin 実装（hooks として custom tool を登録する）。 */
export function createAgentdevGhToolPlugin(
  deps: AgentdevGhToolDeps = {},
): PluginServer {
  return async () => ({
    tool: {
      agentdev_gh: createAgentdevGhToolDefinition(deps),
    },
  });
}

const server: PluginServer = createAgentdevGhToolPlugin();

export default server;
