// candidate_limit/limit.ts — 候補数上限の適用（REQ-{NNNN}-006、境界試験の対象）。
//
// 契約（AG SPEC「高位問い合わせプロファイル」共通規則に基づく）:
// - 問い合わせ結果が候補数上限を超えた場合、候補を黙って切り捨てない
// - 決定論的な優先・除外規則を適用する
// - それでも上限を超える場合は、候補過多であること、全候補数、返却候補数、
//   適用した絞り込み規則、独立探索へ移行可能であることを返す
// - 候補数上限の変更によって TIM 上の関係意味または探索意味を変更しない
//   （本モジュールは候補列挙結果の順序付けと件数制限のみを行う）

import type { LimitCandidate, LimitResult, QuerySettings } from "./types.ts"

/**
 * 問い合わせ設定の既定値。標準候補数上限 12 は TIM 語彙カタログ置換後の再計測
 * （recommended_standard_limit 実測値 9、全代表ケースの必須候補を保持する最小上限値）
 * に基づき決定した値である（AG SPEC「標準候補数上限の決定手順」、Issue #2204）。
 * 本値は標準値であり、設定として管理される限り変更できる。
 */
export const DEFAULT_CANDIDATE_LIMIT = 12

export function defaultSettings(): QuerySettings {
  return { candidate_limit: DEFAULT_CANDIDATE_LIMIT }
}

/** 適用規則の識別子（applied_rules へ出力する決定論的な並び）。 */
export const RULE_EXCLUDE_INDEX_TAIL = "exclude:index-role-depth>=2"
export const RULE_PRIORITY_SEMANTIC_TRACE = "priority:semantic-trace-first"
export const RULE_PRIORITY_PATH_LENGTH = "priority:path-length"
export const RULE_PRIORITY_CANDIDATE_ID = "priority:candidate-id"

/**
 * 一般参照語彙の判定。TIM 語彙カタログは一般参照スロット（general_reference）を
 * 標準コアの `references` のみが採用する。本モジュールは並べ替え優先度の算出に
 * 関係型名のみを用いるため、カタログ解決結果（Graph manifest）を参照しない。
 */
function isGeneralReferenceType(relationType: string): boolean {
  return relationType === "references"
}

function isSemanticTrace(relationType: string): boolean {
  return !isGeneralReferenceType(relationType) && relationType !== "contains" && relationType !== "defined_in"
}

/** 優先クラス: 0 = 意味トレース、1 = ファイル包含、2 = 一般参照。 */
function priorityClass(relationType: string): number {
  if (isSemanticTrace(relationType)) return 0
  if (relationType === "contains" || relationType === "defined_in") return 1
  return 2
}

/**
 * 候補数上限を適用する。決定論的な規則:
 * 1. 上限超過時のみ除外規則を適用する: 索引・集約役割ノード自体の候補のうち
 *    深さ2以上で到達したものを除外（起点への直接参照として返される深さ1の索引候補は
 *    保持する。README 等を経由した候補増幅の本体は意味列挙側の非伝播で抑制しており、
 *    本規則は過多時の優先度調整に限る）
 * 2. 優先規則: 意味トレース候補（一般参照・ファイル包含以外）を前方へ
 * 3. 優先規則: 到達経路が短い候補を前方へ
 * 4. 優先規則: 候補 ID 辞書順（決定論的な最終順序付け）
 *
 * indexRoleCandidates は索引・集約役割ノードの ID 集合（呼出側が Graph manifest の
 * node_type_roles から算出する）。除外規則の適用で上限内に収まった場合は
 * 生存候補全件を返し、それでも超える場合に過多時5項目を返す
 * （「決定論的な優先・除外規則を適用すること。それでも上限を超える場合は
 * 候補過多であること…を返すこと」の契約に基づく）。
 */
export function applyCandidateLimit(
  profile: LimitResult["profile"],
  start: string,
  candidates: readonly LimitCandidate[],
  settings: QuerySettings,
  indexRoleCandidates: ReadonlySet<string> = new Set(),
): LimitResult {
  const total = candidates.length
  const enriched = candidates.map((candidate) => ({
    candidate,
    indexRole: indexRoleCandidates.has(candidate.candidate),
  }))

  const appliedRules: string[] = []
  let surviving = enriched
  if (total > settings.candidate_limit) {
    const toExclude = surviving.filter((entry) => entry.indexRole && entry.candidate.path.length > 2)
    if (toExclude.length > 0) {
      appliedRules.push(RULE_EXCLUDE_INDEX_TAIL)
      surviving = surviving.filter((entry) => !(entry.indexRole && entry.candidate.path.length > 2))
    }
  }

  appliedRules.push(RULE_PRIORITY_SEMANTIC_TRACE, RULE_PRIORITY_PATH_LENGTH, RULE_PRIORITY_CANDIDATE_ID)
  const ordered = [...surviving].sort((left, right) => {
    const classDiff = priorityClass(left.candidate.relation_type) - priorityClass(right.candidate.relation_type)
    if (classDiff !== 0) return classDiff
    const depthDiff = left.candidate.path.length - right.candidate.path.length
    if (depthDiff !== 0) return depthDiff
    return left.candidate.candidate.localeCompare(right.candidate.candidate)
  })

  if (ordered.length <= settings.candidate_limit) {
    return {
      profile,
      start,
      candidates: ordered.map((entry) => entry.candidate),
      applied_rules: appliedRules,
    }
  }
  return {
    profile,
    start,
    candidates: ordered.slice(0, settings.candidate_limit).map((entry) => entry.candidate),
    applied_rules: appliedRules,
    truncation: {
      too_many: true,
      total_candidates: total,
      returned_candidates: settings.candidate_limit,
      applied_rules: appliedRules,
      independent_search_available: true,
    },
  }
}
