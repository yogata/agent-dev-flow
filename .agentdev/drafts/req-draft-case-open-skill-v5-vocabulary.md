---
draft_type: req_draft
topic_slug: case-open-skill-v5-vocabulary
status: draft
created_at: 2026-10-11T15:30:00+09:00
source_rus:
  - RU-0011
---

# draft-data

```yaml
work_type: maintenance

scale: standard

summary: >
  case-open 配布 SKILL 本体（SKILL.md L85）に残存する旧語彙「Design 対応」を、REQ-021-024 更新後の
  現行語彙「設計根拠対応」へ修正する（v5 語彙追随）。docs 側 case-open Design の語彙は更新済みであり、
  配布 SKILL 本体の該当箇所を語彙の正（REQ-021-024）へ整合させ、該当ファイル範囲で他の乖離がないことを
  確認する。REQ 行の変更は行わない（語彙の正は更新済み）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      語彙修正（RU-0011 受け入れ条件 (1)(2)）。case-open SKILL.md L85 の「対象要件行に Design 対応が
      未成立でも Root Case の確立を妨げない」を、REQ-021-024 の現行語彙に従い「対象要件行の設計根拠対応が
      未成立でも Root Case の確立を妨げない」へ更新する。続く文（Design 対応の成立判定〔トレーサビリティ
      完全性ゲート〕は case-ready が所有する）も REQ-021-024 の現行規定（case-ready は設計根拠対応の存在
      とトレーサビリティポリシー有効性を ready 遷移の必要条件として扱う）と整合する語彙へ更新する。
      docs/designs/commands/case-open.md 側の語彙（更新済み）と整合することを確認する。
  - id: AG-002
    content: |
      乖離確認の範囲（RU-0011 受け入れ条件 (3)）。語彙の正（REQ-021-024）からの乖離が他に無いことを
      該当ファイル範囲（case-open SKILL.md）で機械的検索により確認する。他 SKILL の語彙棚卸しは
      RU-0011 の対象外とする。本 draft 作成時の実測で、case-ready 配布 reference
      （readiness-and-cleanup.md L9-12）に同種の語彙残存（Design 対応語彙）を観測したが、対象外に従い
      本 Case では修正しない（関連観察として記録し、将来の intake/inspect 対象とする）。

conflict_resolutions: []

artifact_actions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0011
    target_req: REQ-021
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    note: >-
      REQ ファイル操作は持たない（実現系 OU）。トレーサビリティのワークフロー統合（REQ-021）の語彙の正
      （REQ-021-024、更新済み）への配布 SKILL 本体の追随であり、REQ 行・Design の変更を伴わない。
result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      修正後の case-open SKILL.md（src/common/skills/agentdev-workflow-case-open/SKILL.md）を対象に、
      (1) L85 相当箇所が「設計根拠対応」語彙へ更新されていること、(2) 機械的検索（rg 'Design 対応'）で
      同ファイル内に旧語彙の残存がないこと、を確認する。検索の網羅範囲は case-open SKILL.md のみとし、
      references/ 配下・他 SKILL ファイル・履歴文書（docs/reports/）は対象外（AG-002 の範囲宣言どおり）。
      あわせて docs/designs/commands/case-open.md 側の語彙が「設計根拠対応」であることを確認する。
    pass_criteria: |
      SKILL.md の該当箇所が REQ-021-024 の現行語彙（設計根拠対応）へ更新され、同ファイル内に旧語彙
      「Design 対応」の残存が 0 件であること。docs 側 Design の語彙と一致すること。
    on_failure: |
      fix-and-reverify。修正漏れ・残存語彙を検出した場合は修正して再検証する。検索で references/ 配下や
      他 SKILL に残存を検出した場合は本 Case の対象外（AG-002）として記録に留め、対象範囲を拡大しない。

realization_actions:
  - id: RA-001
    concern: case-open SKILL 本体の v5 語彙追随
    responsibility: >
      case-open 配布 SKILL 本体（src/common/skills/agentdev-workflow-case-open/SKILL.md）。L85 相当箇所の
      旧語彙を REQ-021-024 の現行語彙（設計根拠対応）へ更新する。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-open/SKILL.md（L85 の旧語彙を実測確認）"
      - "語彙の正: docs/requirements/REQ-021.md REQ-021-024 行（設計根拠対応語彙を実測確認）"
      - "docs 側 Design: docs/designs/commands/case-open.md（語彙更新済み）"
    intent: >
      配布物 SKILL 本体の語彙が更新後の REQ-021-024 語義と乖離し、コマンド Design（docs 側）と配布 SKILL
      （src/common/skills 側）の語彙不整合として残る状態（Epic #3560 Wave-3 の並列実行で改名対象外だった
      原因）を解消する。
    verification_refs: [TS-001]
    source_items: [AG-001, AG-002]

review_dispositions:
  - id: RD-001
    source_ru: RU-0011
    source_item: RU-0011
    disposition: covered
    reason_code: covered
    reason: |
      case-open SKILL 本体の v5 語彙追随を AG-001 / AG-002 + RA-001 で採用。受け入れ条件 (1)(2)(3) を
      TS-001 で検証。対象外（REQ-021-024 本体の変更、他 SKILL の語彙棚卸し）を AG-002 に反映し、
      case-ready 側 reference の同種語彙残存を関連観察として記録した（本 Case では修正しない）。
    evidence:
      path: src/common/skills/agentdev-workflow-case-open/SKILL.md
      section: L85（旧語彙「Design 対応」の残存と REQ-021-024 の現行語彙「設計根拠対応」を実測確認）
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
```

# summary

RU-0011 を単独 Case として処理する。case-open 配布 SKILL 本体 L85 の旧語彙「Design 対応」を語彙の正
（REQ-021-024）の「設計根拠対応」へ追随させ、docs 側 Design との語彙不整合を解消する。
本 draft 作成時の実測で case-ready 側 reference（readiness-and-cleanup.md L9-12）にも同種の語彙残存を
観測したが、RU-0011 の対象外（他 SKILL の語彙棚卸し）に従い本 Case では扱わず、関連観察として記録する。
