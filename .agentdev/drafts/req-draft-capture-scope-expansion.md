---
draft_type: req_draft
topic_slug: capture-scope-expansion
status: saved
created_at: 2026-07-27T00:00:00+09:00
source_rus:
  - RU-0009
agentdev_handoff: true
spec_actions_consumed: true
---

<!-- 本ドラフトは AgentDevFlow 本体の不具合・改善点を扱う前工程引き継ぎドラフトである（agentdev_handoff: true）。 -->

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  工程横断の capture 境界を拡張し、req-save/spec-save/case-open/case-close の各完了報告に含まれる
  deviation が intake/learning pipeline へ流入する経路を正規化する。各工程分散型を採用し、
  command は Command→Skill 依存方向を遵守して agentdev-learning-capture skill または
  agentdev-intake-pipeline（自動capture向け item 生成操作を追加）へ委譲、git 永続化は呼出元 command 担当。
  case-run/case-close 現行 PR Findings 経由は維持、case-auto は各工程の保存結果参照のみ集計。
  capture-boundaries.md 単独では完結せず、REQ-006 修正 + 各 command SPEC + 完了報告契約の同期更新が必要。
  新規 ADR 不要（command 動作仕様/workflow 定義は ADR 作成不可対象）、agentdev-architecture-advisory 助言実施済み。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      各工程 command（req-save/spec-save/case-open/case-close）は、自工程で実観測した deviation を
      capture-boundaries.md が定める Split Rule（intake/learning 境界）で分類し、intake/learning のいずれかへ保存する。
      各工程分散型（選択肢A）を採用し、case-auto 集約型は採用しない。
      理由: case-auto を通らない個別実行（手動 case-run 等）でも capture を成立させる必要があるため。
  - id: AG-002
    content: |
      Command→Skill 依存方向を遵守し、各 command は別 command（intake-capture 等）を呼ばない。
      - learning 保存: agentdev-learning-capture skill へ委譲
      - intake 保存: agentdev-intake-pipeline へ自動capture向け item 生成操作を追加して委譲
      - git 永続化: 呼出元 command が自身の既存 commit/push 処理内で実施
      intake-capture はユーザーの自然言語入力を受ける手動保存用 command であり、自動 deviation capture の内部 API ではない。
  - id: AG-003
    content: |
      各 command の完了報告には、保存した capture 成果物のパス・分類（intake/learning）・保存結果のみを含める。
      capture 本文は完了報告へ含めない。capture 本文は各 pipeline の永続先（intake/inbox/, learning/inbox.md 等）が正規所有する。
  - id: AG-004
    content: |
      case-run は現行どおり PR Findings を経由し、case-close が回収する（現行契約維持）。
      case-close の capture 入力源は PR 本文のみ（現行維持）。
  - id: AG-005
    content: |
      case-auto は capture 本文を再分類・再保存しない。各工程から返された保存結果の参照と件数のみを集計する。
      case-auto は工程内部の調査過程を蓄積せず、結果のみを受け取る契約（現行維持）。
  - id: AG-006
    content: |
      Epic Issue へ記録する場合は単一書き手制約に従い case-close 経由で行う。
      case-auto 自身は Epic Issue を更新しない（現行維持、per-Epic 単一書き手 = case-close）。
  - id: AG-007
    content: |
      完了報告の所有権を分割する:
      - 共通意味契約（6フィールド + `結果` の意味、および `Capture結果` 小節の意味論）は artifact-contracts.md
      - 具体的 `Capture結果` 小節の表示構造は各 command-local Template
      新規トップレベルフィールドは追加せず、`結果` 内に任意の `Capture結果` 小節を定義する。
  - id: AG-008
    content: |
      新規 ADR は不要。command 動作仕様/workflow 定義は ADR 作成不可対象（agentdev-adr-guidelines）。
      ただし agentdev-architecture-advisory 助言は実施済み（deep-review 5レーン検証で設計判断2として確定）。
      想定結果は ADR unnecessary。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-006.md
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006]
    content: |
      REQ-006 の capture 責務境界を変更する:
      - case-open は intake/learning 候補を case-close へ委譲する現行契約から、
        自工程で実観測した deviation を Split Rule で分類して intake/learning へ保存する責務へ変更
      - case-close は PR 本文からの回収（現行維持）に加え、自工程で実観測した deviation の capture 責務を追加
      - req-save は REQ 再構成 intake のみ（現行維持）に加え、自工程で実観測した deviation の capture 責務を追加
      - spec-save は非関与（現行）から、自工程で実観測した deviation の capture 責務へ変更
      - case-auto は各工程の責務を継承しつつ、capture 本文の再分類・再保存は行わず各工程の保存結果参照のみ集計
      詳細要件行は req-save 実行時に REQ-006 の既存要件群との整合を確認して配置する。
  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: workflows
      slug: capture-boundaries
    target_area: "## 工程別 capture 責務"
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006]
    spec_logical_division: cross_cutting_contract
    canonical_owner: capture-boundaries
    content: |
      ## 工程別 capture 責務

      各工程 command は自工程で実観測した deviation を Split Rule で分類し、intake/learning のいずれかへ保存する。

      | Command | capture 責務 | 保存先 | git 永続化 |
      |---------|------------|--------|-----------|
      | req-save | REQ 再構成 intake（現行維持）+ 自工程 deviation の capture | intake/inbox/ または learning/inbox.md | req-save 自身 |
      | spec-save | 自工程 deviation の capture（現行非関与から変更） | intake/inbox/ または learning/inbox.md | spec-save 自身 |
      | case-open | 自工程 deviation の capture（現行非関与から変更）。case-close への委譲は廃止 | intake/inbox/ または learning/inbox.md | case-open 自身 |
      | case-run | PR Findings 経由（現行維持） | PR 本文 | case-run 自身 |
      | case-close | PR 本文からの回収（現行維持）+ 自工程 deviation の capture | intake/inbox/ または learning/inbox.md | case-close 自身 |
      | case-auto | 各工程の保存結果参照と件数のみ集計。capture 本文の再分類・再保存は行わない | （集計のみ） | （集計のみ） |

      ### 委譲契約

      - learning 保存: agentdev-learning-capture skill へ委譲
      - intake 保存: agentdev-intake-pipeline へ自動capture向け item 生成操作を追加して委譲
      - command から別 command（intake-capture 等）は呼ばない（Command→Skill 依存方向）

      ### Epic Issue 単一書き手制約

      Epic Issue への記録は case-close 経由。case-auto 自身は Epic Issue を更新しない（per-Epic 単一書き手 = case-close）。

      ### 完了報告

      各 command の完了報告には保存した capture 成果物のパス・分類・保存結果のみを含める。capture 本文は含めない。
  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: commands
      slug: req-save
    target_area: "## 副作用"
    source_items: [AG-001, AG-002, AG-003]
    spec_logical_division: behavior
    canonical_owner: req-save
    content: |
      ## 副作用

      （既存の "intake / learning capture: 原則非関与（G12、例外: REQ 再構成 intake のみ生成可能）" 行を以下の3行へ置換。他の副作用行は変更なし）

      - deviation capture: req-save 実行中に実観測した deviation を agentdev-learning-capture skill または
        agentdev-intake-pipeline（自動capture向け item 生成操作）へ委譲して保存。
        保存先は capture-boundaries.md の Split Rule に従う。
        REQ 再構成 intake のみ（現行維持）も本責務に含む。
      - git 永続化: capture 成果物を req-save 自身の既存 commit/push 処理内で永続化。
      - 完了報告: 保存した capture 成果物のパス・分類・保存結果を `Capture結果` 小節（`結果` 内）に含める。
  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: commands
      slug: spec-save
    target_area: "## 副作用"
    source_items: [AG-001, AG-002, AG-003]
    spec_logical_division: behavior
    canonical_owner: spec-save
    content: |
      ## 副作用

      （現行の副作用に加えて以下を追記）

      - deviation capture: spec-save 実行中に実観測した deviation を agentdev-learning-capture skill または
        agentdev-intake-pipeline（自動capture向け item 生成操作）へ委譲して保存。
        保存先は capture-boundaries.md の Split Rule に従う。
      - git 永続化: capture 成果物を spec-save 自身の既存 commit/push 処理内で永続化。
      - 完了報告: 保存した capture 成果物のパス・分類・保存結果を `Capture結果` 小節（`結果` 内）に含める。
  - id: ACT-SPEC-004
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: commands
      slug: case-open
    target_area: "## 副作用"
    source_items: [AG-001, AG-002, AG-003]
    spec_logical_division: behavior
    canonical_owner: case-open
    content: |
      ## 副作用

      （既存の "intake / learning capture: 非関与（G18, G22）" 行を以下の3行へ置換。case-close への capture 委譲は廃止。他の副作用行は変更なし）

      - deviation capture: case-open 実行中に実観測した deviation を agentdev-learning-capture skill または
        agentdev-intake-pipeline（自動capture向け item 生成操作）へ委譲して保存。
        保存先は capture-boundaries.md の Split Rule に従う。
      - git 永続化: capture 成果物を case-open 自身の既存 commit/push 処理内で永続化。
      - 完了報告: 保存した capture 成果物のパス・分類・保存結果を `Capture結果` 小節（`結果` 内）に含める。
  - id: ACT-SPEC-005
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: commands
      slug: case-close
    target_area: "## 副作用"
    source_items: [AG-001, AG-002, AG-003, AG-004]
    spec_logical_division: behavior
    canonical_owner: case-close
    content: |
      ## 副作用

      （現行の副作用に加えて以下を追記）

      - PR 本文からの回収（現行維持）に加え、case-close 実行中に実観測した deviation を agentdev-learning-capture skill または
        agentdev-intake-pipeline（自動capture向け item 生成操作）へ委譲して保存。
        保存先は capture-boundaries.md の Split Rule に従う。
      - git 永続化: capture 成果物を case-close 自身の既存 commit/push 処理内で永続化。
      - 完了報告: 保存した capture 成果物のパス・分類・保存結果を `Capture結果` 小節（`結果` 内）に含める。
      - Epic Issue 単一書き手: case-close は Epic Issue への記録を一手に担う（per-Epic 単一書き手制約）。
  - id: ACT-SPEC-006
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: responsibilities
      slug: artifact-contracts
    target_area: "## 完了報告契約"
    source_items: [AG-007]
    spec_logical_division: cross_cutting_contract
    canonical_owner: artifact-contracts
    content: |
      ## 完了報告契約

      （現行6フィールド + `結果` の意味に加えて以下を追記）

      `結果` 内に任意の `Capture結果` 小節を定義する（新規トップレベルフィールドは追加しない）。
      `Capture結果` 小節の共通意味契約を本 SPEC で定義する。

      ### Capture結果 小節（共通意味契約）

      - 保存した capture 成果物のパス（intake/inbox/*.md または learning/inbox.md への相対パス）
      - 分類（intake/learning）
      - 保存結果（成功/失敗、失敗時は理由）

      具体的な `Capture結果` 小節の表示構造は各 command-local Template が正規所有する。
  - id: ACT-SPEC-007
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-learning-capture
    target_area: "## 呼出元 command 契約"
    source_items: [AG-002]
    spec_logical_division: cross_cutting_contract
    canonical_owner: agentdev-learning-capture
    content: |
      ## 呼出元 command 契約

      （現行契約に加えて以下を追記）

      自動 capture 向け呼出: 各工程 command（req-save/spec-save/case-open/case-close）は、
      自工程で実観測した deviation のうち learning 該当分を agentdev-learning-capture skill へ委譲する。
      本 skill は inbox.md への追記と extraction を担い、git 永続化は呼出元 command が担当する（現行契約維持）。
  - id: ACT-SPEC-008
    artifact: spec
    operation: spec-update
    target_spec:
      operation: update
      domain: skills
      slug: agentdev-intake-pipeline
    target_area: "## 操作一覧"
    source_items: [AG-002]
    spec_logical_division: behavior
    canonical_owner: agentdev-intake-pipeline
    content: |
      ## 操作一覧

      （現行操作に加えて以下を追加）

      ### 自動 capture 向け item 生成操作

      各工程 command（req-save/spec-save/case-open/case-close）からの自動 deviation capture 要求を受ける item 生成操作。
      本操作は intake/inbox/*.md への item 保存を担い、git 永続化は呼出元 command が担当する。
      intake-capture command（ユーザー手動入力用）とは別操作であり、入力形式も異なる。

conflict_resolutions:
  - id: CR-001
    conflict: 各工程分散型 vs case-auto 集約型
    resolution: |
      各工程分散型（選択肢A）を採用。case-auto 集約型は case-auto を通らない個別実行で capture 漏れが生じるため不採用。
      deep-review 5レーン検証（レーン1 目的・制約）で確認済み。
  - id: CR-002
    conflict: command から intake-capture command を呼ぶ構造 vs Command→Skill 依存方向
    resolution: |
      Command→Skill 依存方向を遵守。command から別 command（intake-capture）は呼ばない。
      learning 保存は agentdev-learning-capture skill、intake 保存は agentdev-intake-pipeline への操作追加で対応。
      deep-review 5レーン検証（レーン2 設計・責務境界 DB-01）で確認済み。
  - id: CR-003
    conflict: 完了報告の Capture結果 小節の正規所有先（artifact-contracts.md vs 各 command SPEC）
    resolution: |
      共通意味契約（パス・分類・保存結果の意味論）は artifact-contracts.md、
      具体的表示構造は各 command-local Template で所有権を分割。
      deep-review 5レーン検証（レーン2 設計・責務境界 DB-04）で確認済み。
  - id: CR-004
    conflict: ADR 要否
    resolution: |
      新規 ADR 不要。command 動作仕様/workflow 定義は ADR 作成不可対象。
      agentdev-architecture-advisory 助言は実施済み（想定結果: ADR unnecessary）。
      deep-review 5レーン検証（レーン3 統制・ガバナンス CG-06/07）で確認済み。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0009
    target_req: REQ-006
    operation: update
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0009
    target_spec: docs/specs/workflows/capture-boundaries.md
    operation: spec-update
    scale: large
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-0009
    target_spec: docs/specs/commands/req-save.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001, OU-002]
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-004
    source_ru: RU-0009
    target_spec: docs/specs/commands/spec-save.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001, OU-002]
    recommended_order: 4
    issue_policy: single
    result: {}
  - ou_id: OU-005
    source_ru: RU-0009
    target_spec: docs/specs/commands/case-open.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001, OU-002]
    recommended_order: 5
    issue_policy: single
    result: {}
  - ou_id: OU-006
    source_ru: RU-0009
    target_spec: docs/specs/commands/case-close.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001, OU-002]
    recommended_order: 6
    issue_policy: single
    result: {}
  - ou_id: OU-007
    source_ru: RU-0009
    target_spec: docs/specs/responsibilities/artifact-contracts.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 7
    issue_policy: single
    result: {}
  - ou_id: OU-008
    source_ru: RU-0009
    target_spec: docs/specs/skills/agentdev-learning-capture.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001, OU-002]
    recommended_order: 8
    issue_policy: single
    result: {}
  - ou_id: OU-009
    source_ru: RU-0009
    target_spec: docs/specs/skills/agentdev-intake-pipeline.md
    operation: spec-update
    scale: standard
    depends_on: [OU-001, OU-002]
    recommended_order: 9
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      REQ-006 の capture 責務境界が各工程分散型へ変更されたことを確認する。
      docs/requirements/REQ-006.md にて case-open が自工程 capture を担当し case-close への委譲を廃止、
      req-save/spec-save/case-close が自工程 capture を担当する旨が記載されていること。
      capture-boundaries.md の工程別 capture 責務表が上記に整合すること。
    pass_criteria: |
      REQ-006 の要件群と capture-boundaries.md の責務表が、各工程分散型（選択肢A）の6項目確定案と完全一致すること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。要件定義か SPEC の記載を修正して再検証。
  - id: TS-002
    target_item: AG-002
    verification: |
      Command→Skill 依存方向が遵守されていることを確認する。
      各 command SPEC（req-save/spec-save/case-open/case-close）の本文に intake-capture command への呼出しがなく、
      agentdev-learning-capture skill または agentdev-intake-pipeline への委譲が記載されていること。
      artifact-contracts.md の依存方向（Command→Skill 一方向）と整合すること。
    pass_criteria: |
      全4 command SPEC において intake-capture command 呼出しが存在せず、Skill 委譲のみが記載されていること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。当該 command SPEC の呼出し元を修正して再検証。
  - id: TS-003
    target_item: AG-003
    verification: |
      各 command の完了報告に capture 本文が含まれず、保存した capture 成果物のパス・分類・保存結果のみが含まれることを確認する。
      各 command-local Template の `Capture結果` 小節が上記構造であること。
    pass_criteria: |
      全4 command の完了報告テンプレートに capture 本文を含まず、パス・分類・保存結果のみを含む `Capture結果` 小節が存在すること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。テンプレートの構造を修正して再検証。
  - id: TS-004
    target_item: AG-004
    verification: |
      case-run が PR Findings 経由を維持し、case-close の入力源が PR 本文のみであることを確認する。
      REQ-006 および capture-boundaries.md で case-run/case-close の現行契約が維持されていること。
    pass_criteria: |
      case-run の capture 入力が PR Findings のみ、case-close の入力源が PR 本文のみ（+ 自工程 deviation）と記載されていること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-005
    target_item: AG-005
    verification: |
      case-auto が capture 本文を再分類・再保存しないことを確認する。
      REQ-006 で case-auto の capture 集計責務が「保存結果参照と件数のみ」と記載されていること。
    pass_criteria: |
      case-auto の責務記述に capture 本文の再分類・再保存が含まれず、各工程の保存結果参照と件数集計のみであること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-006
    target_item: AG-006
    verification: |
      Epic Issue の単一書き手制約が維持されていることを確認する。
      case-auto 自身は Epic Issue を更新せず、case-close 経由であることが REQ-006 と epic-wave-model.md で記載されていること。
    pass_criteria: |
      case-auto の責務記述に Epic Issue 更新が含まれず、case-close が per-Epic 単一書き手として維持されていること。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-007
    target_item: AG-007
    verification: |
      完了報告の所有権分割が反映されていることを確認する。
      artifact-contracts.md に `Capture結果` 小節の共通意味契約（パス・分類・保存結果）が記載され、
      各 command-local Template に具体的表示構造が記載されていること。
      新規トップレベルフィールドが追加されていないこと。
    pass_criteria: |
      artifact-contracts.md の `Capture結果` 共通意味契約 + 各 command-local Template の表示構造が存在し、
      トップレンドフィールドが増えていないこと。
    on_failure: |
      fix-and-reverify（実装不良の場合）。
  - id: TS-008
    target_item: AG-008
    verification: |
      新規 ADR が作成されていないことを確認する。
      docs/adr/ への新規 ADR-NNN ファイルが存在しないこと。
      agentdev-architecture-advisory 助言記録が本ドラフトの conflict_resolutions（CR-004）に残っていること。
    pass_criteria: |
      新規 ADR ファイルが存在せず、advisory 助言実施記録が draft に残っていること。
    on_failure: |
      record-in-findings（万が一 ADR が作成された場合は設計判断変更のため、Findings へ out-of-scope として記録）。

review_dispositions:
  - id: RD-001
    source_ru: RU-0009
    source_item: RU-0009-Sources-capture-scope
    disposition: covered
    reason_code: fully_integrated
    reason: |
      RU-0009 の Source Summary が指摘する「工程横断 capture 境界未整備」は AG-001〜AG-008 で完全に統合された。
      各工程分散型、Command→Skill 委譲、完了報告所有権分割、case-run/case-auto 現行維持を全て反映。
    evidence:
      path: .agentdev/backlog/req-units/RU-0009.md
      section: Source Summary
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition: |
    scale: large（REQ-006 修正 + 8 SPEC 同期更新）のため Epic 構成を推奨。
    Wave 構成案:
    - Wave 1: OU-001（REQ-006 update）, OU-002（capture-boundaries.md）
    - Wave 2: OU-003〜OU-006（4 command SPEC 並列）, OU-007（artifact-contracts.md）, OU-008/OU-009（2 skill SPEC 並列）
    各 OU は単一 Issue として扱うことを想定（issue_policy: single）。
  wave_hints:
    - wave: 1
      units: [OU-001, OU-002]
      rationale: REQ-006 と capture-boundaries.md が前提知識を提供するため先頭 Wave。
    - wave: 2
      units: [OU-003, OU-004, OU-005, OU-006, OU-007, OU-008, OU-009]
      rationale: Wave 1 完了後に並列実行可能。
```

# summary

本ドラフトは RU-0009（capture 境界スコープ拡張）を処理する要件定義である。AgentDevFlow 本体の改善（agentdev_handoff: true）。

deep-review 5レーン検証で確定した設計判断2（各工程分散型・Command→Skill 委譲・完了報告所有権分割・ADR不要 advisory必要）を全面的に反映。

主要な変更対象は REQ-006 と8つの SPEC（capture-boundaries.md, req-save.md, spec-save.md, case-open.md, case-close.md, artifact-contracts.md, agentdev-learning-capture.md, agentdev-intake-pipeline.md）。scale: large、Epic 構成を推奨。

後続コマンドは req-save（REQ-006 update + ADR null）→ spec-save（8 SPEC 同期更新）→ case-open（Epic 構成）を想定。
