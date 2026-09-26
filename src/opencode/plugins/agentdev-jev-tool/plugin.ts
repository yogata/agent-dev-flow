// agentdev-jev-tool Plugin（Custom Tool `agentdev_jev` の harness 登録配線）。
//
// OpenCode の plugin 機構（.opencode/plugins/ 直下の depth-1 ファイルから読み込まれる）
// 経由で、agentdev-jev Custom Tool をモデルへ公開する。Plugin は登録の配線のみを担い、
// 操作契約・正規化・失敗の構造化・観測の形式検証は Tool 本体
// （src/opencode/tools/agentdev-jev/）が所有する。
//
// 公開スキーマは provider・SDK 非依存（REQ-{NNNN}-{NNN}）。provider 接続（初期 Vercel
// adapter）は Tool 本体が動的解決し、API key（AI_GATEWAY_API_KEY）未設定時は
// 呼び出さず not_configured を返す。Jev 障害時も Workflow は従来 LLM 経路で
// 継続できる。
//
// args スキーマは zod を用いない（依存ゼロの構造的定義）。入力の検証は
// Tool 本体（runAgentdevJevOperation）が操作契約で厳密に行う。

import {
  AGENTDEV_JEV_PUBLIC_CONTRACTS,
  runAgentdevJevOperation,
} from "../../tools/agentdev-jev/index.ts";
import { validateFinalResultObservation } from "../../tools/agentdev-jev/observation.ts";

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

/** 評価リクエストの質問スキーマ（公開契約。質問型と boolean/choice/score の対応づけは adapter mapping）。 */
const QUESTION_SCHEMA = {
  type: "object",
  description:
    "One closed judgment question. Japanese prompt. form 'choice' requires 2+ unique options; form 'score' requires 2+ ordered scale levels.",
  properties: {
    id: { type: "string", description: "Question identifier, unique within the request." },
    form: {
      type: "string",
      enum: ["boolean", "choice", "score"],
      description: "Question form (independent proposition / exclusive options / ordered levels).",
    },
    prompt: { type: "string", description: "Question text (Japanese)." },
    options: {
      type: "array",
      items: { type: "string" },
      description: "Exclusive candidate labels (required for form=choice).",
    },
    scale: {
      type: "array",
      items: { type: "string" },
      description: "Ordered level labels from lowest (index 0) (required for form=score).",
    },
  },
  required: ["id", "form", "prompt"],
  additionalProperties: false,
} as const;

/** 再構成可能入力の参照（path + sha256 digest。判断入力全文は保存しない）。 */
const INPUT_REFERENCE_SCHEMA = {
  type: "object",
  description: "Reference to a reconstructable input (path + sha256 digest each).",
  properties: {
    label: { type: "string", description: "Short label of the reference." },
    path: { type: "string", description: "Repository-relative reference path." },
    digest: { type: "string", description: "sha256 hex digest (64 chars)." },
  },
  required: ["label", "path", "digest"],
  additionalProperties: false,
} as const;

/** evaluate の観測永続化に呼出し元が提供する識別 metadata スキーマ（workflow・評価種別は観測の一意識別に必須）。 */
const OBSERVATION_METADATA_SCHEMA = {
  type: "object",
  description:
    "Caller-provided identification metadata for the observation persisted by evaluate (evaluate only, required). " +
    "Each observation is one semantic evaluation (one JSON): workflow + evaluationKind identify the originating " +
    "workflow and the evaluation kind uniquely. sourceRevision is the concrete base revision; references/snapshot " +
    "keep inputs reconstructable without storing the full judgment input text.",
  properties: {
    workflow: { type: "string", description: "Originating workflow name (e.g. learning-promote)." },
    evaluationKind: { type: "string", description: "Evaluation kind identifier within the workflow." },
    subject: { type: "string", description: "Minimal identification of the judged subject (Japanese, no full text)." },
    sourceRevision: { type: "string", description: "Concrete source revision (e.g. git commit hash)." },
    references: {
      type: "array",
      description: "References to reconstructable inputs (path + sha256 digest each).",
      items: INPUT_REFERENCE_SCHEMA,
    },
    snapshot: {
      type: "string",
      description: "Minimal input snapshot for non-reconstructable inputs only.",
    },
  },
  required: ["workflow", "evaluationKind", "subject", "sourceRevision"],
  additionalProperties: false,
} as const;

/**
 * observation_write（observationId 付き）の入力スキーマ。
 * 実装受理条件と一致: 追記入力は reasoning model の最終判断結果（final result）のみを運び、
 * 評価側一次事実（results、confidence、durationMs、inputs 等）は evaluate 時点の観測に記録済みのため
 * 再送不可。1対1対応と差異理由条件の突合は実観測に対して Tool 本体が行う。
 */
const FINAL_RESULT_OBSERVATION_SCHEMA = {
  type: "object",
  description:
    "Final-judgment append input for observation_write WITH observationId. The evaluator-side primary facts " +
    "(results, confidence, durationMs, inputTokens, inputs) are already recorded in the observation persisted by " +
    "evaluate and are NOT accepted here. Send schemaVersion 2 and one finalResult whose results correspond " +
    "one-to-one with the evaluator results (questionId + canonical value). A differenceReason " +
    "(evaluation_input_defect | semantic_disagreement | deterministic_override | unknown) is recorded only when the " +
    "final judgment differs from the evaluator result; sending one on a match is rejected.",
  properties: {
    schemaVersion: { type: "integer", enum: [2], description: "Observation schema version (2)." },
    finalResult: {
      type: "object",
      description: "The reasoning model's final judgment per question (one-to-one with the evaluator results).",
      properties: {
        results: {
          type: "array",
          minItems: 1,
          description: "Per-question final judgments keyed by questionId of the evaluator results (append is idempotent).",
          items: {
            type: "object",
            properties: {
              questionId: {
                type: "string",
                minLength: 1,
                description: "Question identifier matching one evaluator result (non-empty).",
              },
              value: {
                description: "Final judgment value (boolean for form=boolean, candidate label for form=choice, level value for form=score).",
              },
              differenceReason: {
                type: "string",
                enum: ["evaluation_input_defect", "semantic_disagreement", "deterministic_override", "unknown"],
                description: "Difference reason classification. Accepted only when the value differs from the evaluator result.",
              },
            },
            required: ["questionId", "value"],
            additionalProperties: false,
          },
        },
      },
      required: ["results"],
      additionalProperties: false,
    },
  },
  required: ["schemaVersion", "finalResult"],
  additionalProperties: false,
} as const;

/** 操作要求の公開スキーマ（JSON Schema）。正の契約は Tool の contracts.ts が所有する。 */
export const REQUEST_PROPERTY_SCHEMA = {
  type: "object",
  description:
    "Structured Jev prior-evaluation operation request. See the agentdev_jev operation contract (evaluate, " +
    "observation_write). The public contract is provider- and SDK-independent. When the gateway credential " +
    "(AI_GATEWAY_API_KEY) is unset, evaluate returns a distinct not_configured failure without calling the API; " +
    "callers fall back to the legacy LLM path. No auto-retry on API failure. Evaluation language is Japanese. " +
    "One semantic evaluation = one observation: evaluate persists the observation (one JSON) under " +
    ".agentdev/jev-observations/ right after the evaluator succeeds (and a failure observation when the call " +
    "fails after starting; no observation for not_configured or input validation failures), and observation_write " +
    "appends the reasoning model's final judgment to an evaluator-success observation.",
  properties: {
    operation: {
      type: "string",
      enum: ["evaluate", "observation_write"],
      description: "Operation name from the agentdev_jev operation catalog.",
    },
    state: { type: "string", description: "Closed judgment input composed by the calling workflow (Japanese; never the whole repository text)." },
    instructions: { type: "string", description: "Evaluation instructions (Japanese)." },
    criteria: {
      type: "array",
      items: { type: "string" },
      description: "Evaluation criteria (Japanese, optional).",
    },
    questions: {
      type: "array",
      minItems: 1,
      items: QUESTION_SCHEMA,
      description: "Question batch for one closed judgment (evaluate only).",
    },
    observationMetadata: {
      ...OBSERVATION_METADATA_SCHEMA,
      description: "Caller-provided identification metadata for the observation persisted by evaluate (evaluate only, required).",
    },
    observation: {
      ...FINAL_RESULT_OBSERVATION_SCHEMA,
      description: "Final-judgment append input (observation_write only, with observationId). Carries only the reasoning model's final judgment; evaluator-side facts are already recorded.",
    },
    observationId: {
      type: "string",
      description: "Observation ID written by evaluate (observation_write only, required). The final judgment is appended to that observation JSON.",
    },
  },
  required: ["operation"],
  additionalProperties: false,
} as const;

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
      ". When the gateway credential is unset the tool returns a distinct not_configured failure without calling " +
      "the API and workflows continue on the legacy LLM path; API failures are never auto-retried and are returned " +
      "as structured failures. One semantic evaluation = one observation: evaluate persists the observation (one " +
      "JSON per evaluation) under .agentdev/jev-observations/ right after the evaluator succeeds — before the " +
      "caller proceeds to the reasoning model — and persists a failure observation when a call fails after " +
      "starting; not_configured and input validation failures generate no observation. observation_write appends " +
      "the reasoning model's final judgment to an evaluator-success observation. Observation persistence failures " +
      "stay an independent warning on the evaluation result (fail-open) and observation writes are independent of " +
      "workflow success.",
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
