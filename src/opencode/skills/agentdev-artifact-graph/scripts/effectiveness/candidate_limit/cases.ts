// candidate_limit/cases.ts — 候補数上限回帰の代表ケース定義（REQ-{NNNN}-006）。
//
// 代表ケースは代表質問回帰検証（REQ-{NNNN}-003、effectiveness/ 本体の 6 query suite）とは
// 別概念である: 高位問い合わせの標準候補数上限を決定する根拠となる回帰測定のケース群で
// あり、同体系（実行契機、real artifact 参照、選定根拠の明示）に接続して運用する。
// 代表質問側の 10件選定基準（REQ-{NNNN}-005 相当）は再定義しない。
//
// 各ケースは real artifact（docs/**、.agentdev/extensions/**）のみを参照し、
// mock/stub を使用しない。選定根拠（selectionRationale）は実入力 fixture 設計原則
// （REQ-{NNNN}-004 相当）の「選定基準の明示」に従う。

import { formatDecisionId } from "../../../../agentdev-decision-file-manager/scripts/src/alloc-decision-number.ts"
import { formatReqId } from "../../../../agentdev-req-file-manager/scripts/src/alloc-req-number.ts"
import type { RepresentativeCase } from "./types.ts"

const REQ_012 = formatReqId(12)
const REQ_020 = formatReqId(20)
const DEC_005 = formatDecisionId(5)
const DEC_007 = formatDecisionId(7)

const REQ_020_NODE = `requirement:${REQ_020}`
const REQ_012_NODE = `requirement:${REQ_012}`
const DEC_005_NODE = `decision:${DEC_005}`
const SKILLS_DIR = `${"skills"}`
const AG_SPEC_NODE = `specification:docs/specs/${SKILLS_DIR}/agentdev-artifact-graph.md`
const EXT_DIR = ".agentdev/extensions/skills"
const EXT_CASE_CLOSE = `extension:${EXT_DIR}/agentdev-workflow-case-close.yaml`
const SKILL_CASE_CLOSE = "skill:agentdev-workflow-case-close"
const SKILL_REPO_INTEGRITY = "skill:repo-agentdev-integrity"
const REQ_README = "source_file:docs/requirements/README.md"

/** AG SPEC へ delegates_to する 6 extension（実測: 全 delegates_to 7辺のうち 6辺）。 */
const AG_SPEC_DELEGATING_EXTENSIONS = [
  `extension:${EXT_DIR}/agentdev-workflow-case-open.yaml`,
  EXT_CASE_CLOSE,
  `extension:${EXT_DIR}/agentdev-workflow-case-run.yaml`,
  `extension:${EXT_DIR}/agentdev-workflow-req-define.yaml`,
  `extension:${EXT_DIR}/agentdev-workflow-spec-save.yaml`,
  `extension:${EXT_DIR}/agentdev-adversarial-review.yaml`,
] as const

const CASE_1_RELATED_REQ_NORMAL: RepresentativeCase = {
  id: "case-1-related-req-normal",
  profile: "related",
  start: REQ_020_NODE,
  depth: 1,
  caseClass: "normal",
  selectionRationale:
    "正常ケース。要件文書への直結参照のみで構成される（SPEC See Also の逆方向）。" +
    "ファイル層（source_file 型、索引役割宣言）は中間経路と到達点の両方から除外されるため、" +
    "一般参照で到達する AG SPEC のみを返す基線を代表する。",
  requiredCandidates: [AG_SPEC_NODE],
  minAmplifiedCount: 0,
  independentSearchPattern: `\\b${REQ_020}\\b`,
}

const CASE_2_RELATED_REQ_AMPLIFICATION: RepresentativeCase = {
  id: "case-2-related-req-amplification",
  profile: "related",
  start: REQ_020_NODE,
  depth: 2,
  caseClass: "amplification",
  selectionRationale:
    "増幅ケース。README 等を経由した既知の候補増幅を再現する。" +
    `起点要件は ${REQ_README}（索引・集約成果物、参照ファンアウト約40）からも参照されており、` +
    "意味フィルタなしの巡回では全要件・全 Decision へ増幅する。" +
    "意味列挙側は索引役割宣言（role: index）による探索経路除外で増幅を抑制する" +
    "（候補数上限 alone では抑制しない）。深さ2の構造的隣接（SPEC の See Also、委譲元 extension）を必須候補とする。",
  requiredCandidates: [
    AG_SPEC_NODE,
    REQ_012_NODE,
    `decision:${DEC_007}`,
    `extension:${EXT_DIR}/agentdev-workflow-case-run.yaml`,
  ],
  minAmplifiedCount: 30,
  independentSearchPattern: `\\b${REQ_020}\\b`,
}

const CASE_3_RELATED_SPEC_AMPLIFICATION: RepresentativeCase = {
  id: "case-3-related-spec-amplification",
  profile: "related",
  start: AG_SPEC_NODE,
  depth: 2,
  caseClass: "amplification",
  selectionRationale:
    "増幅ケース（索引・集約成果物経由）。SPEC 起点では docs/specs/README.md" +
    "（参照ファンアウト約67）経由の増幅が支配的である。" +
    "委譲元 6 extension（delegates_to のカタログ意味定義）と拡張関係（extends）による skill 参加を必須候補とする。",
  requiredCandidates: [...AG_SPEC_DELEGATING_EXTENSIONS, SKILL_CASE_CLOSE],
  minAmplifiedCount: 30,
  independentSearchPattern: "agentdev-artifact-graph\\.md",
}

const CASE_4_IMPACT_EMPTY_NORMAL: RepresentativeCase = {
  id: "case-4-impact-req-empty-normal",
  profile: "impact",
  start: REQ_020_NODE,
  depth: 2,
  caseClass: "semantic-separation",
  selectionRationale:
    "意味分離ケース。起点要件の変更影響関係（defined_in、contains）の到達点はファイル層" +
    "（索引役割）であり探索経路から除外されるため、semantic 側は正常な空結果となる。" +
    "一般参照経由の候補増幅（README 経由）は発生しない。空結果を正常扱いとする契約の代表。",
  requiredCandidates: [],
  minAmplifiedCount: 20,
  independentSearchPattern: `\\b${REQ_020}\\b`,
}

const CASE_5_IMPACT_SUPERSEDES: RepresentativeCase = {
  id: "case-5-impact-supersedes",
  profile: "impact",
  start: DEC_005_NODE,
  depth: 2,
  caseClass: "semantic-separation",
  selectionRationale:
    "意味分離ケース（置換・改訂）。supersedes は変更影響方向 none（TIM 語彙カタログ確定値）であり、" +
    "後継 Decision への変更影響探索を行わない。暫定関係意味表（双方向扱い）からの差分確認ケース。" +
    "起点の変更影響関係の到達点はファイル層（索引役割）のみのため正常な空結果となる。" +
    "README 経由の増幅と一般参照の誤通過を排除する対比を確認する。",
  requiredCandidates: [],
  minAmplifiedCount: 10,
  independentSearchPattern: `\\b${DEC_005}\\b`,
}

const CASE_6_DEPENDENCY_DELEGATION: RepresentativeCase = {
  id: "case-6-dependency-delegation",
  profile: "dependency",
  start: EXT_CASE_CLOSE,
  depth: 2,
  caseClass: "semantic-separation",
  selectionRationale:
    "意味分離ケース（依存）。委譲元 extension 起点で、委譲（delegates_to、意味スロット depend）と" +
    "拡張（extends、意味スロット refine）の依存意味により依存先（AG SPEC、統合検証 skill、自身の Workflow Skill）を特定する。" +
    "定義所在（defined_in）の依存先はファイル層（索引役割）として除外される。" +
    "一般参照・README 経由の候補を依存関係として扱わない契約の代表。",
  requiredCandidates: [AG_SPEC_NODE, SKILL_REPO_INTEGRITY, SKILL_CASE_CLOSE],
  minAmplifiedCount: 10,
  independentSearchPattern: "agentdev-workflow-case-close",
}

/** 候補数上限回帰の代表ケース suite（計6件）。 */
export const CANDIDATE_LIMIT_CASES: readonly RepresentativeCase[] = [
  CASE_1_RELATED_REQ_NORMAL,
  CASE_2_RELATED_REQ_AMPLIFICATION,
  CASE_3_RELATED_SPEC_AMPLIFICATION,
  CASE_4_IMPACT_EMPTY_NORMAL,
  CASE_5_IMPACT_SUPERSEDES,
  CASE_6_DEPENDENCY_DELEGATION,
]
