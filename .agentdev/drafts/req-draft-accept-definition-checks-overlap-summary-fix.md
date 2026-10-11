---
draft_type: req_draft
topic_slug: accept-definition-checks-overlap-summary-fix
status: draft
created_at: 2026-10-11T15:30:00+09:00
source_rus:
  - RU-0007
---

# draft-data

```yaml
work_type: bugfix

scale: standard

summary: >
  case-ready STEP-1 受入検査機械工程（accept_definition_checks script）の overlapSummary 組み立てにおける
  detection_unavailable の空配列誤表示を修正する。現行実装（parsed.detection_unavailable != null 判定）は
  空配列も存在扱いして summary が常に detection_unavailable=true と表示するため、「配列が存在し 1 件以上の
  要素を持つ」（Array.isArray(v) && v.length > 0）判定へ修正し、空配列ケースの unit test を追加する。
  ゲート判定（exitCode）には影響しない表示修正であり、報告 JSON のスキーマは変更しない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      判定修正（RU-0007）。accept_definition_checks.ts の overlapSummary 組み立てにおいて、
      detection_unavailable の summary 表示判定を「配列が存在し 1 件以上の要素を持つ」
      （Array.isArray(v) && v.length > 0）へ修正する。detection_unavailable が空配列のとき summary は
      detection_unavailable=true と表示しない。修正は表示のみとし、ゲート判定（exitCode）と報告 JSON の
      スキーマ（overlap.stdout の解析対象フィールド）は変更しない。
  - id: AG-002
    content: |
      unit test の追加（RU-0007）。空配列ケース（detection_unavailable: []）の unit test を追加し、
      summary が detection_unavailable=true と表示しないことを検証する。既存 unit test（非空ケース・
      不存在ケース）は pass を維持し、期待値（detection_unavailable 非空ケースの true 表示）は変化しない
      ことを確認する。

conflict_resolutions: []

artifact_actions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0007
    target_req: REQ-061
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    note: >-
      REQ ファイル操作は持たない（実現系 OU）。case-ready 実行契約（REQ-061）の受入検査機械工程 script の
      表示欠陥修正であり、REQ 行・Design の変更を伴わない。
result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      修正後の accept_definition_checks.ts の overlapSummary 組み立て箇所を読み取り、判定が
      Array.isArray(v) && v.length > 0 になっていることを確認する。あわせてゲート判定（exitCode 系）と
      報告 JSON スキーマの該当箇所が変更されていないことを確認する。
    pass_criteria: |
      detection_unavailable 判定が配列存在 + 要素 1 件以上の判定になっており、exitCode 判定・報告 JSON の
      構造に変更がないこと。
    on_failure: |
      fix-and-reverify。判定式の修正不備・対象外箇所の意図しない変更を検出した場合は修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      case-ready scripts の unit test を bun test で実行する（実行形態は bun test 実行形態契約
      （REQ-060）に従い repo root 起 cwd・./ 付きパス指定）。追加した空配列ケースの test と既存 test
      （非空ケース・不存在ケース）の結果を確認する。
    pass_criteria: |
      空配列ケースの test が summary の detection_unavailable=true 表示なしを検証して合格していること。
      既存 unit test 全体が pass を維持していること（非空ケースの true 表示期待値は不変）。
    on_failure: |
      fix-and-reverify。test 不合格または既存期待値の変化を検出した場合は実装または test を修正して
      再実行する。

realization_actions:
  - id: RA-001
    concern: accept_definition_checks.ts の overlapSummary 判定修正と unit test 追加
    responsibility: >
      case-ready 受入検査機械工程 script の summary 組み立て（runAcceptDefinitionChecks の overlapSummary）
      とその unit test。L252 の parsed.detection_unavailable != null 判定を Array.isArray(v) && v.length > 0
      へ修正し、tests/accept_definition_checks.test.ts へ空配列ケースの test を追加する。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts（overlapSummary 組み立て L251-252）"
      - "src/common/skills/agentdev-workflow-case-ready/scripts/tests/accept_definition_checks.test.ts（実在確認済み）"
    intent: >
      検査の質に関する情報（検出不能の有無）の表示を正確にし、全 case-ready / case-revise 実行での
      エンジン報告 JSON の直接読取による裏付け取り（Issue #3550 で実測）を不要にする。
    verification_refs: [TS-001, TS-002]
    source_items: [AG-001, AG-002]

review_dispositions:
  - id: RD-001
    source_ru: RU-0007
    source_item: RU-0007
    disposition: covered
    reason_code: covered
    reason: |
      overlapSummary の空配列判定修正と unit test 追加を AG-001 / AG-002 + RA-001 で採用。受け入れ条件
      (1)(2)(3) を TS-001 / TS-002 で検証。対象外（inspect_cross_dependencies.ts 側の意味論、ゲート判定
      exitCode の変更、報告 JSON スキーマ変更）を AG-001 に反映。
    evidence:
      path: src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts
      section: overlapSummary 組み立て（L251-252。parsed.detection_unavailable != null 判定を実測確認）
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
```

# summary

RU-0007 を単独 Case として処理する（bugfix）。accept_definition_checks script の overlapSummary が
detection_unavailable 空配列を true 表示する表示欠陥（!= null 判定）を配列存在 + 1 件以上の判定へ修正し、
空配列ケースの unit test を追加する。ゲート判定・報告 JSON スキーマ・エンジン側は変更しない。
