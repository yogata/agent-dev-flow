// candidate_limit/types.ts — 高位問い合わせ候補数上限回帰の共通型（REQ-{NNNN}-006）。
//
// 本サブスイートは代表質問回帰検証（REQ-{NNNN}-003、effectiveness/ 本体）の体系に接続して
// 運用する候補数上限決定根拠の回帰資産である。代表質問側の定義（6 query suite、
// 10件選定基準）は再定義しない。diagnostics プロファイルは構造診断であり候補数上限回帰の
// 対象外とする。

/** 候補数上限回帰の対象とする高位問い合わせプロファイル。 */
export type HighLevelProfile = "related" | "impact" | "dependency" | "implementation"

/**
 * 関係の変更影響方向（TIM 4値）。リンク記述方向と変更影響方向は同一視しない。
 * - forward:  リンク方向へ影響（source 変更が target へ影響）
 * - backward: 逆方向へ影響（target 変更が source へ影響）
 * - both:     双方向へ影響
 * - none:     変更影響なし
 */
export type ImpactDirection = "forward" | "backward" | "both" | "none"

/** 関係の依存方向。 */
export type DependencyDirection =
  | "source_depends_on_target"
  | "target_depends_on_source"
  | "none"

/** 関係意味（回帰計測用の暫定表。正規の意味定義は TIM 語彙カタログ SPEC が正とする）。 */
export interface RelationSemantics {
  /** 一般参照（変更影響・依存の探索経路として使用しない）。 */
  readonly general_reference: boolean
  readonly impact: ImpactDirection
  readonly dependency: DependencyDirection
  /** 実現・実装・充足系列（implementation プロファイル参加スロット）。 */
  readonly realization_series: boolean
  /** TIM 語彙カタログで意味が定義済みか。未定義関係型は高位問い合わせに不参加（低位問い合わせ限定）。 */
  readonly defined: boolean
}

/** ノードの役割。索引・集約成果物は探索を先へ伝播させない。 */
export type NodeRole = "canonical" | "index_aggregation"

/**
 * 高位問い合わせの結果候補1件（結果5要素）。
 * 詳細な根拠箇所は根拠問い合わせ（provenance）の責務であり、本構造へ根拠詳細を
 * 重複保持しない（高位問い合わせ要件の結果5要素契約に基づく）。
 */
export interface LimitCandidate {
  /** 候補成果物（node ID）。 */
  readonly candidate: string
  /** 候補となった理由。 */
  readonly reason: string
  /** トレースリンク型。 */
  readonly relation_type: string
  /** 探索方向。 */
  readonly direction: "outgoing" | "incoming"
  /** 到達経路（起点から候補までの node ID 列。根拠ファイルパスではない）。 */
  readonly path: readonly string[]
}

/** 候補過多時の返却5項目（黙切的切り捨て禁止）。 */
export interface TruncationInfo {
  /** 候補過多であること。 */
  readonly too_many: true
  /** 全候補数。 */
  readonly total_candidates: number
  /** 返却候補数。 */
  readonly returned_candidates: number
  /** 適用した絞り込み規則。 */
  readonly applied_rules: readonly string[]
  /** 独立探索へ移行可能であること。 */
  readonly independent_search_available: true
}

/** 上限適用後の問い合わせ結果。truncation の存在が候補過多を表す。 */
export interface LimitResult {
  readonly profile: HighLevelProfile
  readonly start: string
  readonly candidates: readonly LimitCandidate[]
  /** 適用した絞り込み規則（候補過多でない場合も含め常に返す。黙密的切り捨て禁止）。 */
  readonly applied_rules: readonly string[]
  readonly truncation?: TruncationInfo
}

/** 問い合わせ設定。標準上限値はコード中の適用ロジックへ直書きせず設定として管理する。 */
export interface QuerySettings {
  readonly candidate_limit: number
}

/** 代表ケースの分類（選定基準のメタデータ、実入力 fixture 設計原則に準拠）。 */
export type CaseClass =
  | "normal"
  | "amplification"
  | "semantic-separation"

/** 代表ケース1件。real artifact のみを参照し mock/stub を使用しない。 */
export interface RepresentativeCase {
  readonly id: string
  readonly profile: HighLevelProfile
  readonly start: string
  readonly depth: number
  readonly caseClass: CaseClass
  /** このケースが代表する入力パターンの説明（選定基準の明示）。 */
  readonly selectionRationale: string
  /** 欠落してはならない必須候補（node ID）。 */
  readonly requiredCandidates: readonly string[]
  /** 増幅ケースの期待下限（naive 列挙と意味列挙の差の最小値）。 */
  readonly minAmplifiedCount: number
  /** 独立探索（rg 相当 grep）の spec。比較観点の計測に使う。 */
  readonly independentSearchPattern: string
}
