// agentdev-jev-tool Plugin（Custom Tool `agentdev_jev` の harness 登録配線）。
//
// OpenCode のプラグイン機構（.opencode/plugins/ 直下の depth-1 ファイルから読み込まれる）
// 経由で、agentdev-jev Custom Tool をモデルに公開する。Plugin は登録の配線のみを担い、
// 操作契約・正規化・失敗の構造化・観測の形式検証は Tool 本体
// （src/opencode/tools/agentdev-jev/）が所有する。
//
// 公開スキーマは provider・SDK 非依存（REQ-{NNNN}-{NNN}）。provider 接続（初期 Vercel
// adapter）は Tool 本体が動的解決し、API key（AI_GATEWAY_API_KEY）未設定時は
// 呼び出さず not_configured を返す。Jev 障害時も Workflow は従来 LLM 経路で
// 継続できる（代替手段の定義義務: REQ-{NNN}-{NNN}）。
//
// args スキーマは zod を用いない（依存ゼロの構造的定義）。入力の検証は
// Tool 本体（runAgentdevJevOperation）が操作契約で厳密に行う。

import {
  AGENTDEV_JEV_PUBLIC_CONTRACTS,
  runAgentdevJevOperation,
} from "../../tools/agentdev-jev/index.ts";

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

/** 観測 JSON のスキーマ（REQ-{NNNN}-{NNN} 必須項目。実行時 validator が outcome 条件付きで厳密検証する）。 */
const OBSERVATION_SCHEMA = {
  type: "object",
  description:
    "One observation record for one Workflow run (one run = one JSON). Required fields: provider, requestedModel, " +
    "sourceRevision, workflow + judgmentKind, minimal subject identification, per-judgment Jev result, probability " +
    "distribution, confidence, LLM final judgment, llmTreatment (unchanged/corrected), outcome, Jev call duration. " +
    "reconstructable inputs must be stored as requestDigest + references (never full text); only non-reconstructable " +
    "inputs may carry a minimal inputs.snapshot.",
  properties: {
    schemaVersion: { type: "integer", enum: [1], description: "Observation schema version." },
    workflow: { type: "string", description: "Workflow name (e.g. learning-promote)." },
    judgmentKind: { type: "string", description: "Judgment kind identifier within the workflow." },
    subject: { type: "string", description: "Minimal identification of the judged subject (Japanese, no full text)." },
    provider: { type: "string", description: "Connection kind identifier (SDK names excluded)." },
    requestedModel: { type: "string", description: "Requested model ID." },
    resolvedModel: { type: "string", description: "Resolved model ID (only when the provider returns it)." },
    sourceRevision: { type: "string", description: "Source revision (e.g. git commit hash)." },
    outcome: {
      type: "string",
      enum: ["completed", "not_configured", "jev_failed"],
      description: "Run-level outcome. not_configured means the evaluation API was not called (no credential).",
    },
    durationMs: { type: "number", minimum: 0, description: "Jev call duration in milliseconds (0 when not called)." },
    inputTokens: { type: "number", description: "Input tokens (recorded by the initial Vercel adapter when returned)." },
    inputs: {
      type: "object",
      description: "Input reconstruction info. Full judgment input text is never stored.",
      properties: {
        requestDigest: { type: "string", description: "sha256 hex digest (64 chars) of the full evaluation request." },
        references: {
          type: "array",
          description: "References to reconstructable inputs (path + sha256 digest each).",
          items: {
            type: "object",
            properties: {
              label: { type: "string" },
              path: { type: "string", description: "Repository-relative reference path." },
              digest: { type: "string", description: "sha256 hex digest (64 chars)." },
            },
            required: ["label", "path", "digest"],
            additionalProperties: false,
          },
        },
        snapshot: {
          type: "string",
          description: "Minimal input snapshot for non-reconstructable inputs only.",
        },
      },
      required: ["requestDigest"],
      additionalProperties: false,
    },
    judgments: {
      type: "array",
      description: "Per-judgment observations (multiple Jev judgments of one run live in the same JSON).",
      items: {
        type: "object",
        properties: {
          judgmentId: { type: "string", description: "Judgment identifier." },
          questionForm: { type: "string", enum: ["boolean", "choice", "score"] },
          jevResult: {
            description: "Jev result value (boolean for form=boolean, candidate label for form=choice, level value for form=score). Required for outcome=completed.",
          },
          probabilityDistribution: {
            type: "object",
            description: "Candidate-level probability distribution (keys: true/false or option or level labels; values in [0,1]).",
            additionalProperties: { type: "number" },
          },
          confidence: { type: "number", minimum: 0, maximum: 1, description: "Normalized confidence in [0,1]. Required for outcome=completed. Stored as an independent primary observation; no threshold-derived classification." },
          failureKind: { type: "string", description: "Structured failure classification (recorded when the Jev call failed)." },
          llmFinalJudgment: { type: "string", description: "LLM final judgment (Japanese)." },
          llmTreatment: { type: "string", enum: ["unchanged", "corrected"], description: "Observed fact of whether the LLM changed the judgment." },
        },
        required: ["judgmentId", "questionForm", "llmFinalJudgment", "llmTreatment"],
        additionalProperties: false,
      },
    },
  },
  required: [
    "schemaVersion",
    "workflow",
    "judgmentKind",
    "subject",
    "provider",
    "requestedModel",
    "sourceRevision",
    "outcome",
    "durationMs",
    "inputs",
    "judgments",
  ],
  additionalProperties: false,
} as const;

/** 操作要求の公開スキーマ（JSON Schema）。正の契約は Tool の contracts.ts が所有する。 */
export const REQUEST_PROPERTY_SCHEMA = {
  type: "object",
  description:
    "Structured Jev prior-evaluation operation request. See the agentdev_jev operation contract (evaluate, " +
    "observation_write). The public contract is provider- and SDK-independent. When the gateway credential " +
    "(AI_GATEWAY_API_KEY) is unset, evaluate returns a distinct not_configured failure without calling the API; " +
    "callers fall back to the legacy LLM path. No auto-retry on API failure. Evaluation language is Japanese.",
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
    observation: {
      ...OBSERVATION_SCHEMA,
      description: "Observation record to validate and write (observation_write only).",
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
      "as structured failures. Observation writes under .agentdev/jev-observations/ are independent of workflow success.",
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
