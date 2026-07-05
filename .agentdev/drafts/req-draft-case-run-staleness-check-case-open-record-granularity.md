---
draft_type: req_draft
topic_slug: case-run-staleness-check-case-open-record-granularity
status: saved
created_at: 2026-07-05T12:00:00+09:00
saved_at: 2026-07-05T13:10:00+09:00
source_rus:
  - RU-0026
agentdev_handoff: true
spec_consumed: true
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: |
  case-run に QG-3 前置の staleness check（Issue 本文参照ファイルパスの現行存在確認、検査結果件数の再計測、差異検出時の Findings 記録 + case-update 連携）を追加する。case-open に完了条件・事前状態の記載ガイドライン（識別子中心、件数は補助値）を追加する。staleness check は QG-3 本体とは独立した前置検査とし、既存の QG-3/QG-4 deviation 分類運用は変更しない。差異検出時の Issue 本文更新は case-update の責務とし、case-run 単独では Issue 本文を書き換えない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      case-run に QG-3 前置の staleness check を追加する。実装作業開始前に以下を検証する:
      (a) Issue 本文が参照するファイルパス（command/spec/template 等）の現行存在確認
      (b) Issue 本文の事前状態セクションが列挙する検査結果件数の再計測
      差異を検出した場合、PR 本文の ## Findings / Capture候補 セクションに ### stale-reference 小見出しで記録し、case-update へ連携する。

  - id: AG-002
    content: |
      case-open に完了条件・事前状態の記載ガイドラインを追加する。記載は識別子中心（ファイル相対パス、NG 識別子、IR ID 等）とし、件数等の変動しやすい実測値スナップショットは補助値とする。

  - id: AG-003
    content: |
      staleness check は QG-3 本体とは独立した前置検査とする。QG-3 は引き続き PR 作成直前の実装充足・乖離ゲートに限定し、既存の deviation 分類（spec-bug 等）運用を変更しない。staleness check は deviation 発生前の予防層として位置づける。

  - id: AG-004
    content: |
      差異検出時の Issue 本文更新は case-update の責務とする。case-run 単独では Issue 本文を書き換えない。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-0130.md
    source_items: [AG-001, AG-003, AG-004]
    content: |
      REQ-0130（case-run）の要件テーブルへ以下を追加:

      - REQ-0130-031: case-run は実装作業開始前に QG-3 前置の staleness check を実行すること。Issue 本文が参照するファイルパスの現行存在確認、Issue 本文の事前状態セクションが列挙する検査結果件数の再計測を行うこと
      - REQ-0130-032: case-run は staleness check で差異を検出した場合、PR 本文の ## Findings / Capture候補 セクションに ### stale-reference 小見出しで記録し、case-update へ連携すること
      - REQ-0130-033: case-run は staleness check を QG-3 本体とは独立した前置検査として実行し、QG-3 deviation 分類（spec-bug 等）運用を変更しないこと
      - REQ-0130-034: case-run は staleness check で差異を検出した場合でも Issue 本文を単独で書き換えず、case-update の責務として委譲すること

      適用範囲（対象）へ「QG-3 前置 staleness check（Issue 本文参照ファイルパス存在確認、検査結果件数再計測、差異検出時 Findings 記録 + case-update 連携）」を追記。

  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-0132.md
    source_items: [AG-002]
    content: |
      REQ-0132（case-open）の要件テーブルへ以下を追加:

      - REQ-0132-021: case-open は完了条件・事前状態の記載を識別子中心（ファイル相対パス、NG 識別子、IR ID 等）とし、件数等の変動しやすい実測値スナップショットは補助値として記載すること

      適用範囲（対象）へ「完了条件・事前状態記載ガイドライン（識別子中心、件数補助値）」を追記。

  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: case-run
    target_area: "QG-3 前置 staleness check 手順（新規セクション）"
    source_items: [AG-001, AG-003, AG-004]
    content: |
      docs/specs/commands/case-run.md に QG-3 前置 staleness check 手順セクションを追加する。検証項目（ファイルパス現行存在確認、検査結果件数再計測）、差異検出時の Findings 記録形式、case-update 連携手順、QG-3 本体との関係（独立前置検査）を記述する。

  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: case-open
    target_area: "完了条件・事前状態記載ガイドライン（新規セクション）"
    source_items: [AG-002]
    content: |
      docs/specs/commands/case-open.md に完了条件・事前状態記載ガイドラインセクションを追加する。識別子中心記載の例、件数補助値記載の例、変動しやすい実測値の取扱いを記述する。

  - id: ACT-CMD-001
    artifact: command
    operation: update
    target: src/opencode/commands/agentdev/case-run.md
    source_items: [AG-001, AG-003, AG-004]
    content: |
      case-run command に QG-3 前置 staleness check 手順を追加する。実装作業開始前のチェックステップ、差異検出時の Findings 記録 + case-update 連携ステップを組み込む。

  - id: ACT-CMD-002
    artifact: command
    operation: update
    target: src/opencode/commands/agentdev/case-open.md
    source_items: [AG-002]
    content: |
      case-open command の Issue 本文生成ステップに、識別子中心・件数補助値の記載ガイドラインを反映する。

conflict_resolutions: []

operation_units:
  - id: OU-001
    source_ru: RU-0026
    target_req: REQ-0130
    target_spec: docs/specs/commands/case-run.md
    target_command: src/opencode/commands/agentdev/case-run.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

  - id: OU-002
    source_ru: RU-0026
    target_req: REQ-0132
    target_spec: docs/specs/commands/case-open.md
    target_command: src/opencode/commands/agentdev/case-open.md
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      docs/requirements/REQ-0130.md に staleness check 関連の要件行（実装作業開始前の前置検査、ファイルパス現行存在確認、検査結果件数再計測、差異検出時 Findings 記録 + case-update 連携）が追加されていることを確認する。
    pass_criteria: |
      REQ-0130-031〜034 の要件行が存在し、staleness check の実施、差異検出時の Findings 記録 + case-update 連携、QG-3 本体との独立性、Issue 本文単独書き換え禁止が記述されていること。
    on_failure: |
      fix-and-reverify。要件行を修正して再確認する。

  - id: TS-002
    target_item: AG-002
    verification: |
      docs/requirements/REQ-0132.md に記録粒度ガイドライン要件行（識別子中心、件数補助値）が追加されていることを確認する。
    pass_criteria: |
      REQ-0132-021 の要件行が存在し、識別子中心・件数補助値の記載が記述されていること。
    on_failure: |
      fix-and-reverify。要件行を修正して再確認する。

  - id: TS-003
    target_item: AG-001
    verification: |
      docs/specs/commands/case-run.md に QG-3 前置 staleness check 手順セクションが存在し、検証項目、差異検出時の Findings 記録形式、case-update 連携手順が記述されていることを確認する。
    pass_criteria: |
      staleness check 手順セクションが存在し、検証項目（ファイルパス現行存在確認、検査結果件数再計測）と差異検出時アクションが記述されていること。
    on_failure: |
      fix-and-reverify。SPECセクションを修正して再確認する。

  - id: TS-004
    target_item: AG-002
    verification: |
      docs/specs/commands/case-open.md に完了条件・事前状態記載ガイドラインセクションが存在し、識別子中心記載の例、件数補助値記載の例が記述されていることを確認する。
    pass_criteria: |
      記載ガイドラインセクションが存在し、識別子中心と件数補助値の記載例が含まれること。
    on_failure: |
      fix-and-reverify。SPECセクションを修正して再確認する。

case_open_hints:
  epic_needed: false
  decomposition: |
    OU-001（case-run staleness check）とOU-002（case-open 記録粒度ガイドライン）は依存関係がなく、Wave 1 で並列実行可能。
  wave_hints:
    - "Wave 1: OU-001 + OU-002 並列（依存関係なし）"

draft_meta:
  split_forecast:
    target: draft
    metrics:
      requirement_lines: 5
      concern_categories: 2
      artifact_types: 6
      spec_separation_violations: 0
    signals:
      requirement_lines: 0
      concern_categories: 1
      artifact_types: 1
      spec_separation_violations: 0
    total: 2
    recommended_action: "SPLIT検討（case-open時にOU-001/OU-002の別Issue分割を評価）"
    thresholds_ref: "req-health-metrics SPEC"
```

# summary

case-run に QG-3 前置 staleness check（ファイルパス現行存在確認、検査結果件数再計測、差異検出時 Findings 記録 + case-update 連携）を追加し、case-open に記録粒度ガイドライン（識別子中心、件数補助値）を追加する。staleness check は QG-3 本体と独立した前置検査で、既存 deviation 分類運用は変更しない。Issue 本文更新は case-update の責務。

auto_ready: true（未決分岐なし）。OU-001（case-run）とOU-002（case-open）は並列可能。SPLIT予兆 total 2（case-open時に別Issue分割を評価）。
