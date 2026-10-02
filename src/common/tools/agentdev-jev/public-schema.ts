// agentdev-jev Custom Tool の host 非依存公開スキーマ（Tool 引数の JSON Schema）。
//
// 公開契約は provider・SDK 非依存である。質問型（独立命題・排他候補・順序水準）と
// boolean/choice/score の対応づけは adapter mapping であり意味契約の変更ではない。
// OpenCode（plugins/agentdev-jev-tool）と Senpi（src/senpi/tools/）の両ホスト接続が
// 本モジュールを参照し、ホスト別にスキーマを複製しない。

/** 評価リクエストの質問スキーマ（公開契約。質問型と boolean/choice/score の対応づけは adapter mapping）。 */
export const AGENTDEV_JEV_QUESTION_SCHEMA = {
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
      description: "Ordered level labels from lowest (index 0) (required for form=score). Levels must be unique (discrete scale).",
    },
  },
  required: ["id", "form", "prompt"],
  additionalProperties: false,
} as const;

/** 再構成可能入力の参照（path + sha256 digest。判断入力全文は保存しない）。 */
export const AGENTDEV_JEV_INPUT_REFERENCE_SCHEMA = {
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
export const AGENTDEV_JEV_OBSERVATION_METADATA_SCHEMA = {
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
      items: AGENTDEV_JEV_INPUT_REFERENCE_SCHEMA,
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
export const AGENTDEV_JEV_FINAL_RESULT_OBSERVATION_SCHEMA = {
  type: "object",
  description:
    "Final-judgment append input for observation_write WITH observationId. The evaluator-side primary facts " +
    "(results, confidence, durationMs, inputTokens, inputs) are already recorded in the observation persisted by " +
    "evaluate and are NOT accepted here. Send schemaVersion 2 and one finalResult whose results correspond " +
    "one-to-one with the evaluator results (questionId + canonical value). A differenceReason " +
    "(evaluation_input_defect | semantic_disagreement | deterministic_override | unknown) is required when the " +
    "final judgment differs from the evaluator result and is rejected when the final judgment matches it " +
    "(unknown is a valid difference reason). score final values must be discrete scale levels (non-negative " +
    "integers within the defined scale); continuous values are rejected.",
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
                description: "Final judgment value (boolean for form=boolean, candidate label for form=choice, discrete scale level as a non-negative integer within the defined scale for form=score; continuous score values are rejected).",
              },
              differenceReason: {
                type: "string",
                enum: ["evaluation_input_defect", "semantic_disagreement", "deterministic_override", "unknown"],
                description: "Difference reason classification. Required when the value differs from the evaluator result; rejected (must be omitted) when the value matches it.",
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
export const AGENTDEV_JEV_REQUEST_PROPERTY_SCHEMA = {
  type: "object",
  description:
    "Structured Jev prior-evaluation operation request. See the agentdev_jev operation contract (evaluate, " +
    "observation_write). The public contract is provider- and SDK-independent. When the credentials " +
    "(CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN) are unset, evaluate returns a distinct not_configured failure " +
    "without calling the API; callers fall back to the legacy LLM path. No auto-retry on API failure. Evaluation " +
    "language is Japanese. " +
    "One semantic evaluation = one observation: evaluate persists the observation (one JSON) under " +
    ".agentdev/jev-observations/ right after the evaluator succeeds (and a failure observation when the call " +
    "fails after starting; no observation for not_configured or input validation failures), and observation_write " +
    "appends the reasoning model's final judgment to an evaluator-success observation. " +
    "Conditional evaluation trigger control: the caller generates a follow-up semantic evaluation only when the " +
    "parent judgment's final confirmed result satisfies the trigger condition (a Jev prior result of the parent " +
    "judgment alone never triggers it); when the condition is not met the caller composes neither the follow-up " +
    "questions nor any observation. Observation identifier stability: continuing the same semantic judgment keeps " +
    "workflow, evaluationKind, and questionId; changed meaning or merged judgments require new questionIds; " +
    "version differences are distinguished by sourceRevision and requestDigest; existing observations are never " +
    "migrated, rewritten, or re-keyed.",
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
      items: AGENTDEV_JEV_QUESTION_SCHEMA,
      description: "Question batch for one closed judgment (evaluate only).",
    },
    observationMetadata: {
      ...AGENTDEV_JEV_OBSERVATION_METADATA_SCHEMA,
      description: "Caller-provided identification metadata for the observation persisted by evaluate (evaluate only, required).",
    },
    observation: {
      ...AGENTDEV_JEV_FINAL_RESULT_OBSERVATION_SCHEMA,
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
