---
draft_type: req_draft
topic_slug: doc-structural-cleanup
status: saved
created_at: 2026-06-26T21:50:00+09:00
---

# draft-data

```yaml
work_type: docs_chore

summary: |
  取り下げ4 Issue（#1118/#1087/#1086/#1092）の残課題のうち、per-file 査読と文脈判断を要する構造的整形（39 REQ ファイルの要件行主語明示、件数記載・ガイド名列挙の硬直的固定記述排除、27 SKILL.md の概要節/機能節重複解消）を、REQ-0140-026（文書品質準拠）への APPEND と SPEC UPDATE（document-type-responsibilities.md、integrity-rule-catalog.md）で処理する。単一 standard Issue で完結する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      39 REQ ファイル（docs/requirements/REQ-*.md）の要件行に操作主体（command 名、skill 名、ユーザー、システム）を明示する。enum 定義、派生ルール、システム側判断ルールなど主体明示が不要な場合は境界判断として除外する。サンプリング調査（#1087）では主体明示あり/なし混在（REQ-0101-047 は req-define 明示、REQ-0101-005 frontmatter 要件は主体不要等）。
  - id: AG-002
    content: |
      REQ-0114（9件）、REQ-0130（2件）、REQ-0148（1件）の現行 REQ ファイル内の件数記載を排除する。docs/requirements/README.md の件数記載は SPEC/README 側管理として許容する。
  - id: AG-003
    content: |
      REQ-0101-014（L30）のガイドファイル名列挙（quickstart, command-selection 等10ファイル）を docs/guides/README.md のガイド一覧への参照へ縮退する。ガイド一覧は既に guides/README.md に完全一致で存在（#1087 調査で確認済）。
  - id: AG-004
    content: |
      27 SKILL.md の概要節（## 概要 等）と機能節（## 責務, ## USE FOR 等）の重複を解消する。概要節は入口（簡潔な導入）、機能節は新情報追加（詳細）の役割分担に統一する。サンプリング調査（#1086）で3ファイル（agentdev-workflow-orchestration, agentdev-intake-pipeline, agentdev-workflow-routing）で重複確認済。残り2ファイル（agentdev-gh-cli, agentdev-doc-writing）は役割分担 OK。
  - id: AG-005
    content: |
      docs/specs/document-type-responsibilities.md に SKILL 構造（概要節=入口、機能節=新情報追加）の運用基準を明文化し、docs/specs/integrity/integrity-rule-catalog.md に regression_test フィールド運用方針（「(追加予定)」vs「(未実装)」の使い分け基準、または空欄運用）を明文化する。両 SPEC は新規セクション追加で対応する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: REQ-0140
    source_items: [AG-001, AG-002, AG-003, AG-004]
    content: |
      | REQ-0140-028 | docs/requirements/REQ-*.md の要件行は操作主体（command 名、skill 名、ユーザー、システム）を明示すること。ただし enum 定義、派生ルール、システム側判断ルールなど主体明示が不要な場合はこの限りでないこと |
      | REQ-0140-029 | REQ-0114/0130/0148 等の現行 REQ ファイル内の件数記載は SPEC/README 側で一元管理し、当該 REQ ファイル内に残留させないこと。docs/requirements/README.md の件数記載は許容する |
      | REQ-0140-030 | REQ-0101-014 のガイドファイル名列挙は docs/guides/README.md のガイド一覧への参照へ縮退すること |
      | REQ-0140-031 | src/opencode/skills/*/SKILL.md は概要節が入口（簡潔な導入）、各機能節が新情報追加（詳細）の役割分担を持つこと。概要節と機能節の重複は agentdev-doc-writing の查読対象とすること |
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/specs/document-type-responsibilities.md
    source_items: [AG-005]
    content: |
      ## SKILL 構造（概要節/機能節役割分担）

      SKILL.md の節構成は以下の役割分担に従う。

      | 節 | 役割 | 内容 |
      |---|---|---|
      | 概要節（`# {スキル名}` 直下、`## 目的` 等） | 入口 | スキルの役割、位置づけを簡潔に導入。機能説明の詳細は含まない |
      | 機能節（`## 責務`, `## USE FOR`, `## 担当` 等） | 新情報追加 | 概要節で触れない具体的な対象、対象外、查読観点、判定基準を詳細に記述 |

      **禁止パターン**: 概要節に機能節と同じ内容の詳細説明を含め、機能節で再説明する重複構造。SKILL.md 査読時（agentdev-doc-writing）に概要節と機能節の重複を検出し、概要節を簡潔な導入へ縮退するよう指示する。

      **適用対象**: src/opencode/skills/agentdev-*/SKILL.md（全27ファイル）。
  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target: docs/specs/integrity/integrity-rule-catalog.md
    source_items: [AG-005]
    content: |
      ## regression_test フィールド運用方針

      IR-NNN（個別 integrity rule）の `regression_test` フィールドは以下の運用方針に従う。

      | 表記 | 使用場面 | 備考 |
      |---|---|---|
      | `(未実装)` | 回帰テストが未実装の場合 | 現状記載として優先。SPEC 原則（現在どう動作しているか）に整合 |
      | 空欄 | 回帰テストが適用外、または判定不能の場合 | 「(追加予定)」は使用しない |
      | （fixture や検証手続きの実体記述） | 回帰テストが実装済みの場合 | 実在するテストデータ、検証手続きを記述 |

      **禁止表記**: `(追加予定)`。将来実装計画を含み、SPEC 原則（現在仕様、契約記述に限定）に対し境界ケース。既存 IR-025〜IR-051 で `(追加予定)` を使用している場合は `(未実装)` へ統一する。

      **新規 IR 作成時**: `regression_test` フィールドは原則 `(未実装)` で開始し、回帰テスト実装後に実体記述へ更新する。

conflict_resolutions:
  - id: CR-001
    conflict: |
      SKILL 構造（AG-004/AG-005）を REQ-0140 APPEND で扱うか、SPEC 新設で扱うか。
    resolution: |
      REQ-0140 APPEND と document-type-responsibilities.md SPEC UPDATE の両方で扱う（A2-2 合意）。REQ 側に「SKILL.md は概要節=入口、機能節=新情報追加の役割分担を持つこと」を要件行として追加し、SPEC 側に詳細な運用基準（節構成、禁止パターン、適用対象）を明文化する。X-7（backticks 境界）の #1165 と同様の REQ+SPEC 二段構成。

operation_units:
  - ou_id: OU-001
    target_req: REQ-0140
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    target_spec: docs/specs/document-type-responsibilities.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    target_spec: docs/specs/integrity/integrity-rule-catalog.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      docs/requirements/REQ-*.md（39ファイル）からサンプリング（10ファイル以上）で要件行を抽出し、操作主体が明示されているか確認する。enum 定義・派生ルール等の主体不要ケースは除外する。
    pass_criteria: |
      サンプリングした要件行のうち、主体明示が期待される行の100%に操作主体（command/skill/user/system）が明示されている。
    on_failure: |
      fix-and-reverify。主体明示の漏れが疑われるため、該当 REQ ファイルを再査読し主体を追加する。
  - id: TS-002
    target_item: AG-002
    verification: |
      REQ-0114.md, REQ-0130.md, REQ-0148.md を読み、件数記載（「N件」「N個」等）の有無を確認する。docs/requirements/README.md の件数記載は許容対象外として扱う。
    pass_criteria: |
      REQ-0114/0130/0148 の3ファイル内で件数記載が0件。docs/requirements/README.md の件数記載は許容。
    on_failure: |
      fix-and-reverify。件数記載の削除漏れが疑われるため、該当箇所を README/SPEC 参照へ置換する。
  - id: TS-003
    target_item: AG-003
    verification: |
      REQ-0101.md L30（REQ-0101-014）を読み、ガイドファイル名列挙が docs/guides/README.md 参照へ縮退されているか確認する。
    pass_criteria: |
      REQ-0101-014 にガイドファイル名の直接列挙がなく、docs/guides/README.md 参照になっている。
    on_failure: |
      fix-and-reverify。縮退が不十分な場合、ガイドファイル名列挙を削除し参照へ置換する。
  - id: TS-004
    target_item: AG-004
    verification: |
      src/opencode/skills/agentdev-*/SKILL.md（27ファイル）を走査し、概要節と機能節の重複を検出する。サンプリング（5ファイル以上）で概要節が入口、機能節が新情報追加の役割分担になっているか確認する。
    pass_criteria: |
      全27ファイル（またはサンプリング5ファイル以上）で概要節と機能節の重複が0件。
    on_failure: |
      fix-and-reverify。重複が疑われる場合、概要節を簡潔な導入へ縮退する。
  - id: TS-005
    target_item: AG-005
    verification: |
      docs/specs/document-type-responsibilities.md に「SKILL 構造（概要節/機能節役割分担）」セクションが追加されているか確認する。docs/specs/integrity/integrity-rule-catalog.md に「regression_test フィールド運用方針」セクションが追加されているか確認する。
    pass_criteria: |
      両 SPEC に所定のセクションが追加され、内容が AG-005 の合意内容と整合している。
    on_failure: |
      fix-and-reverify。セクション追加漏れまたは内容不整合の場合、SPEC を再修正する。

case_open_hints:
  epic_needed: false
  decomposition: []
  wave_hints: []
```

# summary

本 draft は取り下げ4 Issue（#1118/#1087/#1086/#1092）の残課題のうち、per-file 査読と文脈判断を要する構造的整形を対象とする。REQ-0140-026（文書品質準拠）への APPEND（AG-001〜004 の要件行）と、2 SPEC UPDATE（document-type-responsibilities.md に SKILL 構造明文化、integrity-rule-catalog.md に regression_test 運用方針明文化）で構成する。単一 standard Issue で完結（case_open_hints.epic_needed=false）。

検討経緯:
- #1087 残（要件2/4）、#1086 残（SUB-C）、#1092 残（IR 表記運用）を統合。機械是正系（OU-001 別 draft）と判断是正系（本 draft）に2本化した（ユーザー合意: (c) 2本化）。
- SKILL 構造は REQ APPEND と SPEC UPDATE の二段構成（A2-2, CR-001）。X-7（backticks 境界）#1165 と同様の構成。
- regression_test 運用方針は #1092 残課題の SPEC 化。AG-005 の要件行（REQ-0140-031）と SPEC UPDATE で二段構成。
