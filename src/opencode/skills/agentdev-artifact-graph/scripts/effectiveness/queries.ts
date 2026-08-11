// effectiveness/queries.ts — 代表的な workflow question 6 種と ground truth 定義。
//
// 各 query は real AgentDevFlow artifact（docs/requirements/<REQ-*>.md,
// docs/decisions/<DEC-*>.md, docs/specs/**, src/opencode/{commands,skills}/**,
// .agentdev/extensions/**）を参照する。ground truth は各ファイルの
// frontmatter, See Also, 関連 REQ 欄, extension yaml の rules.skill / checks.skill 等、
// 追跡可能な事実に基づき選定した。
//
// 各 groundTruthRationale は選定根拠を残し、 harness 利用者が再検証できるようにする。

import type { EffectivenessQuery } from "./types.ts"

/**
 * Q1: REQ-{NNNN} (Artifact Graph 標準化) の変更影響候補。
 *
 * Graph は neighbors(`requirement:REQ-{NNNN}`, depth=1) で直接エッジを辿る。
 * Graph は markdown_link と frontmatter の参照のみを拾うため、本文中の文字列
 * 「REQ-{NNNN}」は候補にならない（REQ-{NNNN}/020/021 の関連 REQ 欄は本文記述のため
 * Graph からは見えない）。一方、独立探索 (rg `\bREQ-012\b`) は文字列表現を全件
 * 拾うため、関連 REQ 欄、README の索引、過去版言及（v2:REQ-{NNNN} 等の部分文字列
 * リスク含む）まで広く拾う。
 *
 * ground truth は「Artifact Graph 標準化の要件文書として明示的に相互リンクされた
 * 成果物」に限定する（markdown link または frontmatter 由来の構造的参照のみ。
 * 単なる文字列表現は候補から外す）。
 */
const Q1_REQ_CHANGE_IMPACT: EffectivenessQuery = {
  id: "Q1-req-012-impact",
  category: "req-change-impact",
  question: "REQ-{NNNN} (Artifact Graph 標準化) を変更した場合、影響を受ける成果物は何か？",
  graphQuery: {
    kind: "graph-query",
    query: { kind: "neighbors", node: "requirement:REQ-{NNNN}", depth: 1 },
    resultFilter: {
      includeTypes: ["specification", "decision", "requirement", "command", "skill", "integrity_rule"],
      excludeNodes: ["requirement:REQ-{NNNN}"],
    },
  },
  independentSearch: {
    kind: "grep",
    pattern: "\\bREQ-012\\b",
    roots: ["docs", ".agentdev/extensions", "src/opencode"],
    extensions: [".md", ".yaml", ".yml", ".ts"],
  },
  groundTruth: ["specification:docs/specs/<skills/agentdev-artifact-graph>.md"],
  groundTruthRationale:
    "agentdev-artifact-graph SPEC の See Also セクションが REQ-{NNNN}.md への markdown link を持ち、" +
    "Graph 上で specification→requirement の構造的参照エッジとして現れる。" +
    "REQ-{NNNN}/020/021 の関連 REQ 欄は本文記述であり Graph の抽出対象外、" +
    "README の索引行も候補から外す（影響分析の意味ある候補ではないため）。",
}

/**
 * Q2: 同一 canonical_owner を持つ SPEC。
 *
 * Graph は「同一フィールド値で SPEC を束ねる」操作を直接提供しない。
 * references relation が canonical_owner 由由で生成されるが、alias 解決の結果
 * 自己ループに落ちる例が多く（例: agentdev-artifact-graph SPEC）、same-owner 検索
 * には不適。harness は Graph の discover API（実質的にテキスト検索）と、
 * rg による frontmatter 走査を比較する。
 *
 * ground truth は frontmatter `canonical_owner:` 行の値が一致する SPEC ファイル一覧。
 */
const Q2_SAME_CANONICAL_OWNER: EffectivenessQuery = {
  id: "Q2-canonical-owner-artifact-graph",
  category: "same-canonical-owner",
  question: "canonical_owner が `agentdev-artifact-graph` である SPEC はどれか？",
  graphQuery: {
    kind: "discover",
    term: "canonical_owner: agentdev-artifact-graph",
    roots: ["docs/specs"],
  },
  independentSearch: {
    kind: "frontmatterField",
    field: "canonical_owner",
    value: "agentdev-artifact-graph",
    roots: ["docs/specs"],
    extensions: [".md"],
  },
  groundTruth: ["specification:docs/specs/<skills/agentdev-artifact-graph>.md"],
  groundTruthRationale:
    "frontmatter 行 `canonical_owner: agentdev-artifact-graph` を持つ SPEC は " +
    "docs/specs/<skills/agentdev-artifact-graph>.md のみ（rg で確済）。" +
    "他 SPEC は owner 値が異なるか frontmatter 未設定のため候補外。",
}

/**
 * Q3: agentdev-artifact-graph SPEC に関連する command / skill / integrity_rule。
 *
 * Graph は neighbors(spec, depth=2) で関連集合を得る。extension node を経由して
 * command/skill に、references markdown link で他 SPEC に到達する。
 *
 * ground truth は SPEC 本文または extension yaml が agentdev-artifact-graph を明示的に
 * 参照する成果物（command: case-close, case-open, case-run, req-define, spec-save;
 * skill: agentdev-adversarial-review）。
 */
const Q3_RELATED_COMMAND_SKILL_IR: EffectivenessQuery = {
  id: "Q3-related-to-artifact-graph-spec",
  category: "related-command-skill-ir",
  question:
    "agentdev-artifact-graph SPEC に関連する command, skill, integrity_rule は何か？",
  graphQuery: {
    kind: "graph-query",
    query: {
      kind: "neighbors",
      node: "specification:docs/specs/<skills/agentdev-artifact-graph>.md",
      depth: 2,
    },
    resultFilter: {
      includeTypes: ["command", "skill", "integrity_rule"],
    },
  },
  independentSearch: {
    kind: "grep",
    pattern: "agentdev-artifact-graph",
    roots: [
      "src/opencode/commands",
      "src/opencode/skills",
      ".agentdev/extensions/commands",
      ".agentdev/extensions/skills",
      "docs/specs/integrity/rules",
    ],
    extensions: [".md", ".yaml", ".yml"],
  },
  groundTruth: [
    "command:case-close",
    "command:case-open",
    "command:case-run",
    "command:req-define",
    "command:spec-save",
    "skill:agentdev-adversarial-review",
  ],
  groundTruthRationale:
    ".agentdev/extensions 配下の各 command extension yaml が rules.skill: agentdev-artifact-graph を持ち、" +
    "agentdev-adversarial-review extension も同様。" +
    "Graph 上で extension node を介した delegates_to / extends により" +
    "specification→extension→command/skill と到達可能。" +
    "integrity_rule で本 SPEC を直接参照する IR は現時点で存在しない。",
}

/**
 * Q4: command から委譲される skill（delegates_to）。
 *
 * Graph は「extension node を経由した delegates_to エッジ」で command から委譲先を辿れる。
 * 独立探索は .agentdev/extensions/commands/<name>.yaml の rules.skill / checks.skill を直接 grep。
 *
 * ground truth は case-close extension yaml に宣言された 2 つの skill。
 * case-close は agents-dev-flow で数少ない複数 skill 委譲を持つ command であり、
 * 単一委譲の典型例 (case-open, case-run 等) より比較の分解能が高い。
 */
const Q4_DELEGATION_TARGET_SKILL: EffectivenessQuery = {
  id: "Q4-case-close-delegation-targets",
  category: "delegation-target-skill",
  question: "case-close command が実際に委譲する skill は何か？",
  graphQuery: {
    kind: "graph-query",
    query: {
      kind: "neighbors",
      node: "command:case-close",
      depth: 2,
    },
    resultFilter: {
      includeTypes: ["skill", "specification"],
    },
  },
  independentSearch: {
    kind: "grep",
    pattern: "^\\s*skill:\\s*\\S+",
    roots: [".agentdev/extensions/commands"],
    extensions: [".yaml", ".yml"],
  },
  groundTruth: [
    "skill:repo-agentdev-integrity",
    "specification:docs/specs/<skills/agentdev-artifact-graph>.md",
  ],
  groundTruthRationale:
    ".agentdev/extensions/commands/case-close.yaml の rules[0].skill = agentdev-artifact-graph、" +
    "checks[0].skill = repo-agentdev-integrity。" +
    "Graph は alias 解決で前者を specification:docs/specs/<skills/agentdev-artifact-graph>.md、" +
    "後者を skill:repo-agentdev-integrity に正規化する。" +
    "独立探索はテキスト `skill:` 行を全件拾うため、他 command の skill 行も候補となる。",
}

/**
 * Q5: superseded artifact への現行参照。
 *
 * Graph は supersedes エッジの target を特定し、それ以外のエッジで target に入る
 * 現行参照を列挙できる。独立探索は各 superseded ID を rg で探すが、superseded 自身の
 * ファイルや README 索引行、関連 REQ 欄などのノイズを含む。
 *
 * ground truth は superseded artifact を指す README 索引エントリ（docs/decisions/README.md と
 * docs/specs/README.md）。これらは superseded を残す運用上やむを得ないが、検出対象の典型例。
 */
const Q5_SUPERSEDED_CURRENT_REFS: EffectivenessQuery = {
  id: "Q5-superseded-current-refs",
  category: "superseded-current-refs",
  question: "superseded な成果物を、現行の成果物がまだ参照しているか？",
  graphQuery: {
    // Graph は supersedes の target を起点に neighbors(depth=1) で現行参照を得る。
    // harness 側で「supersedes エッジ以外で入ってくるエッジ」を残す。
    kind: "graph-query",
    query: {
      kind: "neighbors",
      node: "decision:DEC-{N}",
      depth: 1,
    },
    resultFilter: {
      includeTypes: ["specification", "requirement", "decision", "command", "skill", "integrity_rule", "source_file"],
      excludeNodes: ["decision:DEC-{N}", "decision:DEC-{N}"],
    },
  },
  independentSearch: {
    kind: "grep",
    pattern: "\\bDEC-005\\b",
    roots: ["docs", "src/opencode"],
    extensions: [".md", ".yaml", ".yml"],
  },
  groundTruth: ["source_file:docs/decisions/README.md"],
  groundTruthRationale:
    "Graph 上で decision:DEC-{N} へ入ってくる references エッジの source は " +
    "docs/decisions/README.md の索引行のみ（markdown link で DEC-{N} を明示）。" +
    "supersedes の source である DEC-{N} 自身は除外。" +
    "独立探索は追加で DEC-{N}.md 本文中の言及も拾うが、後継 Decision からの言及は" +
    "superseded を指す「正当な参照」であり、本 query の関心（不正な現行参照）から外れるため" +
    "ground truth からは外す。",
}

/**
 * Q6: 変更後の dangling relation 候補。
 *
 * 「agentdev-artifact-graph SPEC を削除した場合、どの relation が dangling になるか？」
 * を代表例とする。Graph は該当 node に接続する全エッジを列挙できる。独立探索は
 * 当該 SPEC へのパス文字列を rg で探すが、relation 種別の分類はできない。
 *
 * ground truth は Graph 上で該当 SPEC に接続する非自己エッジの source 側 node のうち、
 * 除去された場合に relation が dangling になる相手（references / defined_in / contains
 * / supersedes を含む）。本 query は SPEC を「-spec」した場合の dangling 候補を提示する。
 */
const Q6_POST_CHANGE_DANGLING: EffectivenessQuery = {
  id: "Q6-dangling-on-artifact-graph-spec-removal",
  category: "post-change-dangling-relation",
  question:
    "agentdev-artifact-graph SPEC をリポジトリから削除した場合、どの成果物との relation が dangling になるか？",
  graphQuery: {
    kind: "graph-query",
    query: {
      kind: "neighbors",
      node: "specification:docs/specs/<skills/agentdev-artifact-graph>.md",
      depth: 1,
    },
    resultFilter: {
      includeTypes: [
        "specification",
        "requirement",
        "decision",
        "command",
        "skill",
        "integrity_rule",
        "extension",
        "source_file",
      ],
      excludeNodes: ["specification:docs/specs/<skills/agentdev-artifact-graph>.md"],
    },
  },
  independentSearch: {
    kind: "grep",
    pattern: "agentdev-artifact-graph\\.md",
    roots: ["docs", "src/opencode", ".agentdev/extensions"],
    extensions: [".md", ".yaml", ".yml"],
  },
  groundTruth: [
    "requirement:REQ-{NNNN}",
    "requirement:REQ-{NNNN}",
    "requirement:REQ-{NNNN}",
    "decision:DEC-{N}",
    "specification:docs/specs/<foundations/document-model>.md",
    "specification:docs/specs/<local/artifact-graph>.md",
    "source_file:docs/specs/README.md",
    "extension:.agentdev/extensions/commands/case-close.yaml",
    "extension:.agentdev/extensions/commands/case-open.yaml",
    "extension:.agentdev/extensions/commands/case-run.yaml",
    "extension:.agentdev/extensions/commands/req-define.yaml",
    "extension:.agentdev/extensions/commands/spec-save.yaml",
    "extension:.agentdev/extensions/skills/agentdev-adversarial-review.yaml",
  ],
  groundTruthRationale:
    "Graph 上で specification:docs/specs/<skills/agentdev-artifact-graph>.md に接続する" +
    "非自己エッジの相手側 node。markdown link で See Also を持つ REQ/DEC/SPEC、" +
    "README の索引行、extension yaml の context.paths / rules.skill が対象。" +
    "本 SPEC を削除するとこれらの relation が dangling になる。",
}

/**
 * 全 6 query の代表 suite。
 * REQ-{NNNN}-{NNN} が列挙する 6 category と 1:1 対応する。各クエリは real artifact 参照を持ち、
 * mock/stub は一切使用しない。
 */
export const QUERY_SUITE: readonly EffectivenessQuery[] = [
  Q1_REQ_CHANGE_IMPACT,
  Q2_SAME_CANONICAL_OWNER,
  Q3_RELATED_COMMAND_SKILL_IR,
  Q4_DELEGATION_TARGET_SKILL,
  Q5_SUPERSEDED_CURRENT_REFS,
  Q6_POST_CHANGE_DANGLING,
]
