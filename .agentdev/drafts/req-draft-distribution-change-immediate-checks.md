---
draft_type: req_draft
topic_slug: distribution-change-immediate-checks
status: saved
design_actions_consumed: true
created_at: 2026-09-11
source_rus: [RU-0003]
---

# draft-data

```yaml
# adversarial-review (STEP-8): skipped — 既存3検査（配布依存境界・IR-055・traceability）の commit 前実行手順の明文化のみ。Decision 判断対象なし、req-define が新たに導入した意味的決定なし
# work_type: case-run / case-close の配布物変更手順（Design）への工程追加のみ
work_type: docs_chore

# scale: feature のみ判定対象。docs_chore のため未設定
scale: null

summary: 配布物への実装反映直後に配布依存境界・IR-055・traceability の3検査を commit 前に実行し、新規違反を全件 fix-and-reverify してから commit する工程を case-run / case-close の配布物変更手順へ追加する。base 既知違反と変更起因新規違反を分離し、既知 baseline 違反の無断削除・隠蔽を禁止する。3検査自体は既存であり、変更直後の一括実行手順の明文化が本体である。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      case-run / case-close の配布物変更手順へ、配布依存境界検査・IR-055 検査・traceability 検査の
      3検査を commit 前に実行する工程と実行順を追加する。配布物への実装反映直後に実行する。
      背景: #19（PR #2759）で配布物実装反映後の commit 後に 13 件の新規機械検査違反が発見され
      fix-and-reverify で解消した実績があり、commit 前の3検査実行が運用として標準化されていない
      （application miss）。
  - id: AG-002
    content: |
      3検査結果の突合では base 既知違反（baseline 既知 delta）と変更起因の新規違反を分離する。
      新規違反は全件分類して修正後、再検証して新規違反 0 件を確認してから commit する
      （fix-and-reverify）。baseline 既知違反は新規違反と混同せず、triage 運用（baseline 管理）で扱う。
  - id: AG-003
    content: |
      既知 baseline 違反の無断削除・隠蔽は許容しない。baseline エントリの除去は対応する残存箇所の
      実際の解消とセットでのみ行う（RU-0001 の AG-002 と同様の運用）。

artifact_actions:
  - id: ACT-DESIGN-001
    artifact: design
    operation: update
    target: docs/designs/commands/case-run.md
    target_design:
      operation: update
      domain: commands
      slug: case-run
    target_area: 配布物変更・docs 変更時の検査手順を規定するセクション（配布物への実装反映を扱う工程節）
    source_items: [AG-001, AG-002]
    content: |
      配布物（配布 command / skill / template / script）への実装反映を含む case では、
      commit 前に次の3検査を実行する（実行順を含めて以下のとおりとする）。
      1. 配布依存境界検査（check_distribution_boundary.ts）
      2. IR-055 検査（runtime-unresolved-reference）
      3. traceability 検査（宣言整合）
      突合は base 既知違反（baseline 既知 delta）と変更起因の新規違反を分離して行う。
      新規違反は全件分類して修正し、再検証で新規違反 0 件を確認してから commit する（fix-and-reverify）。
      baseline 既知違反の無断削除・隠蔽を行わない。baseline エントリの除去は対応する残存箇所の
      実際の解消とセットでのみ行う。
  - id: ACT-DESIGN-002
    artifact: design
    operation: update
    target: docs/designs/commands/case-close.md
    target_design:
      operation: update
      domain: commands
      slug: case-close
    target_area: 最終 gate・検査実行を扱うセクション（QG-4 前提の検査工程または配布物変更時の検査節）
    source_items: [AG-001, AG-002]
    content: |
      case-close の最終 gate で配布物変更を含む case を検証する場合、配布依存境界・IR-055・
      traceability の3検査の実行結果（case-run での commit 前実行記録）を確認する。
      case-run で3検査が実行されていない配布物変更を検出した場合は、検査を実行して
      新規違反 0 件を確認してからマージに進む。base 既知違反と新規違反の分離突合を省略せず、
      baseline 既知違反の無断削除・隠蔽を受け入れない。

conflict_resolutions: []

operation_units:
  - ou_id: OU-001
    source_ru: RU-0003
    target_req: null
    target_design: docs/designs/commands/case-run.md（主）、docs/designs/commands/case-close.md（副）
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
      case-run.md / case-close.md の更新後、配布物変更を含む case 手順に3検査の
      commit 前実行工程と実行順（配布依存境界 → IR-055 → traceability）が記載されていることを
      確認する。既存の検査定義（IR-055、distribution-boundary、traceability 契約）と
      参照名が一致していることを突合する。
    pass_criteria: |
      case-run.md と case-close.md の両方に commit 前3検査工程と実行順が明記されている。
      検査名・参照先が既存契約と一致する。
    on_failure: |
      fix-and-reverify。記載漏れ・参照名不整合を修正して再検証する。
  - id: TS-002
    target_item: AG-002
    verification: |
      更新後の Design 記述に、base 既知違反と新規違反の分離突合、新規違反の fix-and-reverify、
      0 件確認が記載されていることを確認する。
    pass_criteria: |
      分離突合と fix-and-reverify、新規違反 0 件確認が明記されている。
    on_failure: |
      fix-and-reverify。記載を修正して再検証する。
  - id: TS-003
    target_item: AG-003
    verification: |
      更新後の Design 記述に baseline 既知違反の無断削除・隠蔽禁止と、baseline エントリ除去の
      前提条件（残存箇所の実際の解消とセット）が記載されていることを確認する。
      RU-0001（distribution-reference-generalization）の TS-003 と整合していることを突合する。
    pass_criteria: |
      無断削除・隠蔽の禁止と、解消とセットでのみの baseline 除去が明記されている。
    on_failure: |
      fix-and-reverify。記載を修正して再検証する。

case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints:
    - RU-0004 / RU-0006 / RU-0008 の draft が同一 Design ファイル（case-run.md、case-close.md）を更新する。case-open の Wave 構成で同時実行を避けるか、同一 Wave 内での競合解消を考慮すること
```

# summary

RU-0003（配布物変更直後の3検査標準化）を docs_chore として要件化した。配布物変更時の配布依存境界・IR-055・traceability 3検査の commit 前実行と実行順、base 既知違反と新規違反の分離突合、baseline 無断削除禁止を case-run / case-close Design 手順へ明文化する。
