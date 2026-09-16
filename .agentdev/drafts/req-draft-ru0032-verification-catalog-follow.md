---
draft_type: req_draft
topic_slug: ru0032-verification-catalog-follow
status: draft
created_at: 2026-09-16T12:35:49+09:00
source_rus:
  - RU-0032
---

# draft-data

```yaml
work_type: maintenance
scale: null
summary: >-
  REQ 行追加を伴う Definition 生成時に verification-scope-catalog の追随要否を確認し、
  canonical Definition 再取得時の traceability check で unclassified を検出した場合に
  case-open へ差し戻す工程を、REQ-030-015 と REQ-061-032 および各 command Design に反映する。
  case-ready の最終ゲート所有と単一行集合の計上仕様は維持する。
auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []
agreed_items:
  - id: AG-001
    content: >-
      case-open は REQ 行追加を伴う Definition Package 生成時、verification-scope-catalog 更新の
      追随要否を工程上明示し、必要なカタログエントリ追加を Definition に含める。カタログ編集は
      実変更として Definition PR 経由で適用する。
  - id: AG-002
    content: >-
      case-ready は canonical Definition 再取得時に traceability check を機械実行し、unclassified
      を検出した場合の case-open への差し戻し経路を扱う。検証対応要否の最終ゲートと未分類残存時
      の ready 拒否は case-ready が所有し、既存の意味を二重定義しない。
  - id: AG-003
    content: >-
      traceability check の unclassified と missing-verification は同一行集合から単一導出し、
      計上仕様を変更しない。REQ 移動・分割時の別工程、対象36行の分類確定、横断依存検査の警告
      意味論は本要件の対象外とする。
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-030.md
    target_area: 要件テーブル末尾（擬似 REQ-030-015 行として追記）
    source_items: [AG-001]
    content: |
      | REQ-030-015 | case-open は REQ 行追加を伴う Definition Package 生成時、verification-scope-catalog 更新の追随要否を工程上明示し、必要なカタログ エントリ追加を Definition に含めること。カタログ編集は実変更であるため Definition PR 経由以外の適用経路を取らないこと |
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: docs/requirements/REQ-061.md
    target_area: 要件テーブル末尾（擬似 REQ-061-032 行として追記）
    source_items: [AG-002, AG-003]
    content: |
      | REQ-061-032 | case-ready は canonical Definition 再取得時に traceability check を機械実行し、unclassified を検出した場合の case-open への差し戻し経路を明示的に扱うこと。検証対応要否の最終ゲート（REQ-061-023）の case-ready 所有を維持し、二重定義しないこと |
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/commands/case-open.md
    target_design:
      operation: update
      domain: commands
      slug: case-open
    target_area: "## Definition Package と冪等再実行（REQ-030-010）"
    source_items: [AG-001]
    content: |
      ### verification-scope-catalog 追随工程（REQ-030-015）
      REQ 行追加を伴う Definition Package の生成時、verification-scope-catalog 更新の追随要否を確認し、必要なカタログエントリ追加を Definition に含める。カタログ編集は Definition PR の構成要素として扱い、直接適用しない。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/commands/case-ready.md
    target_design:
      operation: update
      domain: commands
      slug: case-ready
    target_area: "## 内部構成"
    source_items: [AG-002, AG-003]
    content: |
      canonical Definition 再取得時に traceability check を機械実行し、unclassified を検出した場合は case-open への差し戻し経路を扱う。REQ-061-023 の未分類残存時 ready 拒否を最終ゲートとして維持し、unclassified と missing-verification は同一行集合から導出する。
conflict_resolutions:
  - id: CR-001
    conflict: REQ-030-015 と REQ-061-032 は共有計画上の擬似採番である。
    resolution: REQ-030-015 と REQ-061-032 を使用し、case-open の決定的採番で最終 ID を確定する。
  - id: CR-002
    conflict: RU-0032 の予防策には REQ 移動・分割時のカタログ追随を追加する案もあった。
    resolution: 事象の対象である REQ 行追加時の工程接続に限定し、移動・分割は既存の REQ 構造診断へ委ねる。
  - id: CR-003
    conflict: case-ready の既存最終ゲートと unclassified 検出経路の境界が重複し得る。
    resolution: REQ-061-023 の ready 拒否を維持し、新行は canonical 再取得時の早期検出と case-open 差し戻しの工程接続だけを追加する。
  - id: CR-004
    conflict: traceability check の unclassified と missing-verification の計上単位を別定義にする案があった。
    resolution: 同一行集合から単一導出し、既存の計上仕様を変更しない。
operation_units:
  - ou_id: OU-001
    source_ru: RU-0032
    target_req: REQ-030
    target_design: docs/designs/commands/case-open.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
  - ou_id: OU-002
    source_ru: RU-0032
    target_req: REQ-061
    target_design: docs/designs/commands/case-ready.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: case-open Design と workflow reference を照合し、REQ 行追加時のカタログ追随要否確認と Definition 包含を確認する。
    pass_criteria: 追随要否の明示、必要エントリの Definition 包含、Definition PR 経由の適用が記録されている。
    on_failure: fix-and-reverify を選択する。前置工程の欠落を修正して再確認する。
  - id: TS-002
    target_item: AG-002
    verification: case-ready Design と STEP-2 reference を照合し、canonical 再取得時の機械実行と case-open 差し戻し経路を確認する。
    pass_criteria: unclassified 検出時の差し戻し経路と REQ-061-023 の最終ゲート所有が明記されている。
    on_failure: fix-and-reverify を選択する。検出・差し戻し経路を修正して再確認する。
  - id: TS-003
    target_item: AG-003
    verification: traceability check の集計契約、REQ-061-029〜031 の横断検査、対象36行の既存解消記録を比較する。
    pass_criteria: unclassified と missing-verification が同一行集合から導出され、既存ゲート・警告意味論・対象外境界が維持されている。
    on_failure: fix-and-reverify を選択する。計上またはスコープの逸脱を修正して再確認する。
realization_actions:
  - id: RA-001
    concern: case-open の verification-scope-catalog 追随確認
    responsibility: case-open workflow の Definition Package 生成工程が正規所有する。
    ownership_hints:
      - src/opencode/skills/agentdev-workflow-case-open/SKILL.md
      - src/opencode/skills/agentdev-workflow-case-open/references/
      - docs/designs/commands/case-open.md
    intent: REQ 行追加に伴うカタログ未登録を Definition 生成時に検出・包含する。
    verification_refs: [TS-001]
    source_items: [AG-001]
  - id: RA-002
    concern: case-ready の canonical 再取得時 traceability check
    responsibility: case-ready の STEP-2 と検証対応要否ゲートが正規所有する。
    ownership_hints:
      - src/opencode/skills/agentdev-workflow-case-ready/SKILL.md
      - src/opencode/skills/agentdev-workflow-case-ready/references/
      - docs/designs/commands/case-ready.md
      - agentdev-traceability
    intent: unclassified を早期検出し、最終ゲートの意味を変えずに case-open へ戻す。
    verification_refs: [TS-002, TS-003]
    source_items: [AG-002, AG-003]
review_dispositions:
  - id: RD-001
    source_ru: RU-0032
    source_item: RU-0032-acceptance-criteria
    disposition: covered
    reason_code: converted_to_two_existing_req_appends_and_design_updates
    reason: RU-0032 の工程接続を REQ-030-015、REQ-061-032、case-open/case-ready Design update、realization_actions に反映した。
    evidence:
      path: .agentdev/backlog/req-units/RU-0032.md
      section: 受け入れ条件
      checked_at_commit: null
    related_removed_items: []
case_open_hints:
  epic_needed: false
  wave_hints: []
result: {}
```

# summary

変更誘発境界リスクは、dependency（REQ-030-015、REQ-061-032、REQ-061-023、traceability とカタログの接続）、client-server（canonical Definition と verification-scope-catalog の登録状態）、execution（case-open の前置確認から case-ready の canonical 再取得・差し戻しまで）、build-runtime（既存 traceability check の機械実行を利用し計上仕様を変更しないこと）、environment-propagation（case-open/case-ready workflow reference と Design の同期）を確認済みである。REQ APPEND 2件と Design update 2件で、独立した複数関心の混在はない。SPLIT 要否: 不要。
