// agentdev-jev 公開契約型（provider・SDK 非依存）。
//
// 操作契約の正は docs/designs/responsibilities/custom-tool-contracts.md
// 「Jev 先行評価」節（REQ-{NNNN}-{NNN}、DEC-{NNN}）。本ファイルは公開スキーマと
// 実行時 validator の共通契約型を定義する。provider 接続（初期 Vercel AI Gateway）
// と評価 SDK 固有の名称・型・格納位置は adapter 内部に隠蔽し、本契約面へ漏らさない。

/** 質問形式（質問型〔独立命題・排他候補・順序水準〕と boolean/choice/score の対応づけは adapter mapping）。 */
export type JevQuestionForm = "boolean" | "choice" | "score";

/** 閉じた判断の1質問。prompt・options・scale は評価言語（日本語）で Workflow が構成する。 */
export type JevQuestion = {
  /** 質問識別子（判断内で一意）。 */
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

/** 質問ごとの結果。 */
export type JevQuestionResult = {
  id: string;
  form: JevQuestionForm;
  /** 結果値（boolean は真偽、choice は選択候補、score は水準値〔0 以上・最大水準以下の数値〕）。 */
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

/** 評価成功結果（正規化済み）。confidence は [0,1] に正規化した provider 非依存の値。 */
export type JevEvaluateSuccess = {
  /** 接続種別識別子（SDK 名を含まない。初期実装: "vercel-ai-gateway"）。 */
  provider: string;
  /** 要求した model ID。 */
  requestedModel: string;
  /** provider が返せた場合の解決済み model ID。 */
  resolvedModel?: string;
  /** 入力トークン数（provider が返す場合のみ。初期 Vercel adapter で記録）。 */
  inputTokens?: number;
  /** 正規化済み confidence（[0,1]）。provider 固有の格納位置は adapter が内部吸収する。 */
  confidence: number;
  /** 機械的処理時間（ミリ秒）。 */
  processingMs: number;
  /** 質問ごとの結果（リクエスト順・ID 一致）。 */
  results: JevQuestionResult[];
  /** evaluate 時点の部分レコード書込み結果（REQ-090-013。書込み失敗時は warning）。 */
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
  /** 評価完了（not_configured・API 失敗を含む）時点の部分レコード書込み結果。invalid_input（評価未実施）では付与しない（REQ-090-013）。 */
  observation?: JevObservationPersistOutcome;
  /** 解決済み provider の接続種別識別子（provider 解決に失敗した not_configured では省略）。 */
  provider?: string;
  /** 解決済み provider の要求 model ID（provider 解決に失敗した not_configured では省略）。 */
  requestedModel?: string;
};

export type JevEvaluateResult = JevEvaluateSuccessPayload | JevFailurePayload;

/** 観測レコードの完了状態 field（機械判別可能。REQ-090-013 の 2段階書込み契約）。 */
export type JevObservationRecordState =
  /** evaluate 時点書込みの部分レコード（LLM 最終判断関連 field は未記録）。 */
  | "partial"
  /** observation_write 追記完成の完成レコード。 */
  | "complete";

/** 観測実行単位の成果区分。 */
export type JevObservationOutcome = "completed" | "not_configured" | "jev_failed";

/** LLM が Jev 結果を変更したかの一次観測値（unchanged は評価カテゴリを混入させない観測事実）。 */
export type JevLlmTreatment = "unchanged" | "corrected";

/** 判断単位の観測（confidence と llmTreatment は独立した一次観測値。閾値依存の分類結果は持たない）。 */
export type JevObservationJudgment = {
  judgmentId: string;
  questionForm: JevQuestionForm;
  /** Jev 結果（jev_failed / not_configured の場合は省略。代わりに failureKind を記録）。 */
  jevResult?: boolean | string | number;
  probabilityDistribution?: JevProbabilityDistribution;
  /** 正規化済み confidence（completed 時必須）。 */
  confidence?: number;
  /** 構造化失敗分類（jev_failed / not_configured 時に記録）。 */
  failureKind?: JevFailureKind;
  /** LLM の最終判断（日本語）。recordState partial の部分レコードでは省略（observation_write 追記完成で付与）。 */
  llmFinalJudgment?: string;
  llmTreatment?: JevLlmTreatment;
};

/** 再構成可能入力の参照（判断入力全文は保存しない）。 */
export type JevObservationInputReference = {
  label: string;
  /** repository 相対パス等の参照。 */
  path: string;
  /** 参照内容の digest（sha256 hex 64 桁）。 */
  digest: string;
};

export type JevObservation = {
  /** 観測 schema の版。現行: 1。 */
  schemaVersion: 1;
  /** Workflow 名（例: learning-promote）。 */
  workflow: string;
  /** 判断種別（Workflow 内の判断単位の識別）。 */
  judgmentKind: string;
  /** 判断対象の最小識別情報（日本語。全文を含まない）。 */
  subject: string;
  /** 接続種別識別子（SDK 名を含まない）。 */
  provider: string;
  /** 要求した model ID。 */
  requestedModel: string;
  /** ソース revision（git commit hash 等の基準点）。 */
  sourceRevision: string;
  outcome: JevObservationOutcome;
  /** Jev 呼出し時間（ミリ秒。呼出しが発生しない not_configured では 0）。 */
  durationMs: number;
  /** 解決済み model ID（provider が返せる場合のみ）。 */
  resolvedModel?: string;
  /** 入力トークン数（初期 Vercel adapter で記録）。 */
  inputTokens?: number;
  /** 入力の再構成情報。判断入力全文は保存せず、request digest と参照・snapshot のみ保持する。 */
  inputs: {
    /** 評価リクエスト全文の digest（sha256 hex 64 桁。全文を保存しない代わりの再構成鍵）。 */
    requestDigest: string;
    /** 再構成可能入力の参照一覧。 */
    references?: JevObservationInputReference[];
    /** 再構成不能入力のみの最小 snapshot。 */
    snapshot?: string;
  };
  /** 判断単位の観測（1実行の複数 Jev 判断は同一 JSON 内に格納）。 */
  judgments: JevObservationJudgment[];
  /** 完了状態 field（機械判別可能）。省略は入力上の後方互換（書込み時に既定 complete で永続化）。 */
  recordState?: JevObservationRecordState;
};

/** evaluate 時点書込みの結果（評価結果の返却と独立。書込み失敗は warning。REQ-090-013）。 */
export type JevObservationPersistOutcome =
  | {
      observationId: string;
      /** 書込み先（worktree 相対パス）。 */
      writtenPath: string;
      recordState: "partial";
    }
  | { warning: string };

/** evaluate 時点部分レコード作成のための呼出し元提供 metadata（run 級 field の内、評価結果から導出できない分）。 */
export type JevObservationMetadata = {
  /** Workflow 名（省略時は "unspecified"）。 */
  workflow?: string;
  /** 判断種別（省略時は "unspecified"）。 */
  judgmentKind?: string;
  /** 判断対象の最小識別情報（省略時は "unspecified"）。 */
  subject?: string;
  /** ソース revision（省略時は "unspecified"）。 */
  sourceRevision?: string;
  /** 1実行 1 JSON を維持する観測 ID（省略時は新規生成。同一 run の複数 evaluate で同一 ID を渡すと同一 JSON 内 judgments へ追記）。 */
  observationId?: string;
  /** 再構成可能入力の参照一覧。 */
  references?: JevObservationInputReference[];
  /** 再構成不能入力のみの最小 snapshot。 */
  snapshot?: string;
};

/** 観測書込み結果（書込み失敗は構造化失敗として返すが Workflow の成否と独立）。 */
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

