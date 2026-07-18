---
draft_type: req_draft
topic_slug: command-step-x-y-permissibility-criteria
status: draft
created_at: 2026-07-18T16:30:00+09:00
source_rus:
  - RU-0009
spec_save_status: completed-spec-save-partial
spec_save_start: 2026-07-18T23:06:29+09:00
spec_save_end: 2026-07-18T23:09:00+09:00
spec_save_partial:
  consumed: []
  skip_reasons:
    ACT-SPEC-001:
      reason: >
        対象 SPEC ファイル docs/specs/authoring/command-authoring-standards.md が未存在（ENOENT）。
        operation=update だが配置先 SPEC が存在しないため spec-save.md Step 3「配置先 SPEC が特定できない場合 →
        当該候補をスキップし follow-up に明示」に準拠し skip。
        search-target-area.ts 実行結果: ENOENT (errno -2, code "ENOENT")。
      precedent: >
        Issue #1560 / PR #1561（8件目 ACT-SPEC-002, target_area=boilerplate 許容指針）と同じ理由。
        8件目も docs/specs/authoring/command-authoring-standards.md 未存在（ENOENT）のため partial skip 済み。
      related_intake: >
        .agentdev/intake/inbox/intake-2026-07-18-command-authoring-standards-spec-missing.md（8件目で起票）。
        推奨 (a) 新規 SPEC 作成を別 case で実施後、本件 ACT-SPEC-001 も新 SPEC への追記として再処理することを推奨。
        9件目と8件目は同一 SPEC ファイルへの依存のため統合対応推奨。
      target_spec:
        operation: update
        domain: authoring
        slug: command-authoring-standards
      target_area: Step X-Y 表記許容基準
      source_items: [AG-001]
      operation_at_create: 新規 SPEC 作成時に本 content を Step X-Y 表記許容基準 セクションとして配置すること
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: |
  case-auto.md、case-close.md、req-save.md の既存 `Step N-0` 命名が check_command_format.test.ts の
  command-format-zero-substep 検査で違反となっている問題を解消するため、command-authoring-standards.md
  SPEC で Step X-Y 表記の許容基準を明文化する。SPEC 明文化の結果に基づき、3 command の Step N-0 を
  残すかリネームするかを判断し、検査基準調整または命名リネームのいずれかで是正する。
  広範囲 refactor の可能性があるため影響範囲調査を先行し、req-define では SPEC 明文化のスコープを
  確定した上で case-open/case-run で段階実施する。Issue #1528 スコープ外、PR #1534 见送り候補。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      docs/specs/authoring/command-authoring-standards.md SPEC で Step X-Y 表記が許容される条件を明文化する。サブステップを持たない Step の表記としての `Step N-0` の扱い（許容・非許容・例外条件）を判定表形式で定義する。機械検査（check_command_format.test.ts の command-format-zero-substep）と SPEC の整合性を保つ。
  - id: AG-002
    content: |
      AG-001 の SPEC 明文化結果に基づき、3 command（case-auto, case-close, req-save）の Step N-0 を残すかリネームするかを判断する。判断は SPEC で許容される場合に「残す」、許容されない場合に「リネーム」を選ぶ。影響範囲調査を先行し、配布本文・SPEC・関連スキル参照の更新スコープを case-open 前に確定する。
  - id: AG-003
    content: |
      検査基準調整（check_command_format.test.ts 側の変更）を選ぶ場合、SPEC の許容条件と検査ロジックの整合性を保つ。命名リネームを選ぶ場合、配布 command 本文・SPEC・関連スキル参照の三方を一括更新し、段階的リネームによる中間状態の不整合を発生させない。

artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: authoring
      slug: command-authoring-standards
    target_area: Step X-Y 表記許容基準
    source_items: [AG-001]
    content: |
      ## Step X-Y 表記許容基準

      Step 番号は `Step N-M` 形式（N=主ステップ番号、M=サブステップ番号）を標準とする。
      サブステップを持たない Step の `Step N-0` 表記は、以下の条件を全て満たす場合に限り許容する:

      1. 当該 Step が子ステップを持たない単独工程であること
      2. 同一 command 内で他の Step が `Step N-M`（M≧1）形式を採用しており、番号体系の一貫性を保つ必要があること
      3. 機械検査（check_command_format.test.ts command-format-zero-substep）が SPEC 本条件を誤検知対象外として認識できること

      条件を満たさない `Step N-0` 表記は違反とし、`Step N` 形式へリネームする。
      検査ロジックと SPEC の整合性は REQ-0108-258（テストデータ構成は実ファイル構成を反映）に準拠する。

conflict_resolutions:
  - id: CR-001
    conflict: |
      PR #1534 で本件を「見送り」選択し後続 spec-save で対応する合意（CR-002）があった。req-define で処理することは CR-002 と整合するか。
    resolution: |
      整合する。CR-002 は「SPEC 修正は case-run 都度 spec-save」を定めるものであり、req-define で SPEC 明文化のスコープを確定すること自体は CR-002 の対象外。本 draft で要件化した上で case-run → spec-save の順で処理する。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0009
    target_spec:
      operation: update
      domain: authoring
      slug: command-authoring-standards
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0009
    target_req: REQ-0108
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      command-authoring-standards.md SPEC に Step X-Y 許容基準セクションを追記後、SPEC が req-health-metrics の行数基準に収まることを確認する。既存の Step 表記規約との矛盾がないことを確認する。
    pass_criteria: |
      SPEC に Step X-Y 許容基準が明文化され、既存規約と矛盾しないこと。SPEC 行数が基準内であること。
    on_failure: |
      fix-and-reverify。既存規約と矛盾する場合は SPEC 表現を調整し再検証する。行数超過の場合は既存セクションを凝縮し再調整する。
  - id: TS-002
    target_item: AG-002
    verification: |
      影響範囲調査を実施し、3 command（case-auto, case-close, req-save）の Step N-0 が SPEC 許容条件を満たすか否かを判定する。判定結果に基づき「残す」または「リネーム」の方針を文書化する。配布本文・SPEC・関連スキル参照の更新スコープをリスト化する。
    pass_criteria: |
      3 command について SPEC 許容条件の合否が判定され、方針（残す or リネーム）が文書化されていること。更新スコープがリスト化されていること。
    on_failure: |
      fix-and-reverify。判定材料が不足する場合は SPEC 許容条件を再整理し、判定基準を明確化して再判定する。
  - id: TS-003
    target_item: AG-003
    verification: |
      方針（検査基準調整 or 命名リネーム）に従い実装修復を実施した後、check_command_format.test.ts を実行し command-format-zero-substep 違反が0件であることを確認する。3 command の前後で command 実行手順の意味構造が保たれていることを目視確認する。
    pass_criteria: |
      command-format-zero-substep 違反が0件であること。3 command の意味構造が保たれていること。
    on_failure: |
      fix-and-reverify。違反が残る場合は SPEC 許容条件と実装の整合を再確認し、必要に応じて SPEC または実装を再調整する。意味構造の崩れがある場合はリネーム方針を見直す。

case_open_hints:
  epic_needed: false
  decomposition:
    - OU-001: SPEC 明文化（先行）
    - OU-002: 3 command 是正（SPEC 明文化後に実施）
  wave_hints:
    - Wave 1: SPEC 明文化（OU-001）
    - Wave 2: 3 command 是正（OU-002、SPEC 明文化完了後）
```

# summary

3 command（case-auto, case-close, req-save）の Step N-0 命名が check_command_format.test.ts で違反となっている。本 draft は command-authoring-standards.md SPEC で Step X-Y 表記許容基準を明文化（AG-001）、3 command の残す/リネーム判断（AG-002）、検査基準調整/命名リネームの実施（AG-003）を合意する feature である。広範囲 refactor の可能性があるため影響範囲調査を先行し、case-open/case-run で段階実施する。Issue #1528 スコープ外、PR #1534 見送り候補を req-define で正規要件化する。CR-002（SPEC 修正は case-run 都度 spec-save）との整合性は CR-001 で確認済み。
