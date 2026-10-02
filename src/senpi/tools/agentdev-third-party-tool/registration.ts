// Senpi 向け Custom Tool `agentdev_third_party` の登録単位。
//
// 操作契約・非破壊配置・fail-closed ゲート・VERIFY は Tool engine
// （src/common/tools/agentdev-third-party/）が所有し、本モジュールは Tool 登録単位と、
// 引数（host 非依存公開スキーマの参照）、結果・実行 context の変換のみを担う。
//
// 実行 context 変換: 配置先ルート（skillsRoot）は Senpi 向けに解決する
// （OpenCode の .opencode/skills とは異なるホスト配置。仮確定、Design確定候補参照）。
// 宣言ファイルの解決（src/third-party/skills.yaml 優先、.agentdev/third-party/skills.yaml
// へのフォールバック）は両ホスト共通である。

import * as os from "node:os";
import * as path from "node:path";
import {
  AGENTDEV_THIRD_PARTY_TOOL_DESCRIPTION,
  AGENTDEV_THIRD_PARTY_TOOL_NAME,
  buildTpToolEnv,
  createGitHubSourceFetcher,
  resolveDeclarationPath,
  runAgentdevThirdPartyOperation,
} from "../../../common/tools/agentdev-third-party/index.ts";
import { AGENTDEV_THIRD_PARTY_REQUEST_PROPERTY_SCHEMA } from "../../../common/tools/agentdev-third-party/public-schema.ts";
import type { SenpiToolContext, SenpiToolDefinition, SenpiToolResult } from "../tool-registration.ts";

/** Senpi 向け skills 取得先（worktree 相対。仮確定、Design確定候補参照）。 */
export const SENPI_SKILLS_ROOT = path.join(".senpi", "skills");

/** 依存の注入点（テストは偽実装を差し込める）。 */
export interface AgentdevThirdPartySenpiDeps {
  /** 宣言ファイルのパス解決。既定は2候補解決（engine の cli.ts と同一解決）。 */
  readonly resolveDeclarationPath?: (worktree: string) => string;
  /** 配置先ルートの解決。既定は worktree 配下の SENPI_SKILLS_ROOT。 */
  readonly resolveSkillsRoot?: (worktree: string) => string;
  /** 一時領域の解決。既定は OS 一時ディレクトリ配下。 */
  readonly tmpDir?: () => string;
  /** 取得トランスポートの構築。既定は GitHub 実装。 */
  readonly createFetcher?: () => ReturnType<typeof createGitHubSourceFetcher>;
}

/** 登録する Tool 定義（host 非依存の構造的定義。zod 非依存）。 */
export function createAgentdevThirdPartySenpiRegistration(
  deps: AgentdevThirdPartySenpiDeps = {},
): SenpiToolDefinition {
  return {
    name: AGENTDEV_THIRD_PARTY_TOOL_NAME,
    description: AGENTDEV_THIRD_PARTY_TOOL_DESCRIPTION,
    args: {
      request: AGENTDEV_THIRD_PARTY_REQUEST_PROPERTY_SCHEMA,
    },
    async execute(args, context: SenpiToolContext): Promise<SenpiToolResult> {
      const raw = args?.request;
      const operation =
        typeof raw === "object" && raw !== null && "operation" in raw
          ? String((raw as Record<string, unknown>).operation)
          : null;

      const declarationPath = deps.resolveDeclarationPath
        ? deps.resolveDeclarationPath(context.worktree)
        : resolveDeclarationPath(context.worktree);
      const skillsRoot = deps.resolveSkillsRoot
        ? deps.resolveSkillsRoot(context.worktree)
        : path.join(context.worktree, SENPI_SKILLS_ROOT);
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
