---
draft_type: req_draft
topic_slug: skill-md-overlap-review
status: saved
created_at: 2026-06-28T12:00:00+09:00
source_rus:
  - RU-0013
spec_actions_consumed: true
---

<!-- req_draft テンプレート
  このテンプレートは req-define が生成する構造化引き継ぎ成果物の原本である。
  後続工程（req-save/ spec-save/ case-open/ case-auto/ case-run/ case-close）が参照する
  原本の情報源は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。
  soft contract（生成元側標準）であり、LLM 推論経由で消費される。
  厳格なスキーマバージョン、JSON Schema、バリデータは導入しない。 -->

# draft-data

```yaml
work_type: feature

# scale は実装スコープシグナル（27 SKILL.md 対象、影響ファイル数 10 超）により large に昇格
scale: large

summary: |
  RU-0013 に基づき、REQ-0140-031 が宣言する SKILL.md 概要節（description frontmatter）と機能節（## セクション群）の重複查読を段階的に実施するための運用方針を REQ-0140 へ追加する。
  agentdev-doc-writing スキルは SKILL.md 重複查読に優先度軸（重複度合い、文書の影響度）を設け、優先度高位から順に段階的に查読するスケジュールを持つ。
  優先度判定基準、Wave 構成、対象27ファイルの個別リストは SPEC（document-type-responsibilities.md）に配置する。
  REQ-0140-031 が查読対象を宣言済みのため ADR は不要であり、本要件はその運用具体化に位置づける。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      agentdev-doc-writing スキルは、REQ-0140-031 が宣言する SKILL.md 概要節（description frontmatter）と機能節（## セクション群）の重複查読を段階的に実施する対象とする。
      段階的查読は優先度軸（重複度合い、文書の影響度）に基づき、優先度高位の SKILL.md から順に実施する。
      優先度判定基準、Wave 構成、対象ファイル一覧の詳細は SPEC（document-type-responsibilities.md）に配置し、REQ 要件行には埋め込まない。
  - id: AG-002
    content: |
      SPEC（document-type-responsibilities.md）に SKILL.md 重複查読の優先度基準と段階的スケジュールを配置する。
      優先度軸は重複度合い（高位/中位/低位）と文書の影響度（参照頻度、command からの呼出頻度）の2軸とする。
      段階的查読スケジュールは Wave 1（優先度高位）、Wave 2（優先度中位）、Wave 3（優先度低位）の3段階とする。
      対象は src/opencode/skills/*/SKILL.md 配下の27ファイルとし、個別ファイルリストは inspect-skills 検出結果を参照して展開する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-0140.md
    source_items: [AG-001]
    content: |
      | REQ-0140-032 | agentdev-doc-writing は REQ-0140-031 が宣言する SKILL.md 概要節と機能節の重複查読を段階的に実施する対象とし、優先度軸（重複度合い、文書の影響度）に基づく段階的查読スケジュールを持つこと。優先度判定基準、Wave 構成、対象ファイル一覧の詳細は SPEC（document-type-responsibilities.md）に配置し、本要件行に埋め込まないこと |
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/responsibilities/document-type-responsibilities.md
    target_area: SKILL.md 重複查読の優先度基準と段階的スケジュール
    source_items: [AG-002]
    content: |
      ## SKILL.md 重複查読の優先度基準と段階的スケジュール

      REQ-0140-032 が定める段階的查読の詳細基準。REQ-0140-031 の查読対象宣言を受けて運用具体化する。

      ### 優先度軸

      - 重複度合い: 概要節（description frontmatter）と機能節（## セクション群）の語彙・文脈重複を高位/中位/低位の3段階で分類する
      - 文書の影響度: SKILL.md の参照頻度、command からの呼出頻度を影響度 高位/中位/低位 で分類する

      ### 段階的查読スケジュール

      - Wave 1: 優先度高位（重複度合い高位 かつ 影響度高位）
      - Wave 2: 優先度中位（重複度合い中位 または 影響度中位）
      - Wave 3: 優先度低位（上記以外）

      ### 対象 SKILL.md

      src/opencode/skills/*/SKILL.md 配下の27ファイル。個別リストは inspect-skills 検出結果を参照して展開する。

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0013
    target_req: REQ-0140
    target_spec: docs/specs/responsibilities/document-type-responsibilities.md
    operation: append
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      saved_req_docs:
        - req_id: REQ-0140
          path: docs/requirements/REQ-0140.md
          operation: append
          added_requirement_ids: [REQ-0140-032]
      saved_spec_docs:
        - path: docs/specs/responsibilities/document-type-responsibilities.md
          operation: update
          target_area: SKILL.md 重複查読の優先度基準と段階的スケジュール
          target_area_resolution: append_as_new_section
      source_ru_to_req_mapping:
        RU-0013: [REQ-0140-032]
      case_open_input:
        target_req: REQ-0140
        target_spec: docs/specs/responsibilities/document-type-responsibilities.md

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      docs/requirements/REQ-0140.md の要件テーブルに REQ-0140-032 が追加されていることを確認する。
      追加された要件行が REQ-0140-031 を補強し、SKILL.md 重複查読の段階的実施対象、優先度軸（重複度合い、文書の影響度）、SPEC 配置指示を宣言していることを確認する。
      追加要件行に優先度判定基準、Wave 構成、対象ファイル一覧の SPEC 詳細が混入していないことを確認する。
    pass_criteria: |
      REQ-0140-032 が要件テーブルに存在し、段階的查読対象と優先度軸を明記し、SPEC 配置を指示していること。SPEC 詳細が REQ 要件行に残留していないこと。
    on_failure: |
      fix-and-reverify: REQ-0140-032 の要件行を修正して再検証する。SPEC 詳細の混入が検出された場合は SPEC 候補として分離し、REQ 要件行には状態要件と SPEC 配置指示のみを残す。
  - id: TS-002
    target_item: AG-002
    verification: |
      docs/specs/responsibilities/document-type-responsibilities.md に「SKILL.md 重複查読の優先度基準と段階的スケジュール」セクションが追加され、優先度軸（重複度合い、文書の影響度）、Wave 構成（Wave 1/2/3）、対象ファイル（src/opencode/skills/*/SKILL.md 配下27ファイル）が記載されていることを確認する。
    pass_criteria: |
      当該 SPEC セクションが存在し、REQ-0140-032 で宣言された優先度軸と段階的スケジュールの詳細基準が過不足なく記載されていること。
    on_failure: |
      fix-and-reverify: SPEC セクションの記載を修正して再検証する。REQ-0140-032 の宣言要件と SPEC 詳細が乖離している場合は両者を整合させる。

case_open_hints:
  epic_needed: false
```

# summary

RU-0013 を要件ドラフトに変換した。REQ-0140-031 が SKILL.md 重複查読対象を宣言済みのため、本ドラフトはその運用具体化として REQ-0140 へ APPEND（REQ-0140-032）を行い、優先度判定基準と Wave 構成は SPEC（document-type-responsibilities.md）に配置する。

scale は標準ではあるが、実装スコープシグナル（対象27 SKILL.md、影響ファイル数 10 超）により large に昇格させた。要件定義フェーズで完了するのは REQ-0140-032 の APPEND と SPEC セクション追加であり、27ファイルの個別查読は後続 case で実施する。ADR は不要（REQ-0140-031 が查読対象宣言済み、本要件は運用具体化）。
