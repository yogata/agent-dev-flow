// candidate_limit/semantics.ts — 契約ベース候補列挙（REQ-{NNNN}-006 回帰計測用）。
//
// 関係意味表とノード役割表は、AG SPEC「高位問い合わせプロファイル」共通規則と
// 高位問い合わせ要件の契約テキストから直接導出した回帰計測用の暫定表である。
// 正規の意味定義は TIM 語彙カタログ SPEC が正とし、カタログ実体の整備後に本表を
// 置き換える。暫定表の各行の出所は下記の出所コメントを参照。
//
// 出所（契約テキスト）:
// - references は一般参照であり、impact/dependency の探索経路として使用しない
//   （「一般参照または変更影響なしと定義された関係を、単にリンクが存在することだけを
//   理由に探索経路として使用しない」「依存関係として定義されていない一般参照を
//   依存関係として扱わない」）
// - 索引・集約成果物（README 等）を経由する候補増幅を候補数上限だけで抑制しない。
//   よって索引・集約役割ノードは候補として返しつつ探索を先へ伝播させない
// - 意味未定義の関係型は高位問い合わせに参加させない（低位問い合わせ限定利用）

import type { GraphData } from "../../lib/model.ts"
import type {
  HighLevelProfile,
  LimitCandidate,
  NodeRole,
  RelationSemantics,
} from "./types.ts"

/**
 * 暫定関係意味表。既知5関係型 + augmentation 5関係型。
 * - supersedes: 置換・改訂。新旧の相互参照を維持する前提で変更影響は双方向とする（暫定）
 * - delegates_to / extends: 委譲・拡張は依存を含意する（委譲元・拡張元が依存する）
 * - contains / defined_in: ファイル包含。変更影響・依存の意味は TIM カタログ整備待ちで不参加
 * - governs: 統制関係。意味定義は TIM カタログ整備待ちで related 参加のみ
 */
export const RELATION_SEMANTICS: Readonly<Record<string, RelationSemantics>> = {
  references: { general_reference: true, impact: "none", dependency: "none", realization_series: false, defined: true },
  supersedes: { general_reference: false, impact: "both", dependency: "none", realization_series: false, defined: true },
  delegates_to: { general_reference: false, impact: "none", dependency: "source_depends_on_target", realization_series: false, defined: true },
  extends: { general_reference: false, impact: "none", dependency: "source_depends_on_target", realization_series: false, defined: true },
  contains: { general_reference: false, impact: "none", dependency: "none", realization_series: false, defined: true },
  defined_in: { general_reference: false, impact: "none", dependency: "none", realization_series: false, defined: true },
  governs: { general_reference: false, impact: "none", dependency: "none", realization_series: false, defined: true },
}

/** 意味未定義関係型の既定 semantics（全プロファイル不参加。低位問い合わせ限定利用）。 */
export const UNDEFINED_RELATION_SEMANTICS: RelationSemantics = {
  general_reference: false,
  impact: "none",
  dependency: "none",
  realization_series: false,
  defined: false,
}

export function semanticsFor(relationType: string): RelationSemantics {
  return RELATION_SEMANTICS[relationType] ?? UNDEFINED_RELATION_SEMANTICS
}

/**
 * 暫定ノード役割表。グラフモデル上、source_file 型は正規成果物ノード
 * （requirement/decision/specification/command/skill 等）に対する非正規ファイル層であり、
 * README 等の索引・集約成果物はこの層にのみ存在する。役割による識別（名称ではなく役割）の
 * 暫定実装として型ベースの割当てを行い、TIM カタログ整備後にカタログ定義へ差し替える。
 */
export const NODE_TYPE_ROLES: Readonly<Record<string, NodeRole>> = {
  source_file: "index_aggregation",
}

export function roleOf(nodeType: string): NodeRole {
  return NODE_TYPE_ROLES[nodeType] ?? "canonical"
}

function participates(
  profile: HighLevelProfile,
  semantics: RelationSemantics,
  side: "outgoing" | "incoming",
): boolean {
  switch (profile) {
    case "related":
      return semantics.defined
    case "impact":
      if (semantics.impact === "none") return false
      if (side === "outgoing") return semantics.impact === "forward" || semantics.impact === "both"
      return semantics.impact === "backward" || semantics.impact === "both"
    case "dependency":
      if (semantics.dependency === "none") return false
      if (side === "outgoing") return semantics.dependency === "source_depends_on_target"
      return semantics.dependency === "target_depends_on_source"
    case "implementation":
      return semantics.realization_series
    default: {
      const exhaustive: never = profile
      throw new TypeError(`unsupported profile: ${JSON.stringify(exhaustive)}`)
    }
  }
}

type Arrival = {
  readonly to: string
  readonly relationType: string
  readonly side: "outgoing" | "incoming"
}

function arrivalsFor(graph: GraphData, node: string): readonly Arrival[] {
  const arrivals: Arrival[] = []
  for (const edge of graph.edges) {
    if (edge.source === node) {
      arrivals.push({ to: edge.target, relationType: edge.type, side: "outgoing" })
    }
    if (edge.target === node) {
      arrivals.push({ to: edge.source, relationType: edge.type, side: "incoming" })
    }
  }
  return arrivals.sort((left, right) =>
    `${left.to}\u0000${left.relationType}\u0000${left.side}`.localeCompare(
      `${right.to}\u0000${right.relationType}\u0000${right.side}`,
    ),
  )
}

/**
 * プロファイル意味に従う候補列挙（決定論的 BFS）。
 * - 参加条件を満たす関係のみ辿る
 * - 索引・集約役割ノードは候補に加えるが探索を伝播させない
 * - 同一候補への複数経路は最初の決定論的到達のみ記録する（depth 昇順、到達順安定ソート）
 */
type FrontierNode = {
  readonly node: string
  readonly path: readonly string[]
}

export function semanticCandidates(
  graph: GraphData,
  profile: HighLevelProfile,
  start: string,
  maxDepth: number,
): readonly LimitCandidate[] {
  const nodeTypes = new Map(graph.nodes.map((node) => [node.id, node.type]))
  const candidates = new Map<string, LimitCandidate>()
  const visited = new Set([start])
  let frontier: readonly FrontierNode[] = [{ node: start, path: [start] }]
  for (let depth = 1; depth <= maxDepth; depth += 1) {
    const next = new Map<string, FrontierNode>()
    for (const current of frontier) {
      if (roleOf(nodeTypes.get(current.node) ?? "") === "index_aggregation") continue
      for (const arrival of arrivalsFor(graph, current.node)) {
        if (!participates(profile, semanticsFor(arrival.relationType), arrival.side)) continue
        if (arrival.to === start || visited.has(arrival.to)) continue
        if (!next.has(arrival.to)) {
          next.set(arrival.to, { node: arrival.to, path: [...current.path, arrival.to] })
        }
        if (!candidates.has(arrival.to)) {
          candidates.set(arrival.to, {
            candidate: arrival.to,
            reason: `${profile} via ${arrival.relationType} (${arrival.side}) at depth ${depth}`,
            relation_type: arrival.relationType,
            direction: arrival.side,
            path: [...current.path, arrival.to],
          })
        }
      }
    }
    for (const entry of next.values()) visited.add(entry.node)
    frontier = [...next.values()].sort((left, right) => left.node.localeCompare(right.node))
  }
  return [...candidates.values()].sort((left, right) => left.candidate.localeCompare(right.candidate))
}
