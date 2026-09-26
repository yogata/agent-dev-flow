// agentdev-jev 公開契約型（provider・SDK 非依存）。
//
// 操作契約の正は docs/designs/responsibilities/custom-tool-contracts.md
// 「Jev 先行評価」節。本ファイルは公開スキーマと実行時 validator の共通契約型を定義する。
// provider 接続（初期 Vercel AI Gateway）と評価 SDK 固有の名称・型・格納位置は adapter 内部に
// 隠蔽し、本契約面へ漏らさない。
//
// 観測 schema の現行版は 2（1 semantic evaluation = 1 observation）。schemaVersion 1 の観測は
// 履歴として保持され、本契約では受理しない（新契約の現行観測として誤解釈されない）。

/** 質問形式（質問型〔独立命題・排他候補・順序水準〕と boolean/choice/score の対応づけは adapter mapping）。 */
export type JevQuestionForm = "boolean" | "choice" | "score";

/** 閉じた判断の1質問。prompt・options・scale は評価言語（日本語）で Workflow が構成する。 */
export type JevQuestion = {
  /** 質問識別子（評価内で一意）。 */
  id: string;
  form: JevQuestionForm;
  /** 質問文。 */
  prompt: string;
  /** form === "choice" の場合必須。排他候補（2つ以上、順序非保持）。 */
  options?: string[];
  /** form === "score" の場合必須。順序水準（2つ以上、添字0が最低水準）。 */
  scale?: string[];
};

/** 評価リクエスト。state は Workflow が構成した閉じた判断入力（repository 全文を渡さない）。 */
export type JevEvaluateRequest = {
  /** 判断対象の閉じた状態（日本語）。 */
  state: string;
  /** 評価指示（日本語）。 */
  instructions: string;
  /** 評価基準（任意・日本語）。 */
  criteria?: string[];
  /** 質問群（1つ以上）。 */
  questions: JevQuestion[];
};

/** 候別別確率分布（キー: boolean は "true"/"false"、choice は候補名、score は水準名。値: [0,1]、合計1に正規化）。 */
export type JevProbabilityDistribution = Record<string, number>;

/** 質問ごとの正規化済み結果（canonical result）。評価入力の各質問と id で1対1対応する。 */
export type JevQuestionResult = {
  id: string;
  form: JevQuestionForm;
  /** canonical result（boolean は真偽、choice は候補、score は水準値〔0 以上・最大水準以下の数値〕）。 */
  value: boolean | string | number;
  probabilityDistribution: JevProbabilityDistribution;
};

/** 構造化失敗分類。not_configured は Jev API 失敗に含めない（呼出し前判定）。自動 retry は行わないため retryable は常に false。 */
export type JevFailureKind =
  | "not_configured"
  | "invalid_input"
  | "timeout"
  | "rate_limited"
  | "server_error"
  | "network_error"
  | "response_invalid";

export type JevFailure = {
  kind: JevFailureKind;
  retryable: false;
  detail: string;
};

/** 評価成功結果（正規化済み）。 */
export type JevEvaluateSuccess = {
  /** provider が解決した model ID（非導出の identity 差異として観測に保持できる）。 */
  resolvedModel?: string;
  /** 入力トークン数（provider が返す場合のみ）。 */
  inputTokens?: number;
  /** provider が実際に返した confidence（[0,1] 正規化。provider 固有の格納位置は adapter が内部吸収する。返さない場合は存在しない）。 */
  confidence?: number;
  /** 機械的処理時間（ミリ秒）。 */
  processingMs: number;
  /** 質問ごとの結果（リクエスト順・ID 一致）。 */
  results: JevQuestionResult[];
  /** 当該評価の観測（1 semantic evaluation = 1 observation）の永続化結果（evaluator 成功後に永続化。失敗時は warning）。 */
  observation?: JevObservationPersistOutcome;
};

export type JevEvaluateSuccessPayload = {
  ok: true;
  operation: "evaluate";
  success: JevEvaluateSuccess;
};

export type JevFailurePayload = {
  ok: false;
  failure: JevFailure;
  /** 実際の evaluator 呼出し開始後の失敗のみ、失敗観測の永続化結果を付与する。invalid_input（評価未実施）と not_configured（呼出し前判定）では付与しない。 */
  observation?: JevObservationPersistOutcome;
};

export type JevEvaluateResult = JevEvaluateSuccessPayload | JevFailurePayload;

/** 失敗観測の失敗分類（実際の evaluator 呼出し開始後の失敗のみ。5分類）。 */
export type JevObservationFailureKind =
  | "timeout"
  | "rate_limited"
  | "server_error"
  | "network_error"
  | "response_invalid";

/** 失敗観測の本体。 */
export type JevObservationFailure = {
  kind: JevObservationFailureKind;
  /** 最小 diagnostic。 */
  detail: string;
};

/** 非導出の identity 差異の実行時観測値（provider が解決した model ID 等。実測された場合のみ保持する）。 */
export type JevObservedIdentity = {
  resolvedModel?: string;
};

/** 質問単位の evaluator 返却結果（評価入力の各質問と questionId で1対1対応。canonical result と候補別確率分布の双方を保持）。 */
export type JevObservationResult = {
  questionId: string;
  questionForm: JevQuestionForm;
  /** canonical result（boolean は真偽、choice は候補、score は水準値）。 */
  value: boolean | string | number;
  probabilityDistribution: JevProbabilityDistribution;
};

/** 差異理由の分類（evaluator 返却結果と reasoning model の最終判断が異なる場合のみ保持）。 */
export type JevDifferenceReason =
  | "evaluation_input_defect"
  | "semantic_disagreement"
  | "deterministic_override"
  | "unknown";

/** 質問単位の reasoning model 最終判断結果。 */
export type JevFinalResultItem = {
  questionId: string;
  /** canonical result（evaluator 返却結果と同じ値域）。 */
  value: boolean | string | number;
  /** 差異理由分類（evaluator 返却結果と最終判断が異なる場合のみ）。 */
  differenceReason?: JevDifferenceReason;
};

/** reasoning model の最終判断結果（evaluator 成功観測に限定して保持し、失敗観測へは重複保存しない）。 */
export type JevFinalResult = {
  results: JevFinalResultItem[];
};

/** 観測（1 semantic evaluation = 1 observation、1 JSON）。evaluator 成功観測と失敗観測は results / failure の排他必須で区別する。 */
export type JevObservation = {
  /** 観測 schema の版。現行: 2。 */
  schemaVersion: 2;
  /** 観測 ID（1評価1 observation の識別子。Tool が生成する）。 */
  observationId: string;
  /** 実行元 Workflow 名。 */
  workflow: string;
  /** semantic evaluation の種別（Workflow 内の判断単位の識別）。 */
  evaluationKind: string;
  /** 判断対象の最小識別情報（日本語。全文を含まない）。 */
  subject: string;
  /** ソース revision（git commit hash 等の具体的基準点）。 */
  sourceRevision: string;
  /** 評価 API 呼出しの所要時間（ミリ秒）。 */
  durationMs: number;
  /** 入力トークン数（provider が返す場合のみ）。 */
  inputTokens?: number;
  /** 入力の再構成情報。判断入力全文は保存せず、request digest と参照・最小 snapshot のみ保持する。 */
  inputs: {
    /** 評価リクエスト全文の digest（sha256 hex 64 桁。全文を保存しない代わりの再構成鍵）。 */
    requestDigest: string;
    /** 再構成可能入力の参照一覧。 */
    references?: JevObservationInputReference[];
    /** 再構成不能入力のみの最小 snapshot。 */
    snapshot?: string;
  };
  /** 非導出の identity 差異を実行時観測した場合のみ保持する。 */
  identity?: JevObservedIdentity;
  /** evaluator 返却結果（evaluator 成功観測のみ。failure と排他）。 */
  results?: JevObservationResult[];
  /** provider が実際に返した confidence（evaluation 単位のみ。質問単位への複製・確率分布からの代替生成は行わない。返さない場合は存在しない）。 */
  confidence?: number;
  /** 失敗観測（実際の呼出し開始後の失敗のみ。results と排他）。 */
  failure?: JevObservationFailure;
  /** reasoning model の最終判断結果（evaluator 成功観測に限定。observation_write で付与）。 */
  finalResult?: JevFinalResult;
};

/** 再構成可能入力の参照（判断入力全文は保存しない）。 */
export type JevObservationInputReference = {
  label: string;
  /** repository 相対パス等の参照。 */
  path: string;
  /** 参照内容の digest（sha256 hex 64 桁）。 */
  digest: string;
};

/** 評価観測の永続化結果（評価結果の返却と独立。永続化失敗は warning）。 */
export type JevObservationPersistOutcome =
  | {
      observationId: string;
      /** 書込み先（worktree 相対パス）。 */
      writtenPath: string;
    }
  | { warning: string };

/** evaluate の観測永続化に呼出し元が提供する識別 metadata。 */
export type JevObservationMetadata = {
  /** 実行元 Workflow 名。 */
  workflow: string;
  /** semantic evaluation の種別。 */
  evaluationKind: string;
  /** 判断対象の最小識別情報（日本語。全文を含まない）。 */
  subject: string;
  /** ソース revision（git commit hash 等の具体的基準点）。 */
  sourceRevision: string;
  /** 再構成可能入力の参照一覧。 */
  references?: JevObservationInputReference[];
  /** 再構成不能入力のみの最小 snapshot。 */
  snapshot?: string;
};

/** observation_write（final result 反映）の結果（書込み失敗は構造化失敗として返すが Workflow の成否と独立）。 */
export type JevObservationWriteResult =
  | {
      ok: true;
      operation: "observation_write";
      success: {
        /** 書込み先（worktree 相対パス）。 */
        writtenPath: string;
        observationId: string;
      };
    }
  | {
      ok: false;
      operation: "observation_write";
      failure: JevFailure;
    };
