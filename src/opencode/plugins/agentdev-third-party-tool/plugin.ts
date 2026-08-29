// agentdev-third-party-tool Plugin（Custom Tool `agentdev_third_party` の
// harness 登録配線）。
//
// OpenCode のプラグイン機構（.opencode/plugins/ 直下の depth-1 ファイルから
// 読み込まれる）経由で、third-party Skill 取得 Custom Tool をモデルに公開する。
// Plugin は登録の配線のみを担い、操作契約・非破壊配置・fail-closed ゲート・
// VERIFY は Tool 本体（src/opencode/tools/agentdev-third-party/）が所有する。
//
// args スキーマは zod を用いない（依存ゼロの構造的定義）。入力の検証は
// Tool 本体（runAgentdevThirdPartyOperation）が操作契約で厳密に行う。


import * as os from "node:os";
import * as path from "node:path";
import {
  AGENTDEV_THIRD_PARTY_TOOL_DESCRIPTION,
  AGENTDEV_THIRD_PARTY_TOOL_NAME,
  buildTpToolEnv,
  createGitHubSourceFetcher,
  runAgentdevThirdPartyOperation,
} from "../../tools/agentdev-third-party/index.ts";
import type { SourceFetcher } from "../../tools/agentdev-third-party/index.ts";

// OpenCode plugin plumbing 型（本 plugin が消費するフィールドのみ宣言する）。

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
    "Structured third-party Skill acquisition request. Acquires skills declared in " +
    "src/third-party/skills.yaml into .opencode/skills/<name>/. " +
    "Single SKILL.md sources are normalized to .opencode/skills/<name>/SKILL.md; " +
    "GitHub Skill directory sources are acquired recursively preserving the relative structure " +
    "(nothing outside the Skill directory is acquired). Existing unmanaged placements with the " +
    "same name are never overwritten (refused, not skipped). The placement is verified by " +
    "read-back before success is returned; verification failures never return success (fail-closed). " +
    "On failure the pre-acquisition state is restored and the failure causes are reported.",
  properties: {
    operation: {
      type: "string",
      enum: ["acquire"],
      description: "Operation name from the agentdev_third_party operation catalog.",
    },
    skill: {
      type: "string",
      description: "Target skill name from the declaration. Omit to acquire all declared skills.",
    },
    dryRun: {
      type: "boolean",
      description:
        "When true, no acquisition runs; returns the plan (targets, placement paths, unmanaged conflicts).",
    },
  },
  required: ["operation"],
  additionalProperties: false,
} as const;

/** 依存の注入点（テストは偽実装を差し込める）。 */
export interface AgentdevThirdPartyToolDeps {
  /** 宣言ファイルのパス解決。既定は worktree 配下の src/third-party/skills.yaml。 */
  readonly resolveDeclarationPath?: (worktree: string) => string;
  /** 配置先ルート（.opencode/skills）の解決。既定は worktree 配下。 */
  readonly resolveSkillsRoot?: (worktree: string) => string;
  /** 一時領域の解決。既定は OS 一時ディレクトリ配下。 */
  readonly tmpDir?: () => string;
  /** 取得トランスポートの構築。既定は GitHub 実装。 */
  readonly createFetcher?: () => SourceFetcher;
}

/** 登録する Tool 定義（構造的定義。zod 非依存）。 */
export function createAgentdevThirdPartyToolDefinition(deps: AgentdevThirdPartyToolDeps = {}): {
  readonly description: string;
  readonly args: Record<string, unknown>;
  readonly execute: (args: { request?: unknown }, context: ToolContext) => Promise<ToolResultObject>;
} {
  return {
    description: AGENTDEV_THIRD_PARTY_TOOL_DESCRIPTION,
    args: {
      request: REQUEST_PROPERTY_SCHEMA,
    },
    async execute(args, context) {
      const raw = args?.request;
      const operation =
        typeof raw === "object" && raw !== null && "operation" in raw
          ? String((raw as Record<string, unknown>).operation)
          : null;

      const declarationPath = deps.resolveDeclarationPath
        ? deps.resolveDeclarationPath(context.worktree)
        : path.join(context.worktree, "src", "third-party", "skills.yaml");
      const skillsRoot = deps.resolveSkillsRoot
        ? deps.resolveSkillsRoot(context.worktree)
        : path.join(context.worktree, ".opencode", "skills");
      const tmp = deps.tmpDir ?? os.tmpdir;
      const createFetcher = deps.createFetcher ?? (() => createGitHubSourceFetcher());

      const env = buildTpToolEnv(
        { declarationPath, skillsRoot },
        {
          skillsRoot: (candidates) => candidates.find((c) => path.isAbsolute(c)) ?? null,
          stagingRoot: () => path.join(tmp(), "agentdev-third-party"),
        },
        createFetcher(),
      );
      if (!env.ok) {
        return {
          title: `${AGENTDEV_THIRD_PARTY_TOOL_NAME} ${operation ?? "?"} failed (${env.failure.kind})`,
          output: JSON.stringify({ ok: false, failure: env.failure }, null, 2),
          metadata: { ok: false, operation },
        };
      }

      const result = await runAgentdevThirdPartyOperation(env.env, raw);
      const report = result.ok ? result.success.report : result.report;
      const summaryText = report
        ? `requested=${report.summary.requested} succeeded=${report.summary.succeeded} failed=${report.summary.failed} refused=${report.summary.refused}`
        : "";
      return {
        title: result.ok
          ? `${AGENTDEV_THIRD_PARTY_TOOL_NAME} acquire ok (${summaryText})`
          : `${AGENTDEV_THIRD_PARTY_TOOL_NAME} ${operation ?? "?"} failed (${result.failure.kind})`,
        output: JSON.stringify(
          result.ok ? { ok: true, success: result.success } : { ok: false, failure: result.failure, report: result.report },
          null,
          2,
        ),
        metadata: { ok: result.ok, operation },
      };
    },
  };
}

/** Plugin 実装（hooks として custom tool を登録する）。 */
export function createAgentdevThirdPartyToolPlugin(
  deps: AgentdevThirdPartyToolDeps = {},
): PluginServer {
  return async () => ({
    tool: {
      [AGENTDEV_THIRD_PARTY_TOOL_NAME]: createAgentdevThirdPartyToolDefinition(deps),
    },
  });
}

const server: PluginServer = createAgentdevThirdPartyToolPlugin();

export default server;
