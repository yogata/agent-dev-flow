// Senpi 向け Custom Tool `agentdev_jev` の登録単位。
//
// 操作契約・正規化・失敗の構造化・観測の形式検証は Tool engine
// （src/common/tools/agentdev-jev/）が所有し、本モジュールは Tool 登録単位と、
// 引数（host 非依存公開スキーマの参照）、結果・実行 context の変換のみを担う。
// provider 接続は Tool 本体が動的解決する（adapter パッケージ不在環境では
// not_configured）。Jev 障害時の判定・継続契約の正は Custom Tool 操作契約
// Design「Jev 先行評価」節である。

import {
  AGENTDEV_JEV_PUBLIC_CONTRACTS,
  runAgentdevJevOperation,
} from "../../../common/tools/agentdev-jev/index.ts";
import { AGENTDEV_JEV_REQUEST_PROPERTY_SCHEMA } from "../../../common/tools/agentdev-jev/public-schema.ts";
import type { SenpiToolContext, SenpiToolDefinition, SenpiToolResult } from "../tool-registration.ts";

/** 依存の注入点（テストは偽実装を差し込める）。 */
export interface AgentdevJevSenpiDeps {
  readonly resolveProvider?: () => unknown;
  readonly now?: () => number;
}

/** 登録する Tool 定義（host 非依存の構造的定義。zod 非依存）。 */
export function createAgentdevJevSenpiRegistration(deps: AgentdevJevSenpiDeps = {}): SenpiToolDefinition {
  return {
    name: "agentdev_jev",
    description:
      "Jev prior evaluation with a verified provider/SDK-independent operation contract. " +
      "Operations: " +
      AGENTDEV_JEV_PUBLIC_CONTRACTS.map((c) => `${c.operation} (side-effect, fail-closed)`).join(", ") +
      ". When the credentials are unset the tool returns a distinct not_configured failure without calling " +
      "the API and workflows continue on the legacy LLM path; API failures are never auto-retried and are returned " +
      "as structured failures.",
    args: {
      request: AGENTDEV_JEV_REQUEST_PROPERTY_SCHEMA,
    },
    async execute(args, context: SenpiToolContext): Promise<SenpiToolResult> {
      const raw = args?.request;
      const operation =
        typeof raw === "object" && raw !== null && "operation" in raw
          ? String((raw as Record<string, unknown>).operation)
          : null;
      const result = await runAgentdevJevOperation(
        context.worktree,
        raw,
        deps as Parameters<typeof runAgentdevJevOperation>[2],
      );
      const ok = result.ok;
      return {
        title: ok
          ? `agentdev_jev ${"operation" in result ? result.operation : (operation ?? "?")} ok`
          : `agentdev_jev ${operation ?? "?"} failed (${result.ok ? "unexpected" : result.failure.kind})`,
        output: JSON.stringify(result, null, 2),
        metadata: { ok, operation },
      };
    },
  };
}
