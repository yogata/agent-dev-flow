---
draft_type: req_draft
topic_slug: test-strategy-cycle
status: saved
created_at: 2026-06-24T13:30:00+09:00
source_rus: []
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  Issue 本文のテスト戦略に検証指示が書かれるが、NG 結果に対するアクション（修正または見送り判断）が定義されていない。
  テストを実行して終わりの状態が生じ、不合格が放置される。
  テスト戦略を検証から修正までを完遂するサイクルの仕様として再定義し、各項目を検証手順、合格基準、不合格時の処置の3要素で構成する。
  これを req-define → QG-1 → case-open → Issue 本文 → case-run / Sisyphus-Junior → case-close → QG-4 の全パイプラインで伝播させる。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      テスト戦略の各項目は検証手順、合格基準、不合格時の処置の3要素で構成する。
      不合格時の処置は「実装を修正して再検証する」か「当該 Issue のスコープ外として PR 本文の Findings に記録し case-close で回収する」のいずれかを指定する。
      不合格時の処置が未定の検証項目は、検証結果に対するアクションが定まらないためテスト戦略に含めない。
  - id: AG-002
    content: |
      draft-data テンプレート（req-draft.md）に test_strategy フィールドを追加する。
      各項目は id（TS-NNN）、target_item（AG-* に対応）、verification（検証手順）、pass_criteria（合格基準）、on_failure（不合格時の処置）を持つ。
  - id: AG-003
    content: |
      req-define にテスト戦略定義ステップ（Step 5-6）と test_strategy 生成ステップ（Step 7-4）を追加する。
      Step 10 標準データモデル fields に test_strategy を追加する。
      ガードレール G19（テスト戦略の各項目は3要素を含む）を追加する。
  - id: AG-004
    content: |
      QG-1（Definition Integrity Gate）に検査観点を追加する。
      draft-data の test_strategy フィールドの各項目が3要素（verification, pass_criteria, on_failure）を持つかを検証する。
  - id: AG-005
    content: |
      Issue 本文テンプレート（issue_desc_feature.md, issue_desc_child.md, issue_desc_bug.md）のテスト戦略セクションを3要素形式に変更する。
  - id: AG-006
    content: |
      case-open にテスト戦略埋め込み手順（Step 2-2）を追加する。
      draft-data の test_strategy を Issue 本文のテスト戦略セクションに展開して埋め込む。
  - id: AG-007
    content: |
      case-run の Sisyphus-Junior 責務に、テスト戦略の各項目について検証を実行し不合格時の処置（修正または Findings 記録）を行い全項目が処理完了するまで繰り返すことを追加する。
      adapter skill（agentdev-case-run-execution-adapter）の Sisyphus-Junior ステップ3にテスト戦略検証を追加する。
  - id: AG-008
    content: |
      case-close Step 2 にテスト戦略の処理完了確認を追加する。
      QG-4（Final Acceptance Gate）に検査観点を追加する。
      Issue 本文のテスト戦略セクションの各項目について、合格または PR 本文 Findings 記録済みであることを確認する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: REQ-0102
    source_items: [AG-001, AG-002, AG-003]
    content: |
      REQ-0102-xxx: req-define はテスト戦略を検証から修正までを完遂するサイクルの仕様として定義し、draft-data の test_strategy フィールドに出力すること。各項目は検証手順、合格基準、不合格時の処置で構成し、不合格時の処置が未定の項目を含めないこと。
  - id: ACT-REQ-002
    artifact: req
    operation: append
    target: REQ-0130
    source_items: [AG-007]
    content: |
      REQ-0130-xxx: case-run は実行担当サブエージェントがテスト戦略の各項目について検証を実行し、不合格時の処置（実装を修正して再検証、またはスコープ外として Findings 記録）を行い、全項目が処理完了するまで繰り返すこと。
  - id: ACT-REQ-003
    artifact: req
    operation: append
    target: REQ-0131
    source_items: [AG-008]
    content: |
      REQ-0131-xxx: case-close は Issue 本文のテスト戦略セクションの各項目について、合格または PR 本文 Findings 記録済みであることを完了条件に含めること。
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target: docs/specs/commands/req-define.md
    source_items: [AG-003]
    content: |
      Step 5 に 5-6（テスト戦略定義）、Step 7 に 7-4（test_strategy 生成）を追加。
      Step 10 標準データモデル fields に test_strategy を追加。
      ガードレール G19 を追加。
  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target: docs/specs/commands/case-open.md
    source_items: [AG-006]
    content: |
      Step 2 に Step 2-2（テスト戦略埋め込み）を追加。
  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target: docs/specs/commands/case-run.md
    source_items: [AG-007]
    content: |
      Sisyphus-Junior 責務リストにテスト戦略検証・不合格時処置・全項目処理完了まで繰り返しを追加。
  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target: docs/specs/commands/case-close.md
    source_items: [AG-008]
    content: |
      Step 2 にテスト戦略の処理完了確認を追加。
  - id: ACT-SPEC-005
    artifact: spec
    operation: update
    target: docs/specs/skills/agentdev-case-run-execution-adapter.md
    source_items: [AG-007]
    content: |
      Sisyphus-Junior ステップ3にテスト戦略検証を追加。
  - id: ACT-SPEC-006
    artifact: spec
    operation: update
    target: docs/specs/skills/agentdev-quality-gates.md
    source_items: [AG-004, AG-008]
    content: |
      QG-1 に検査観点10（test_strategy 3要素完全性）、QG-4 に検査観点6（テスト戦略処理完了）を追加。

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    target_req: REQ-0102
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result:
      qg_1_result: pass
      req_appends:
        - req_id: REQ-0102
          requirement_id: REQ-0102-074
          content: req-define はテスト戦略を検証から修正までを完遂するサイクルの仕様として定義し、draft-data の test_strategy フィールドに出力すること。各項目は検証手順、合格基準、不合格時の処置で構成し、不合格時の処置が未定の項目を含めないこと。
          status: already_exists
        - req_id: REQ-0130
          requirement_id: REQ-0130-029
          content: case-run は実行担当サブエージェントがテスト戦略の各項目について検証を実行し、不合格時の処置（実装を修正して再検証、またはスコープ外として Findings 記録）を行い、全項目が処理完了するまで繰り返すこと。
          status: appended
        - req_id: REQ-0131
          requirement_id: REQ-0131-026
          content: case-close は Issue 本文のテスト戦略セクションの各項目について、合格または PR 本文 Findings 記録済みであることを完了条件に含めること。
          status: appended

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      check_integrity.ts を実行し、test_strategy 関連の新規 NG が 0 件であることを確認する。
    pass_criteria: |
      変更後に check_integrity.ts を実行した結果、変更ファイルに起因する NG が 0 件であること。
    on_failure: |
      実装を修正して再検証する。既存の NG（今回の変更と無関係）は Findings に記録する。

case_open_hints:
  epic_needed: false
  decomposition:
  wave_hints: []
```

# summary

テスト戦略を「実行して終わり」から「検証→不合格時処置→全項目処理完了」のサイクルに再定義し、req-define → case-auto パイプライン全体で伝播させる。主対象は REQ-0102（req-define）、REQ-0130（case-run）、REQ-0131（case-close）への APPEND、および関連 SPEC 6ファイルの更新。
