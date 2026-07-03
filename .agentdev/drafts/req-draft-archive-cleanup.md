---
draft_type: req_draft
topic_slug: archive-cleanup
status: saved
created_at: 2026-07-03T00:00:00+09:00
---

# draft-data

```yaml
work_type: maintenance

scale: standard

summary: |
  .agentdev/ 配下のアーカイブ運用を見直し、(1) inspect ドメインの archive/rejected/ を廃止し reject 後は即時削除、(2) intake ドメインの archive/（promoted/, rejected/）を廃止し promote/reject 判断後は即時削除、(3) learning ドメインの archive/active.md を deferred.md（learning/ 直下）へリネームし living pool 性質を維持、の3変更を実施する。監査証跡は git log のみで運用し、reject 時の commit message に却下理由を含めることで監査価値を補強する。新規 ADR は作成せず（agentdev-adr-guidelines 作成不可条件: 命名規約#4、削除主題）、全変更を既存 REQ UPDATE + SPEC UPDATE として処理する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      inspect ドメインディレクトリは inbox/, promoted/ のみを持ち、reject された検出事項は即時削除されること。従来の archive/rejected/ は廃止する。inspect-promote は reject 判定時に inbox ファイルを削除し、archive/ への移動を行わないこと。

  - id: AG-002
    content: |
      intake-promote は inbox の intake 項目を採用判定・HITL 確定を経て promoted に配置または削除すること。従来の archive/（promoted/, rejected/）への配置を廃止する。promote 判定時は promoted/ に保存後、元 inbox ファイルを削除。reject 判定時は inbox ファイルを削除。

  - id: AG-003
    content: |
      intake-promote は分類承認後、promoted 保存、inbox ファイル削除、commit/push を追加確認なしで自動実行すること（分類未確定、修正中は進まない）。従来の「archive 移動」を「削除」に置き換える。

  - id: AG-004
    content: |
      learning パイプラインのドメイン状態は inbox.md, deferred.md, evaluation-report.md, promoted/ で構成されること。従来の archive/active.md を deferred.md（learning/ 直下）にリネームし、archive/ サブディレクトリを解体する。

  - id: AG-005
    content: |
      deferred.md は learning-promote の living pool（評価済み・再評価候補の蓄積領域）として機能すること。learning-promote は deferred.md を読み込み、inbox からのエントリ移動、prune（staged/rejected/duplicate の削除）を実行する。deferred.md は deferred カテゴリ（learning-promote 11カテゴリ廃棄判定のカテゴリ10）のエントリを含むが、未処理・保留中・再評価対象のエントリも保持する多状態の living pool であり、deferred エントリ限定のファイルではないことを各 SPEC/skill/command で明記すること。

  - id: AG-006
    content: |
      intake-promote, inspect-promote は reject 判定時の git commit message に却下理由を含めること。これにより監査証跡を git log のみとする方針（ユーザー合意: 完全破棄）において、特に REQ再構成intake reject のガバナンス的監査価値を補強する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: REQ-0124
    source_items: [AG-001]
    content: |
      REQ-0124-012 変更後:
      「ドメインディレクトリは .agentdev/inspect/（inbox/, promoted/）であること。reject された検出事項は即時削除されること」

      REQ-0103-140 変更後（REQ-0124.md 内）:
      「.agentdev/inspect/ を inspect ドメイン状態として定義すること。inbox/（未分類の inspect 検出事項）、promoted/（採用済み、RU 化対象）を持つこと。reject された検出事項は保持しないこと」

      REQ-0103-146 変更後（REQ-0124.md 内）:
      「promote された inspect 成果物は .agentdev/inspect/promoted/ に保存すること。defer は inbox/ に残し、reject は削除すること」

      REQ-0124-006 変更後:
      「docs/specs/responsibilities/artifact-contracts.md の draft type registry は skill_review_finding を含まず、inspect ライフサイクル（.agentdev/inspect/ inbox/promoted, promote/defer/reject）への参照であること」

      適用範囲（対象）から「archive/rejected/」を含む記述を削除:
      「- .agentdev/inspect/ ドメインディレクトリ（inbox/, promoted/）」

  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: REQ-0126
    source_items: [AG-001, AG-006]
    content: |
      REQ-0126-005 変更後:
      「reject された検出事項は削除すること」

      REQ-0126-009 変更後:
      「inspect-promote は .agentdev/inspect/ 配下の変更（promoted/ への保存、inbox 削除を含む）を git commit / push すること。変更なし時は commit/push せず完了報告で「変更なし」と報告すること」

  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: REQ-0127
    source_items: [AG-002]
    content: |
      REQ-0127-003 変更後:
      「intake-promote は inbox の intake 項目を直接読み込み、採用判定、HITL 確定を経て promoted に配置または削除すること」

  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: REQ-0128
    source_items: [AG-004, AG-005]
    content: |
      REQ-0128-001 変更後:
      「learning パイプラインは専用のドメイン状態を持つこと。ドメイン状態は inbox.md（未整理エントリ）, deferred.md（評価済み・再評価候補の living pool）, evaluation-report.md（8軸評価レポート）, promoted/（採用済み成果物）で構成されること」

  - id: ACT-REQ-005
    artifact: req
    operation: update
    target: REQ-0137
    source_items: [AG-001, AG-002]
    content: |
      対象外セクション（L47 付近）のテキスト修正:
      変更前: 「draft/RU 以外の成果物削除（intake archive、inspect archive 等。これらは別コマンドのライフサイクル）」
      変更後: 「draft/RU 以外の成果物削除（intake inbox 削除、inspect inbox 削除 等。これらは別コマンドのライフサイクル）」

  - id: ACT-REQ-006
    artifact: req
    operation: update
    target: REQ-0147
    source_items: [AG-003]
    content: |
      REQ-0147-008 変更後:
      「intake-promote は分類承認後の promoted 保存、inbox ファイル削除、commit/push を追加確認なしで実行する（分類未確定、修正中は進まない）」

  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: workflows
      slug: capture-boundaries
    target_area: "## REQ 再構成 intake"
    source_items: [AG-002, AG-006]
    content: |
      REQ再構成intake の状態パス表を更新:
      - inbox: .agentdev/intake/inbox/req-restructure/（変更なし）
      - 却下: 従来 .agentdev/intake/archive/rejected/req-restructure/ → 削除（archive/rejected/ 廃止）。REQ再構成intake の reject も即時削除とし、reject commit message に却下理由を含める（AG-006）ことで監査証跡を確保。

  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: workflows
      slug: backlog-artifact-lifecycle
    source_items: [AG-004, AG-005]
    content: |
      L50 付近の learning-promote 入力記述を更新:
      変更前: 「learning-promote は inbox.md + archive/active.md から読み取り...」
      変更後: 「learning-promote は inbox.md + deferred.md から読み取り...」

      intake/promoted lifecycle 記述の更新:
      promoted への保存後、元 inbox item は削除（archive/promoted/ への移動を廃止）。

  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: commands
      slug: intake-promote
    source_items: [AG-002, AG-003, AG-006]
    content: |
      archive/promoted/ 移動の記述（L36, L80, G17）を inbox ファイル削除に変更。
      archive/rejected/ 移動の記述を inbox ファイル削除に変更。
      フェーズ4 振り分け（L47）の「archive 移動含む」を「inbox 削除含む」に変更。
      分類承認後の自動実行（L19）の「archive 移動」を「削除」に変更。
      reject 時の commit message に却下理由を含める旨を追加（AG-006）。

  - id: ACT-SPEC-004
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: commands
      slug: inspect-promote
    source_items: [AG-001, AG-006]
    content: |
      .agentdev/inspect/archive/rejected/ のパス記述（L23, L46, L60）を削除し、reject 後の即時削除に変更。
      G03 の「reject 検出事項の archive/rejected/ 以外への移動禁止」を「reject 検出事項は削除されること」に変更。
      reject 時の commit message に却下理由を含める旨を追加（AG-006）。

  - id: ACT-SPEC-005
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: commands
      slug: learning-promote
    source_items: [AG-004, AG-005]
    content: |
      archive/active.md の参照（L18, L31, L37, L51, L57）を全て deferred.md に変更。
      L18「archive/active.md の living pool」→「deferred.md の living pool」。
      Step 2「archive/active.md 読込」→「deferred.md 読込」。
      Step 13「archive/active.md（inbox 移動分追記）」→「deferred.md（inbox 移動分追記）」。
      Step 14 prune 記述の archive/active.md → deferred.md。
      deferred.md は多状態の living pool である旨を明記（AG-005）。

  - id: ACT-SPEC-006
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: commands
      slug: req-define
    source_items: [AG-004]
    content: |
      G06（L159）の「inbox.md / archive/active.md 直接ロード禁止」を「inbox.md / deferred.md 直接ロード禁止」に変更。

  - id: ACT-SPEC-007
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: commands
      slug: backlog-review
    source_items: [AG-001, AG-002, AG-004]
    content: |
      G04（L64）の更新禁止パスを修正:
      変更前: 「.agentdev/intake/inbox/, .agentdev/intake/archive/, .agentdev/learning/inbox.md, .agentdev/learning/archive/active.md の更新」
      変更後: 「.agentdev/intake/inbox/, .agentdev/learning/inbox.md, .agentdev/learning/deferred.md の更新」
      .agentdev/intake/archive/ は廃止のため削除。

  - id: ACT-SPEC-008
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-intake-pipeline
    source_items: [AG-002]
    content: |
      L52 の振り分け先記述を更新:
      変更前: 「振り分け先の正確性（.agentdev/intake/promoted/、.agentdev/intake/archive/）」
      変更後: 「振り分け先の正確性（.agentdev/intake/promoted/）および inbox ファイル削除の検証」

  - id: ACT-SPEC-009
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-learning-pipeline
    source_items: [AG-004, AG-005]
    content: |
      L28 の artifact lifecycle 記述を更新:
      変更前: 「artifact lifecycle（inbox → archive/active → promoted）」
      変更後: 「artifact lifecycle（inbox → deferred → promoted）」
      deferred.md は多状態の living pool である旨を明記（AG-005）。

  - id: ACT-SPEC-010
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: commands
      slug: case-close
    source_items: [AG-004]
    content: |
      L138 の「agentdev-learning-pipeline skill（archive ルール）」参照記述を確認し、必要に応じて deferred ルール参照に更新。

conflict_resolutions:
  - id: CR-001
    conflict: 新規 ADR が必要か（ディレクトリ構造変更、監査証跡方針変更、ADR-0113 deprecated との関連）
    resolution: |
      新規 ADR は不要。agentdev-adr-guidelines の「ADR 作成不可条件」に照らし、directory rename は条件#4（命名規約）、archive 廃止は「削除主題の ADR は作成しない」に該当。監査証跡＝git log のみの方針は運用ルール（REQ-0147 領域）または SPEC 更新で記録可能であり、構造的不可逆性を持たない。Oracle 相談（agentdev-architecture-advisory）で確認済み。

  - id: CR-002
    conflict: 監査証跡完全破棠のリスク（特に REQ再構成intake reject のガバナンス的価値）
    resolution: |
      ユーザー合意（完全破棄、git log のみ）を尊重。ただし Oracle 推奨の緩和策（reject commit message に却下理由を義務化、AG-006）を採用し、監査価値を補強。通常 intake/inspect reject は下流 reader なしで監査価値が低く git log で十分（Oracle 確定事項）。REQ再構成 reject は capture-boundaries.md で明示パスがあったが、完全破棠方針を適用しつつ commit message で却下理由を保持。

operation_units:
  - ou_id: OU-001
    target_req: REQ-0124
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

  - ou_id: OU-002
    target_req: REQ-0126
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

  - ou_id: OU-003
    target_req: REQ-0127
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

  - ou_id: OU-004
    target_req: REQ-0128
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}

  - ou_id: OU-005
    target_req: REQ-0137
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: single
    result: {}

  - ou_id: OU-006
    target_req: REQ-0147
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

  - ou_id: OU-007
    target_spec:
      operation: update
      domain: workflows
      slug: capture-boundaries
    operation: spec-update
    scale: standard
    depends_on: [OU-001, OU-002, OU-003]
    recommended_order: 2
    issue_policy: single
    result: {}

  - ou_id: OU-008
    target_spec:
      operation: update
      domain: workflows
      slug: backlog-artifact-lifecycle
    operation: spec-update
    scale: standard
    depends_on: [OU-004]
    recommended_order: 2
    issue_policy: single
    result: {}

  - ou_id: OU-009
    target_spec:
      operation: update
      domain: commands
      slug: intake-promote
    operation: spec-update
    scale: standard
    depends_on: [OU-003, OU-006]
    recommended_order: 2
    issue_policy: single
    result: {}

  - ou_id: OU-010
    target_spec:
      operation: update
      domain: commands
      slug: inspect-promote
    operation: spec-update
    scale: standard
    depends_on: [OU-001, OU-002]
    recommended_order: 2
    issue_policy: single
    result: {}

  - ou_id: OU-011
    target_spec:
      operation: update
      domain: commands
      slug: learning-promote
    operation: spec-update
    scale: standard
    depends_on: [OU-004]
    recommended_order: 2
    issue_policy: single
    result: {}

  - ou_id: OU-012
    target_spec:
      operation: update
      domain: commands
      slug: req-define
    operation: spec-update
    scale: standard
    depends_on: [OU-004]
    recommended_order: 2
    issue_policy: single
    result: {}

  - ou_id: OU-013
    target_spec:
      operation: update
      domain: commands
      slug: backlog-review
    operation: spec-update
    scale: standard
    depends_on: [OU-001, OU-003, OU-004]
    recommended_order: 2
    issue_policy: single
    result: {}

  - ou_id: OU-014
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-intake-pipeline
    operation: spec-update
    scale: standard
    depends_on: [OU-003]
    recommended_order: 2
    issue_policy: single
    result: {}

  - ou_id: OU-015
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-learning-pipeline
    operation: spec-update
    scale: standard
    depends_on: [OU-004]
    recommended_order: 2
    issue_policy: single
    result: {}

  - ou_id: OU-016
    target_spec:
      operation: update
      domain: commands
      slug: case-close
    operation: spec-update
    scale: standard
    depends_on: [OU-004]
    recommended_order: 3
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      REQ-0124.md, REQ-0126.md を読み、REQ-0124-012, REQ-0103-140, REQ-0103-146, REQ-0126-005, REQ-0126-009 が archive/rejected/ を含まないことを確認。inspect-promote.md SPEC が reject 後の即時削除を記述していることを確認。
    pass_criteria: |
      上記 REQ 要件行と inspect-promote SPEC に archive/rejected/ への言及がなく、reject 後の削除が規定されていること。
    on_failure: |
      fix-and-reverify。REQ/SPEC の該当箇所に archive/rejected/ が残存する場合は修正して再検証。

  - id: TS-002
    target_item: AG-002
    verification: |
      REQ-0127.md を読み、REQ-0127-003 が「promoted に配置または削除」となっていることを確認。intake-promote.md SPEC が archive/（promoted/, rejected/）への言及を持たず、inbox ファイル削除を記述していることを確認。
    pass_criteria: |
      REQ-0127-003 に archive への言及がなく、promoted または削除が規定されていること。intake-promote SPEC に archive/ へのパスがないこと。
    on_failure: |
      fix-and-reverify。archive/ への言及が残存する場合は修正して再検証。

  - id: TS-003
    target_item: AG-003
    verification: |
      REQ-0147.md を読み、REQ-0147-008 が「promoted 保存、inbox ファイル削除、commit/push の自動実行」となっていることを確認。
    pass_criteria: |
      REQ-0147-008 に archive 移動の言及がなく、inbox ファイル削除が規定されていること。
    on_failure: |
      fix-and-reverify。archive 移動の言及が残存する場合は修正して再検証。

  - id: TS-004
    target_item: AG-004
    verification: |
      REQ-0128.md を読み、REQ-0128-001 が deferred.md を含むドメイン状態を規定していることを確認。archive/active.md への言及がないことを確認。
    pass_criteria: |
      REQ-0128-001 に deferred.md が含まれ、archive/active.md への言及がないこと。
    on_failure: |
      fix-and-reverify。archive/active.md が残存する場合は修正して再検証。

  - id: TS-005
    target_item: AG-005
    verification: |
      learning-promote.md SPEC, agentdev-learning-pipeline.md SPEC, backlog-artifact-lifecycle.md SPEC を読み、deferred.md が多状態の living pool として記述されていることを確認（deferred エントリ限定ではない旨の明記）。
    pass_criteria: |
      いずれかの SPEC で「deferred.md は deferred カテゴリ限定ではなく、未処理・保留・再評価対象を含む living pool」という旨が明記されていること。
    on_failure: |
      fix-and-reverify。living pool の多状態性の明記がない場合は SPEC を補足して再検証。

  - id: TS-006
    target_item: AG-006
    verification: |
      intake-promote.md SPEC, inspect-promote.md SPEC を読み、reject 時の commit message に却下理由を含める旨が記述されていることを確認。
    pass_criteria: |
      両 SPEC に「reject 時の commit message に却下理由を含める」旨の記述があること。
    on_failure: |
      fix-and-reverify。記述がない場合は SPEC に追記して再検証。

case_open_hints:
  epic_needed: false
  decomposition: |
    実装グループの参考情報（case-open が最終的な Issue 構成を決定する）:
    - inspect archive 廃止: REQ-0124, REQ-0126 UPDATE + inspect-promote SPEC
    - intake archive 廃止: REQ-0127, REQ-0147 UPDATE + intake-promote SPEC, agentdev-intake-pipeline SPEC, capture-boundaries SPEC
    - learning deferred.md リネーム: REQ-0128 UPDATE + learning-promote SPEC, agentdev-learning-pipeline SPEC, backlog-review SPEC, req-define SPEC, backlog-artifact-lifecycle SPEC
    - 共通: REQ-0137 UPDATE + case-close SPEC
    - guide 更新（実装時、artifact_actions 外）: intake-learning-backlog-flow.md, artifacts-and-state.md, command-selection.md
  wave_hints:
    - "Wave 1: REQ UPDATE（OU-001〜006、並列可能）"
    - "Wave 2: SPEC UPDATE（OU-007〜016、対応する REQ UPDATE の後に実施推奨）"
    - "Wave 3: guide 更新（intake-learning-backlog-flow.md, artifacts-and-state.md, command-selection.md）"
```

# summary

.agentdev/ 配下のアーカイブ運用を見直す要件。3つの設計変更を含む:

1. inspect ドメインの archive/rejected/ 廃止 → reject 後即時削除
2. intake ドメインの archive/（promoted/, rejected/）廃止 → promote/reject 判断後即時削除
3. learning ドメインの archive/active.md → deferred.md（learning/ 直下）リネーム、living pool 性質維持

監査証跡は git log のみで運用（ユーザー合意: 完全破棄）。reject commit message に却下理由を含めることで監査価値を補強。

新規 ADR は作成しない（agentdev-adr-guidelines 作成不可条件該当: 命名規約#4、削除主題）。全変更を REQ UPDATE 6件 + SPEC UPDATE 10件で処理。

影響範囲: REQ-0124, 0126, 0127, 0128, 0137, 0147 / SPEC 10件（capture-boundaries, backlog-artifact-lifecycle, intake-promote, inspect-promote, learning-promote, req-define, backlog-review, agentdev-intake-pipeline, agentdev-learning-pipeline, case-close）/ guide 3件（intake-learning-backlog-flow, artifacts-and-state, command-selection、実装時更新）。

ADR-0113（deprecated）は変更不要（歴史参照）。retired REQ 群も変更不要。
