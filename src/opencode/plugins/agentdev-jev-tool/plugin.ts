// agentdev-jev-tool Plugin（Custom Tool `agentdev_jev` の harness 登録配線）。
//
// OpenCode の plugin 機構（.opencode/plugins/ 直下の depth-1 ファイルから読み込まれる）
// 経由で、agentdev-jev Custom Tool をモデルへ公開する。Plugin は登録の配線のみを担い、
// 操作契約・正規化・失敗の構造化・観測の形式検証は Tool engine
// （src/common/tools/agentdev-jev/）が所有する。
//
// 公開スキーマは provider・SDK 非依存（REQ-{NNNN}-{NNN}）。provider 接続（現行 Cloudflare
// adapter）は Tool 本体が動的解決し、credential（CLOUDFLARE_ACCOUNT_ID と
// CLOUDFLARE_API_TOKEN）未設定時は呼び出さず not_configured を返す。Jev 障害時の
// 判定・継続契約の正は Custom Tool 操作契約 Design「Jev 先行評価」節である。
//
// args スキーマは zod を用いない（依存ゼロの構造的定義）。入力の検証は
// Tool 本体（runAgentdevJevOperation）が操作契約で厳密に行う。

import {
  AGENTDEV_JEV_PUBLIC_CONTRACTS,
  runAgentdevJevOperation,
} from "../../../common/tools/agentdev-jev/index.ts";
import { validateFinalResultObservation } from "../../../common/tools/agentdev-jev/observation.ts";
// host 非依存の公開スキーマは Tool engine 領域の正本を参照する（ホスト別複製を持たない）。
import { AGENTDEV_JEV_REQUEST_PROPERTY_SCHEMA as REQUEST_PROPERTY_SCHEMA } from "../../../common/tools/agentdev-jev/public-schema.ts";

// 公開名は旧 plugin 定義名のまま維持（既存の参照・テスト互換）。
export { AGENTDEV_JEV_REQUEST_PROPERTY_SCHEMA as REQUEST_PROPERTY_SCHEMA } from "../../../common/tools/agentdev-jev/public-schema.ts";

// OpenCode plugin plumbing 型（agentdev-gh-tool plugin と同一の構造的定義。依存ゼロを保つ）。

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

/** 登録する Tool 定義（構造的定義。zod 非依存）。 */
export function createAgentdevJevToolDefinition(deps: {
  resolveProvider?: () => unknown;
  now?: () => number;
} = {}): {
  readonly description: string;
  readonly args: Record<string, unknown>;
  readonly execute: (args: { request?: unknown }, context: ToolContext) => Promise<ToolResultObject>;
} {
  return {
    description:
      "Jev prior evaluation with a verified provider/SDK-independent operation contract. " +
      "Operations: " +
      AGENTDEV_JEV_PUBLIC_CONTRACTS.map((c) => `${c.operation} (side-effect, fail-closed)`).join(", ") +
      ". When the credentials are unset the tool returns a distinct not_configured failure without calling " +
      "the API and workflows continue on the legacy LLM path; API failures are never auto-retried and are returned " +
      "as structured failures. One semantic evaluation = one observation: evaluate persists the observation (one " +
      "JSON per evaluation) under .agentdev/jev-observations/ right after the evaluator succeeds — before the " +
      "caller proceeds to the reasoning model — and persists a failure observation when a call fails after " +
      "starting; not_configured and input validation failures generate no observation. observation_write appends " +
      "the reasoning model's final judgment to an evaluator-success observation. Observation persistence failures " +
      "stay an independent warning on the evaluation result (fail-open) and observation writes are independent of " +
      "workflow success. Conditional evaluation trigger control: the caller generates a follow-up semantic " +
      "evaluation only when the parent judgment's final confirmed result satisfies the trigger condition (a Jev " +
      "prior result of the parent judgment alone never triggers it); when the condition is not met the caller " +
      "composes neither the follow-up questions nor any observation, so this tool generates an observation only " +
      "when it is actually invoked. Observation identifier stability: continuing the same semantic judgment keeps " +
      "the workflow, evaluationKind, and questionId identifiers; when the judgment subject, result space, or " +
      "criteria changes meaning (or judgments are merged) new questionIds are required; input and contract " +
      "version differences are distinguished by sourceRevision and requestDigest; existing observations are never " +
      "migrated, rewritten, or re-keyed.",
    args: {
      request: REQUEST_PROPERTY_SCHEMA,
    },
    async execute(args, context) {
      const raw = args?.request;
      const operation =
        typeof raw === "object" && raw !== null && "operation" in raw
          ? String((raw as Record<string, unknown>).operation)
          : null;
      const result = await runAgentdevJevOperation(context.worktree, raw, deps as Parameters<typeof runAgentdevJevOperation>[2]);
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

export { validateFinalResultObservation };

/** Plugin 実装（hooks として custom tool を登録する）。 */
export function createAgentdevJevToolPlugin(deps: {
  resolveProvider?: () => unknown;
  now?: () => number;
} = {}): PluginServer {
  return async () => ({
    tool: {
      agentdev_jev: createAgentdevJevToolDefinition(deps),
    },
  });
}

const server: PluginServer = createAgentdevJevToolPlugin();

export default server;
