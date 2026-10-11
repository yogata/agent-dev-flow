---
draft_type: req_draft
topic_slug: case-ready-cross-dep-input-composition
status: draft
created_at: 2026-10-11T15:30:00+09:00
source_rus:
  - RU-0002
---

# draft-data

```yaml
work_type: maintenance

scale: standard

summary: >
  case-ready STEP-6 横断依存検査（共有エンジン inspect_cross_dependencies.ts）の検査入力構成規律を
  配布 reference（readiness-and-cleanup.md 横断依存検査節）へ補足する。(1) Epic 化済み Root Case を
  current_case とする場合の epic_ref 設定規律（null にしない）、(2) 対応関係領域 file_paths の実体解決
  （traceability sidecar と design 対応 inline 宣言ファイルの和集合を coverage で取得）、(3) 再実行の
  冪等性、(4) 検査入力 JSON の置き場所は既存の置き場所指針に従う、を規定し、Epic 化済み Root Case での
  偽陽性警告（condition a/b）による初動消費と修正再実行の往復を解消する。REQ 行の変更は行わない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      横断依存検査の入力構成規律の明文化（RU-0002）。case-ready の横断依存検査節へ次を規定する。
      (1) Epic 化済み Root Case を current_case として検査する場合、検査入力の epic_ref には当該 Epic の
      識別子を設定する。null は Standard 扱いとなり同一パス重複の Wave 内委譲判定（isWaveInternal。
      全メンバーが同一非 null epic_ref の場合のみ委譲）が作動しないため、Epic 運用時の null 設定を
      誤りとして扱う。(2) 対応関係領域（adf-covers-declarations）の file_paths は、traceability sidecar
      と design 対応 inline 宣言ファイル（docs/designs/** の ADF-COVERS 宣言）の和集合として構成する。
      sidecar のみを渡すと inline 宣言に存在する design 対応が未登録と誤判定され、condition (b) の
      重複需要の偽陽性を生む。和集合の取得は coverage による design 対応ファイル列挙で行う。
      (3) 入力修正後の再実行は冪等であること（エンジンは同一入力から同一報告を返す）を観測事実として
      明記する。(4) 検査入力 JSON の置き場所は既存の置き場所指針（agentdev-workflow-case-open
      scripts/README.md。project root 内限定・commit 対象外・検査後削除）に従う。

conflict_resolutions: []

artifact_actions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0002
    target_req: REQ-061
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    note: >-
      REQ ファイル操作は持たない（実現系 OU）。case-ready 実行契約（REQ-061）の横断依存検査行の実現面
      （配布 reference）の手順補足であり、REQ 行・Design の変更を伴わない。
result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      reference（src/common/skills/agentdev-workflow-case-ready/references/readiness-and-cleanup.md）の
      横断依存検査節を対象に、(1) epic_ref 設定規律（Epic 化済み Root Case では null にしない）の記述、
      (2) 対応関係領域 file_paths の実体解決（sidecar + design 対応 inline 宣言の和集合、coverage による
      取得手順）の記述、(3) 再実行冪等性の記述、(4) 検査入力 JSON の置き場所指針への参照、を機械的検索
      （rg）と全文読取で確認する。あわせてワークフロー契約 Design「Case 投入時の横断依存検査契約」節の
      検出条件・共有領域の解決規定が変更されていないことを確認する。
    pass_criteria: |
      (1)〜(4) の規定が横断依存検査節に存在し、既存の検出条件（condition (a)(b)）、スキャン範囲、警告時の
      挙動、Epic 経路の委譲境界が変更されていないこと。共有エンジン（inspect_cross_dependencies.ts）の
      判定ロジック・isWaveInternal 実装・coverage/check の判定仕様に変更がないこと。
    on_failure: |
      fix-and-reverify。規定の欠落、または共有契約 Design・エンジン側仕様との矛盾を検出した場合は
      reference の当該節を修正して再検証する（偽陽性往復の解消が本件の目的であり、記録留保では完了しない）。

realization_actions:
  - id: RA-001
    concern: case-ready 配布 reference（readiness-and-cleanup.md）への横断依存検査入力構成規律の補足
    responsibility: >
      case-ready STEP-6 トレーサビリティ完全性ゲートの横断依存検査手順を所有する配布 reference。
      横断依存検査節へ AG-001 の入力構成規律（epic_ref 設定・file_paths 実体解決・冪等性・置き場所指針
      参照）を追記する。
    ownership_hints:
      - "src/common/skills/agentdev-workflow-case-ready/references/readiness-and-cleanup.md（横断依存検査（ゲート横断次元）節。現行 L14-29 は検出条件と共有領域の解決のみを定め、検査入力の構成規律は未規定を実測確認済み）"
      - "共有エンジン: .opencode/skills/agentdev-workflow-case-open/scripts/src/inspect_cross_dependencies.ts（変更対象外）"
      - "共通契約の正: ワークフロー契約 Design「Case 投入時の横断依存検査契約」節（変更対象外）"
    intent: >
      Epic 化済み Root Case での横断依存検査の初回入力構成を規律化し、epic_ref: null と sidecar のみの
      file_paths による偽陽性警告（Case #3585 で condition_a 4 件・condition_b 9 Case 分を実測）と
      修正再実行の初動消費を解消する。
    verification_refs: [TS-001]
    source_items: [AG-001]

review_dispositions:
  - id: RD-001
    source_ru: RU-0002
    source_item: RU-0002
    disposition: covered
    reason_code: covered
    reason: |
      横断依存検査の入力構成規律（epic_ref 設定・対応関係領域の実体解決）の reference 補足を AG-001 +
      RA-001 で採用。受け入れ条件 (1)(2)(3) を TS-001 で検証。対象外（inspect_cross_dependencies.ts の
      判定ロジック・isWaveInternal 実装、coverage/check 判定仕様）は本 draft で変更しない。補足（検査入力
      JSON の置き場所指針準拠、再実行冪等性の明記）を AG-001 に反映。
    evidence:
      path: src/common/skills/agentdev-workflow-case-ready/references/readiness-and-cleanup.md
      section: 横断依存検査（ゲート横断次元）
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
```

# summary

RU-0002 を単独 Case として処理する。case-ready 横断依存検査の入力構成規律（Epic 化済み Root Case の
epic_ref 設定、対応関係領域 file_paths の sidecar + inline 宣言の和集合解決）を配布 reference へ補足し、
Case #3585 で実測された偽陽性警告による初動消費と修正再実行の往復を解消する。共有エンジン・共通契約
Design・REQ 行は変更せず、手順規定の補足に限る。
