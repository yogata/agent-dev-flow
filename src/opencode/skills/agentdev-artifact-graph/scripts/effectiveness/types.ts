// effectiveness/types.ts — Workflow effectiveness comparison harness types.
//
// 本検証は診断目的であり、性能閾値による合否判定は行わない（REQ-{NNNN}-{NNN}, TS\u002D010）。
// Parser/Graph regression は REQ-{NNNN} が所有し、本 harness は取り扱わない。
// Graph 固有の parser/augmentation/extraction 回帰検証は effectiveness/ ではなく
// 既存の tests/*.test.ts および REQ-{NNNN} 傘下の検証層が独立に判断可能である。
//
// 6 つの比較観点（REQ-{NNNN}-{NNN}）:
//   1. recall                 — ground truth に対する発見率（Graph / 独立探索 それぞれ）
//   2. falseCandidate         — ground truth 以外の候補数
//   3. canonicalSourceReach   — 結果が canonical source へ到達可能か（割合）
//   4. graphOnlyMiss          — 独立探索が見つけたが Graph が見落とした候補
//   5. independentOnlyMiss    — Graph が見つけたが独立探索が見落とした候補
//   6. searchEffort           — 探索に要した操作量（API 呼出回数等）

import type { GraphQuery } from "../lib/query.ts"

/**
 * REQ-{NNNN}-{NNN} が定める 6 つの workflow question category。
 *SPEC「効果検証 › Workflow effectiveness」節と 1:1 で対応する。
 */
export const QUERY_CATEGORIES = [
  "req-change-impact",
  "same-canonical-owner",
  "related-command-skill-ir",
  "delegation-target-skill",
  "superseded-current-refs",
  "post-change-dangling-relation",
] as const

export type QueryCategory = (typeof QUERY_CATEGORIES)[number]

/**
 * Query category → 人間可読な質問の説明。
 * harness はこの label を diagnostic report に出力する。
 */
export const CATEGORY_LABELS: Readonly<Record<QueryCategory, string>> = {
  "req-change-impact": "REQ の変更影響候補",
  "same-canonical-owner": "同一 canonical owner の SPEC",
  "related-command-skill-ir": "関連 command, skill, integrity rule",
  "delegation-target-skill": "command から実際に委譲される skill",
  "superseded-current-refs": "superseded artifact への現行参照",
  "post-change-dangling-relation": "変更後の dangling relation",
}

/**
 * 独立探索（rg / glob / filesystem scan 相当）の宣言的仕様。
 * Graph API を経由しない、素のファイルシステム走査を表現する。
 * harness はこの spec を independent_search.ts の実装へ渡す。
 */
export type IndependentSearchSpec =
  | {
    readonly kind: "grep"
    /**
     * JavaScript 正規表現。単語境界等は明示的に指定すること。
     * 例: "\\bREQ-012\\b" — "REQ-{NNNN}" 等への誤ヒットを防ぐ。
     */
    readonly pattern: string
    /** 検索対象ルート（repo root 相対）。再帰的に .md/.yaml/.ts 等を走査する。 */
    readonly roots: readonly string[]
    /** 検索対象ファイル拡張子（先頭 "." 含む）。 */
    readonly extensions: readonly string[]
  }
  | {
    readonly kind: "frontmatterField"
    readonly field: string
    readonly value: string
    readonly roots: readonly string[]
    readonly extensions: readonly string[]
  }
  | {
    readonly kind: "glob"
    /** POSIX glob（Bun.Glob 形式）。ファイルパス全体にマッチする。 */
    readonly pattern: string
    readonly roots: readonly string[]
  }

/**
 * Graph 側のクエリ仕様（discriminated union）。
 *
 * - `neighbors` / `path` / `provenance`: 既存 GraphQuery をそのまま使用。
 * - `discover`: テキスト検索。rootDir は harness 実行時に repo root で埋めるため、
 *   この spec には含めない（クエリ定義が repo 絶対パスに依存しないようにする）。
 */
export type GraphQuerySpec =
  | {
    readonly kind: "graph-query"
    readonly query: GraphQuery
    readonly resultFilter?: GraphResultFilter
  }
  | {
    readonly kind: "discover"
    readonly term: string
    readonly roots: readonly string[]
    readonly resultFilter?: GraphResultFilter
  }

export type GraphResultFilter = {
  /**
   * 残す node type の集合。undefined は「全 node type」。
   * 例: ["specification", "requirement", "decision"] — source_file を除外。
   */
  readonly includeTypes?: readonly string[]
  /** 結果から除外する node ID の集合（self 等）。 */
  readonly excludeNodes?: readonly string[]
}

/**
 * 1 つの workflow question を表すエントリ。
 * groundTruth は「その質問に対して期待される候補集合（node ID 形式）」であり、
 * real artifact への明示参照のみを含む。コード値はクエリ間で一意であること。
 */
export interface EffectivenessQuery {
  readonly id: string
  readonly category: QueryCategory
  readonly question: string
  readonly graphQuery: GraphQuerySpec
  readonly independentSearch: IndependentSearchSpec
  readonly groundTruth: readonly string[]
  /**
   * この ground truth を選定した根拠のメモ。
   * harness はこれを report へ出力し、追跡可能性を確保する。
   */
  readonly groundTruthRationale: string
}

/**
 * 1 クエリの比較結果。pass/fail 判定は持たない（diagnostic only）。
 */
export interface EffectivenessResult {
  readonly queryId: string
  readonly category: QueryCategory
  readonly question: string
  readonly groundTruth: readonly string[]
  readonly groundTruthRationale: string
  readonly graphResults: readonly string[]
  readonly independentResults: readonly string[]
  readonly metrics: ComparisonMetrics
}

export interface ComparisonMetrics {
  /** Graph 側: ground truth のうち Graph が発見した割合 [0,1]。 */
  readonly graphRecall: number
  /** 独立探索側: ground truth のうち独立探索が発見した割合 [0,1]。 */
  readonly independentRecall: number
  /** Graph 側: ground truth 以外の候補数。 */
  readonly graphFalseCandidateCount: number
  /** 独立探索側: ground truth 以外の候補数。 */
  readonly independentFalseCandidateCount: number
  /**
   * Graph 側: 結果のうち provenance により canonical source へ到達できる割合 [0,1]。
   * source_file node を含まないフィルタ済み結果集合を分母とする。
   */
  readonly graphCanonicalReach: number
  /**
   * 独立探索側: 結果のうち artifact ノード（source_file 以外）へ正規化できた割合 [0,1]。
   * canonical source へ到達できた割合の代用指標。
   */
  readonly independentCanonicalReach: number
  /** 独立探索が見つけたが Graph が見落とした候補（node ID）。 */
  readonly graphOnlyMiss: readonly string[]
  /** Graph が見つけたが独立探索が見落とした候補（node ID）。 */
  readonly independentOnlyMiss: readonly string[]
  /** それぞれの探索操作量。 */
  readonly searchEffort: {
    readonly graph: number
    readonly independent: number
  }
}

export interface HarnessReport {
  /** 実行時の repo root 絶対パス。 */
  readonly rootDir: string
  /** 読み込んだ Graph directory（manifest.json が存在するパス）。 */
  readonly graphDir: string
  /** Graph manifest の input_digest。再現性確認用。 */
  readonly inputDigest: string
  /** 実行日時（ISO 8601）。 */
  readonly executedAt: string
  /** diagnostic 目的の明示フラグ。常に true。 */
  readonly diagnosticOnly: true
  readonly results: readonly EffectivenessResult[]
}
