---
draft_type: req_draft
topic_slug: retired-decision-related-reqs
status: saved
design_actions_consumed: true
created_at: 2026-09-11
source_rus: [RU-0009]
---

# draft-data

```yaml
# work_type: REQ-059 への規定追加（REQ 更新）を伴う新規規定の定義
work_type: feature

# scale: 単一 REQ（REQ-059）への追加 + 運用明文化。少数要件行に収まる
scale: standard

summary: retired Decision の related_reqs 取扱いを確定した。① REQ-059 へ retired Decision 復帰時（現行再配置時）の related_reqs 必須性（空宣言の要求を含む）と未宣言検出対象への包含可否を規定追加する。② decisions/README.md の retired 後継注記について網羅性確認と retired 発生時の補記運用（README 説明列 = 人手判断列の責務）を index-auto-generation Design へ明文化する。復帰操作のたびの都度判断を仕様で閉じる。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      REQ-059 へ retired Decision 復帰時（retired/ から現行ディレクトリへの再配置時）の
      related_reqs 取扱い規定を追加する。規定内容: 復帰時の Decision は related_reqs を必須とし、
      関連 REQ がない場合は空の宣言として明示する（REQ-059-001 の空宣言原則の復帰時適用）。
      retired 中は復帰後の実行可能契約として related_reqs を持つことを要求しないが、
      復帰操作の完了条件に related_reqs 宣言（空含む）を含める。
  - id: AG-002
    content: |
      復帰時 Decision の未宣言検出対象への包含可否を規定する。
      未宣言検出（REQ-059-003、IR-061 系 finding）の対象は現行 Decision であるため、
      retired 中の Decision は検出対象外とし、復帰後は検出対象に包含されることを
      REQ-059 の規定として明確にする。generate_indexes.ts が現行 Decision のみを対象とする
      現行実装との整合を維持する。
  - id: AG-003
    content: |
      decisions/README.md の retired REQ 後継注記（AUTOGEN 生成規則では関連REQ列から除去される
      ための README 説明列 = 人手判断列への補記）について、① 既存補記（DEC-007/013/017、
      decisions/README.md L179/L185/L189）の網羅性確認を実施し、② retired 発生時の補記運用
      （README 人手判断列の責務）を index-auto-generation Design へ明文化する。
      retired Decision の関連REQ後継情報は、人手判断列のみが保持する情報であることを
      契約として位置付ける。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-059.md
    source_items: [AG-001, AG-002]
    content: |
      | REQ-059-005 | retired Decision を現行ディレクトリへ復帰する場合、復帰時に related_reqs を必須とし、関連 REQ がない場合は空の宣言として明示すること。retired 中の Decision は未宣言検出（REQ-059-003）の対象外とし、復帰後は検出対象に包含されること |
      retired Decision の復帰時取扱いとして、REQ-059-001 の空宣言原則と REQ-059-003 の
      検出対象範囲（現行 Decision）を復帰操作に接続する規定である。
      復帰操作の完了条件に related_reqs 宣言（空含む）を含める。
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/integrity/index-auto-generation.md
    target_design:
      operation: update
      domain: integrity
      slug: index-auto-generation
    target_area: decisions/README.md の AUTOGEN 生成規則と人手判断列（説明列）を扱うセクション
    source_items: [AG-003]
    content: |
      decisions/README.md の関連REQ列は Decision frontmatter の related_reqs から再生成される
      ため後継情報を載せられず（retired REQ リンクは（retired）付きで関連REQ列に残存する）、
      後継・retired の事実は README 説明列（人手判断列）で補記する。
      - retired REQ に関連 Decision が存在する場合、該当 Decision 行の説明列へ後継・retired の
        事実を補記する（例: DEC-007/013/017 の既存補記）
      - 補記の網羅性は retired 発生時・復帰時に確認する。機械検出対象外の運用情報であるため、
        網羅性確認は retired 登録操作とセットで行う
      - 説明列（人手判断列）の編集は AUTOGEN ブロック外で行い、自動生成結果と矛盾させない

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0009
    target_req: REQ-059
    target_design: docs/designs/integrity/index-auto-generation.md
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      req_save:
        saved_reqs:
          - req: REQ-059
            file: docs/requirements/REQ-059.md
            appended_lines: [REQ-059-005]
        actions: [ACT-REQ-001]
        source_ru: RU-0009
        unclassified_verification_lines: [REQ-059-005]

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      REQ-059 追加後、REQ-059.md に REQ-059-005（復帰時 related_reqs 必須・空宣言・
      検出対象包含）の規定が存在することを確認する。REQ-059-001（空宣言原則）と
      REQ-059-003（検出対象 = 現行）との整合（矛盾しない接続）を突合する。
    pass_criteria: |
      REQ-059-005 が存在し、REQ-059-001 / REQ-059-003 と矛盾しない。
      要件表の ID 採番が既存行と連続している。
    on_failure: |
      fix-and-reverify。規定の不備・ID 採番不整合を修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      復帰時取扱いの規定と generate_indexes.ts の現行実装（現行 Decision のみ対象）の整合を
      確認する。retired Decision が検出対象外であること、復帰後は対象に含まれることを、
      index 生成の実行結果（AUTOGEN 出力）で確認する。
    pass_criteria: |
      規定と実装の解釈差が 0 件。retired 中 Decision が index / 未宣言検出の対象外であり、
      復帰後は対象に含まれる。
    on_failure: |
      fix-and-reverify。規定の曖昧さを解消して再検証する。
      実装側の乖離が判明した場合は finding として報告し、実装変更の要否を含めて case-run へ持ち帰る。
  - id: TS-003
    target_item: AG-003
    verification: |
      index-auto-generation.md の更新後、retired 後継注記の補記運用（人手判断列の責務）が
      記載されていることを確認する。decisions/README.md の現行 retired 関連 Decision
      （superseded 表記を含む）行の説明列補記に欠落がないか網羅性確認を実施する。
    pass_criteria: |
      補記運用が Design 記載として存在する。現行 retired 関連 Decision 行の補記欠落が 0 件
      （欠落発見時は本 case の修正対象として解消する）。
    on_failure: |
      fix-and-reverify。網羅性確認で発見した補記欠落を修正して再検証する。

case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints:
    - feature 経路（req-save → design-save → case-open）が想定される REQ/Design 更新 case
```

# summary

RU-0009（retired Decision の related_reqs 取扱い確定と README 後継注記運用）を feature standard として要件化した。REQ-059 へ復帰時 related_reqs 必須（空宣言含む）と未宣言検出対象の包含可否（retired 中は対象外・復帰後包含）を規定追加し、README 人手判断列の補記運用を index-auto-generation Design へ明文化する。復帰操作のたびの都度判断を仕様で閉じる。
