// agentdev-gh-tool Plugin（Custom Tool `agentdev_gh` の harness 登録配線）。
//
// OpenCode のプラグイン機構（.opencode/plugins/ 直下の depth-1 ファイルから読み込まれる）
// 経由で、agentdev-gh Custom Tool をモデルに公開する。Plugin は登録の配線のみを担い、
// 操作契約・fail-closed ゲート・VERIFY は Tool 本体（src/opencode/tools/agentdev-gh/）が所有する。
//
// 実行の差し替え（REQ-011-006 / DEC-004）:
//   - 既定: GitHub 実装（runner-cli.ts）で gh CLI を実行する
//   - ローカル版: 投影パス（.opencode/tools/agentdev-gh/runner-local.ts）に Local 実装が
//     存在する場合（install -LocalMode により junction 先が src/opencode-local/agentdev-gh-cli/
//     に差し替わっている場合）は、それを動的に読み込んで差し替える。Workflow は差を認識しない
//
// args スキーマは zod を用いない（依存ゼロの構造的定義）。OpenCode の registry は
// 非 zod の args を JSON Schema として扱う legacy 経路で登録する。入力の検証は
// Tool 本体（runAgentdevGhOperation）が操作契約で厳密に行う。


import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import {
  AGENTDEV_GH_PUBLIC_CONTRACTS,
  runAgentdevGhOperation,
} from "../../tools/agentdev-gh/index.ts";
import { createCliRunner } from "../../tools/agentdev-gh/runner-cli.ts";
import { buildGhToolEnv } from "../../tools/agentdev-gh/engine.ts";
import type { GhRunner } from "../../tools/agentdev-gh/runner.ts";

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

/** 操作要求の公開スキーマ（JSON Schema）。正の契約は Tool の contracts.ts が所有する。 */
const REQUEST_PROPERTY_SCHEMA = {
  type: "object",
  description:
    "Structured GitHub issue/PR operation request. See the agentdev_gh operation contract " +
    "(issue_create, issue_read, issue_update, issue_comment, issue_close, pr_create, pr_read, " +
    "pr_merge, pr_changed_files, pr_mergeable). Side-effect operations are verified by read-back " +
    "before success is returned (fail-closed).",
  properties: {
    operation: {
      type: "string",
      enum: [
        "issue_create",
        "issue_read",
        "issue_update",
        "issue_comment",
        "issue_close",
        "pr_create",
        "pr_read",
        "pr_merge",
        "pr_changed_files",
        "pr_mergeable",
      ],
      description: "Operation name from the agentdev_gh operation catalog.",
    },
    number: { type: "integer", minimum: 1, description: "Issue/PR (or Case) number." },
    title: { type: "string", description: "Title for issue_create / issue_update / pr_create." },
    body: { type: "string", description: "Markdown body for write operations." },
    labels: { type: "array", items: { type: "string" }, description: "Labels for issue_create." },
    reason: { type: "string", enum: ["completed", "not_planned"], description: "Close reason for issue_close." },
    base: { type: "string", description: "Base branch for pr_create." },
    head: { type: "string", description: "Head branch for pr_create." },
    draft: { type: "boolean", description: "Draft flag for pr_create." },
    method: { type: "string", enum: ["merge", "squash", "rebase"], description: "Merge method for pr_merge." },
  },
  required: ["operation"],
  additionalProperties: false,
} as const;

/** 依存の注入点（テストは偽実装を差し込める）。 */
export interface AgentdevGhToolDeps {
  /** リポジトリ（owner/name）の解決。失敗時は null。既定は gh repo view と環境変数。 */
  readonly resolveRepo?: () => string | null;
  /** 実行の構築。既定は投影パスの Local 実装検出 → GitHub 実装。 */
  readonly createRunner?: (worktree: string, repo: string) => GhRunner | Promise<GhRunner>;
  readonly now?: () => Date;
}

const REPO_ENV = "AGENTDEV_GH_REPO";
const LOCAL_RUNNER_PROJECTION = path.join(".opencode", "tools", "agentdev-gh", "runner-local.ts");

function resolveRepoFromGh(worktree: string): string | null {
  const r = spawnSync("gh", ["repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner"], {
    encoding: "utf8",
    cwd: worktree,
    maxBuffer: 1024 * 1024,
  });
  if (r.status !== 0 || typeof r.stdout !== "string") return null;
  const repo = r.stdout.trim();
  return /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo) ? repo : null;
}

function defaultResolveRepo(worktree: string): string | null {
  const fromEnv = process.env[REPO_ENV];
  if (fromEnv !== undefined && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(fromEnv)) {
    return fromEnv;
  }
  return resolveRepoFromGh(worktree);
}

async function defaultCreateRunner(worktree: string, repo: string): Promise<GhRunner> {
  const localPath = path.join(worktree, LOCAL_RUNNER_PROJECTION);
  if (fs.existsSync(localPath)) {
    const mod = (await import(pathToFileURL(localPath).href)) as {
      createLocalRunner?: (options: { casesDir: string }) => GhRunner;
    };
    if (typeof mod.createLocalRunner === "function") {
      return mod.createLocalRunner({ casesDir: path.join(worktree, ".agentdev", "cases") });
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
    const repo = deps.resolveRepo ? deps.resolveRepo() : defaultResolveRepo(worktree);
    if (repo === null) {
      return { error: `cannot resolve the target repository (set ${REPO_ENV}=owner/name or run inside a gh repo)` };
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
