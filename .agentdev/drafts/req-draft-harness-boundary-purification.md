---
draft_type: req_draft
topic_slug: harness-boundary-purification
status: saved
created_at: 2026-07-12T13:30:00+09:00
source_rus: [RU-0001]
agentdev_handoff: true
spec_actions_consumed: true
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  AgentDevFlow 配布 command/skill および docs/ から harness 固有の実行制御（エージェント型名、harness 名、task() 引数仕様、CLI 起動形式、timeout、並列度、再試行、context 管理、ハーネス起動失敗の解析・救済、runtime workspace の lifecycle）を除去し、業務ワークフロー契約（進行条件、停止条件、永続成果物、Quality Gate、実行結果契約）のみを所有する。実行結果契約に委譲起動不能（delegation-unavailable）を4番目の状態として追加し、実行失敗（failed）と区別する。全 docs から .sisyphus/ への言及を除去する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations:
    - "配布 command/skill 本文（src/opencode/**）の編集は case-run で実行する。req-define は編集内容を要件として定義し、src/opencode/** は読まない"
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      AgentDevFlow 配布物（command/skill/docs）は、工程の進行条件、停止条件、永続成果物（REQ/ADR/SPEC/Issue/PR/`.agentdev/`）、Quality Gate、実行結果契約のみを所有する。
      実行エージェント選定、起動方法、実行制御パラメータ（timeout、並列度、再試行、context 管理、ハーネス起動失敗の解析・救済を含む）は harness の責務としてプロジェクトルート（`AGENTS.md`、`references/<harness>.md`）に配置し、配布 command/skill の本文から分離する。
      runtime workspace（`.sisyphus/`、`.omo/`、ledger、実行計画、session state 等）の構造、lifecycle、cleanup は管理対象外であり、配布 docs は runtime workspace ディレクトリへの言及を含まない。
  - id: AG-002
    content: |
      case-run/case-auto の実行結果契約は `completed-pr`（PR 作成済み）、`blocked`（回答可能な blocker）、`failed`（実行失敗）、`delegation-unavailable`（委譲起動不能）の4状態を区別する。
      `failed` は実装を試行した結果の領域レベル失敗を表し、`delegation-unavailable` は実行インフラが委譲を起動できなかった状態を表す。両者は異なる回復アクション（再実装とインフラ修正）を要するため独立の結果状態として扱う。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:harness-boundary-purification
    source_items: [AG-001, AG-002]
    content: |
      ## 目的

      AgentDevFlow 配布物が所有する業務ワークフロー契約と、harness が所有する実行制御の責務境界を確立する。配布物は harness 非依存とし、異なる harness を選択するプロジェクトが同一の配布物を使用できる構成とする。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-0162-001 | 配布 command/skill は、工程の進行条件、停止条件、永続成果物（REQ/ADR/SPEC/Issue/PR/`.agentdev/`）、Quality Gate、実行結果契約のみを記述すること |
      | REQ-0162-002 | 実行エージェント選定、起動方法、実行制御パラメータ（timeout、並列度、再試行、context 管理、ハーネス起動失敗の解析・救済を含む）は harness の責務としてプロジェクトルート（`AGENTS.md`、`references/<harness>.md`）に配置し、配布 command/skill の本文から分離すること |
      | REQ-0162-003 | case-run/case-auto の実行結果契約は `completed-pr`（PR 作成済み）、`blocked`（回答可能な blocker）、`failed`（実行失敗）、`delegation-unavailable`（委譲起動不能）の4状態を区別すること |
      | REQ-0162-004 | `failed`（実装試行後の領域レベル失敗）と `delegation-unavailable`（実行インフラ起動不能）は異なる回復アクションを要する独立の結果状態として扱うこと |
      | REQ-0162-005 | 配布 docs（REQ/ADR/SPEC/guides/README/DOC-MAP）は runtime workspace ディレクトリ（`.sisyphus/` 等）への言及を含まないこと |

      ## 適用範囲

      - **対象**: 全配布 command（`src/opencode/commands/agentdev/*.md`）、全配布 skill（`src/opencode/skills/agentdev-*/SKILL.md` および `references/*.md`）、`docs/` 配下の REQ/ADR/SPEC/guides/README/DOC-MAP
      - **対象外**: プロジェクトルート `AGENTS.md`、`references/<harness>.md`、repo-local 成果物（`/repo/*`）、`docs/requirements/retired/` 配下の廃止済み文書

      ## 関連情報

      - **関連 REQ**: REQ-0139（外部エージェント統合契約）、REQ-0119（責務分界）、REQ-0146（実行契約・委譲・プロセス設計）、REQ-0130（case-run）、REQ-0114（case-auto）、REQ-0151（コンフリクト解消）
      - **関連 ADR**: ADR-0136（配布物の harness 実行制御分離）、ADR-0114（外部実行委譲）、ADR-0128（task() 実行委譲）

  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: REQ-0139
    source_items: [AG-001, AG-002]
    content: |
      REQ-0139（外部エージェント統合契約）の更新:

      - REQ-0139-008: `completed(pr)/blocked/failed` → `completed-pr/blocked/failed/delegation-unavailable` の4状態に更新
      - REQ-0139-011: 削除（「デフォルトハーネスとして oh-my-openagent を推奨すること」— harness 固有の推奨は配布 REQ から除外）
      - REQ-0139-012: 削除（「oh-my-openagent 利用時の...references/oh-my-openagent.md に記載すること」— harness 固有ファイル指定は除外）
      - REQ-0139-013: 修正。「case-run は task() により実行担当サブエージェントへ実装作業を委譲すること。CLI subprocess は使用しないこと。」→「case-run は実行担当サブエージェントへ実装作業を委譲し、実行結果（REQ-0162-003 の4状態）を case-run に返すこと。委譲手段、起動方法、実行制御パラメータは harness の責務として AGENTS.md および references/<harness>.md に配置する」
      - REQ-0139-010: 維持（「抽象インターフェースではハーネス非依存」— 既に harness-neutral 原則を宣言）
      - 適用範囲の対象から task() 委譲契約詳細を SPEC 配置とする記述を維持しつつ、AGENTS.md references/<harness>.md を追加

  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: REQ-0146
    source_items: [AG-001]
    content: |
      REQ-0146（実行契約・委譲・プロセス設計）の更新:

      - REQ-0146-001: 削除（「references/oh-my-openagent.md の起動スクリプト例は prompt 位置引数形式を使用する」— harness 固有の起動形式指定）
      - REQ-0146-002: 削除（「references/oh-my-openagent.md の委譲プロンプト雛形は...テンプレートを含む」— harness 固有ファイル参照。雛形形式の要件自体は SPEC delegation-contracts.md に残置可能）
      - REQ-0146-007: 維持（実行主体分類表のREQ行自体は維持。SPEC delegation-contracts.md の分類表例から oh-my-openagent 具体名を削除）
      - 適用範囲の対象から references/oh-my-openagent.md を削除

  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: REQ-0130
    source_items: [AG-001, AG-002]
    content: |
      REQ-0130（case-run）の更新:

      - task() 起動指定、Sisyphus-Junior 具体名、`/ulw-loop` command 指定を含む要件行（-016, -017, -026, -028〜030 該当箇所）を抽象的な実行担当記述に置換
      - REQ-0130-016/017: task() による委譲指定を「実行担当サブエージェントへの委譲」に抽象化
      - REQ-0130-026: 「task() で Sisyphus-Junior に並列委譲する（最大5件）」を「実行担当サブエージェントに並列委譲する（最大5件）」に抽象化
      - result contract 関連要件行に delegation-unavailable を追加

  - id: ACT-REQ-005
    artifact: req
    operation: update
    target: REQ-0114
    source_items: [AG-001, AG-002]
    content: |
      REQ-0114（case-auto）の更新:

      - task() 委譲引数仕様、フォールバック実行の具体的実行方法（インライン実行 fallback 等）を含む要件行（-006/007, -084〜099 該当箇所）を抽象化
      - REQ-0114-006/007: task() 委譲とフォールバックを「実行担当サブエージェントへの委譲」と「委譲起動不能時の扱いは delegation-unavailable 状態として報告」に抽象化
      - フォールバック例外としてのインライン実行は harness 固有の実行制御であり配布 REQ から除去

  - id: ACT-REQ-006
    artifact: req
    operation: update
    target: REQ-0151
    source_items: [AG-001]
    content: |
      REQ-0151（コンフリクト解消モデルと実行時間観測）の更新:

      - 再委譲の具体的実行方法（task() 再起動、Sisyphus-Junior 指定等）を含む要件行（-003〜009 該当箇所）を抽象的な実行担当再委譲記述に置換
      - コンフリクト解消の3レベルモデル自体は維持（Level 1/2/3 の意味的定義は harness 非依存）

  - id: ACT-REQ-007
    artifact: req
    operation: update
    target: REQ-0101
    source_items: [AG-001]
    content: |
      REQ-0101（文書・REQ管理基準）の更新:

      - REQ-0101-015: 削除（「`.sisyphus/` 配下の成果物は実行時作業領域として扱い、現行REQ体系の管理対象外とすること」— runtime workspace への言及を除去）
      - REQ-0101-023: `.sisyphus/` 記述を含む場合削除/修正
      - REQ-0101-030: `.sisyphus/` 記述を含む場合削除/修正
      - 適用範囲（行86付近）から `.sisyphus/` に関する対象外記述を削除

  - id: ACT-REQ-008
    artifact: req
    operation: update
    target: REQ-0104
    source_items: [AG-001]
    content: |
      REQ-0104（Workflow / Command Protocol）の更新:

      - REQ-0104-013: 削除（`.sisyphus/` に関する要件行）

  - id: ACT-REQ-009
    artifact: req
    operation: update
    target: REQ-0112
    source_items: [AG-001]
    content: |
      REQ-0112（ADRライフサイクル標準化・文書体系正規化・実行時独立性）の更新:

      - REQ-0112-025: 削除（`.sisyphus/` の .gitignore 記述に関する要件行）

  - id: ACT-REQ-010
    artifact: req
    operation: update
    target: REQ-0135
    source_items: [AG-001]
    content: |
      REQ-0135（Drafts配置・Draft Type Registry）の更新:

      - REQ-0103-128 参照箇所（行18付近）から `.sisyphus/` 記述を削除

  - id: ACT-REQ-011
    artifact: req
    operation: update
    target: REQ-0103
    source_items: [AG-001]
    content: |
      REQ-0103（Artifact責任分界）の更新:

      - 適用範囲（行109付近）から `.sisyphus/` に関する対象外記述を削除

  - id: ACT-ADR-001
    artifact: adr
    operation: create
    target: new:harness-boundary-purification
    source_items: [AG-001, AG-002]
    content: |
      タイトル: 配布物の harness 実行制御分離

      ステータス: accepted

      ## コンテキスト

      AgentDevFlow 配布 command/skill は、業務ワークフロー契約と harness 固有の実行制御（エージェント型名、`task()` 引数仕様、timeout、並列度等）を混在させていた。REQ-0139-010 で「抽象インターフェースではハーネス非依存」を宣言しつつ、REQ-0139-011 で oh-my-openagent 推奨、REQ-0139-013 で `task()` 指定を行う等、内部矛盾が存在した。実行結果契約は3状態（completed-pr/blocked/failed）であり、委譲起動不能は「フォールバック例外」として harness 固有の実行制御に埋め込まれていた。

      ## 決定

      配布 command/skill/docs は業務ワークフロー契約（進行条件、停止条件、永続成果物、Quality Gate、実行結果契約）のみを記述し、実行エージェント選定、起動方法、実行制御パラメータは harness の責務としてプロジェクトルート（`AGENTS.md`、`references/<harness>.md`）に配置する。実行結果契約に委譲起動不能（`delegation-unavailable`）を4番目の状態として追加し、領域レベル失敗（`failed`）と区別する。

      ## 結果

      - 配布物が harness 非依存となり、異なる harness を選択するプロジェクトが同一の配布物を使用できる
      - 既存 ADR-0114（外部実行委譲）、ADR-0128（task() 実行委譲）の位置づけが「特定 harness の実装記録」として明確化される。これらの ADR は現行実装の記録として残置し、配布 REQ/SPEC からの具体名除去は本 ADR の決定に従う
      - 既存 SPEC/REQ から `oh-my-openagent`、`Sisyphus-Junior`、`task()` 等の具体名が除去され、抽象的な実行担当記述に置換される
      - 委譲起動不能が独立した結果状態となることで、case-run/case-auto が領域レベル失敗とインフラレベル起動不能を区別してルーティング判定できる

      ## 代替案

      - harness 抽象化レイヤの導入: 配布物に抽象 harness IF を定義し、各 harness が実装する方式。配布物の複雑化と IF 維持コストが高く、却下した
      - `task()` を OpenCode 標準として配布物に残す方式: 異なる harness が異なる起動方式を持つ可能性を考慮し、配布物から除去する

  - id: ACT-ADR-002
    artifact: adr
    operation: update
    target: ADR-0101
    source_items: [AG-001]
    content: |
      ADR-0101 の更新:

      - 行31, 37, 44, 57 付近の `.sisyphus/` 記述を削除/修正

  - id: ACT-SPEC-001
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: workflows
      slug: delegation-contracts
    target_area: "委譲種別、実行主体分類表、結果状態"
    source_items: [AG-001, AG-002]
    content: |
      delegation-contracts.md の更新:

      - 実行主体分類表（行168付近）: `harness` 行の例から `oh-my-openagent（ADR-0114 / ADR-0128）` を削除し、「外部実行基盤（AGENTS.md で選定）」に修正
      - `step_execution` delegation_type（行75付近）: `task()` 起動、ADR-0127 の直接参照を抽象化。「実行担当サブエージェントの起動」とし、起動手段は AGENTS.md 参照に
      - フォールバック時の Sisyphus-Junior 記述（行77付近）: 具体エージェント名を削除し、「実行担当サブエージェントへの委譲起点の折りたたみ」と抽象化
      - 結果状態に `delegation-unavailable` を追加し、`failed` との区別を明記

  - id: ACT-SPEC-002
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: workflows
      slug: epic-wave-model
    target_area: "子Issue 実行状態 enum、case-run Epic Wave 実行モデル、結果状態遷移と出力契約"
    source_items: [AG-001, AG-002]
    content: |
      epic-wave-model.md の更新:

      - 子Issue 実行状態 enum（行63-77）: `delegation-unavailable` を追加。定義:「実行インフラが委譲を起動できなかった状態。実行が試行されておらず、インフラ修正後に再実行可能」。設定主体: case-run
      - case-run Epic Wave 実行モデル（行149）: `task() で Sisyphus-Junior に並列委譲する（最大5件...委譲 prompt 内で /ulw-loop command を指定）`を`実行担当サブエージェントに並列委譲する（最大5件、各委譲は1 Issue 処理）`に抽象化
      - 結果状態遷移と出力契約テーブル（行182-186）: `delegation-unavailable` 行を追加。Issue status 遷移: `running` → `pending`（実行未試行のため failed にしない）。case-auto アクション: 停止理由を報告し、インフラ修正または harness 再設定を提示

  - id: ACT-SPEC-003
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: foundations
      slug: document-model
    target_area: ".sisyphus/ 関連行"
    source_items: [AG-001]
    content: |
      document-model.md の更新:

      - 行197付近の `.sisyphus/` 記述を削除

  - id: ACT-SPEC-004
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: foundations
      slug: patterns
    target_area: ".sisyphus/ 命名規則セクション"
    source_items: [AG-001]
    content: |
      patterns.md の更新:

      - 行44-46付近の `.sisyphus/` 命名規則セクションを削除

  - id: ACT-SPEC-005
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: case-run
    target_area: "task()/Sisyphus-Junior 具体名、.sisyphus/ 記述"
    source_items: [AG-001, AG-002]
    content: |
      case-run SPEC（docs/specs/commands/case-run.md）の更新:

      - 行105付近の `.sisyphus/` 記述を削除
      - `task()` 起動仕様、Sisyphus-Junior 具体名、`/ulw-loop` command 指定を抽象的な実行担当記述に置換
      - 結果状態に `delegation-unavailable` を追加

  - id: ACT-SPEC-006
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: commands
      slug: case-auto
    target_area: "task()/Sisyphus-Junior 具体名、フォールバック実行記述"
    source_items: [AG-001, AG-002]
    content: |
      case-auto SPEC（docs/specs/commands/case-auto.md）の更新:

      - `task()` 委譲引数仕様、Sisyphus-Junior 具体名を抽象的な実行担当記述に置換
      - フォールバック実行（インライン実行）の具体的実行方法を抽象化し、`delegation-unavailable` 状態として報告する方針に変更

  - id: ACT-SPEC-007
    artifact: spec
    operation: update
    target_spec:
      operation: update
      domain: responsibilities
      slug: document-type-responsibilities
    target_area: "実行主体分類の査読基準"
    source_items: [AG-001]
    content: |
      document-type-responsibilities.md の更新:

      - 実行主体分類表（行65付近）: `harness` 行の例から `oh-my-openagent 等` を削除し、「外部実行基盤（AGENTS.md で選定）」に修正

conflict_resolutions:
  - id: CR-001
    conflict: 委譲起動不能を failed に統合するか、独立した4番目の状態とするか
    resolution: |
      独立した4番目の状態（delegation-unavailable）とする。
      根拠: failed は epic-wave-model.md L72 で「実装、検証、CI、PR 作成などの実行結果として失敗」と定義される領域レベル失敗であり、実装が試行された後の結果である。委譲起動不能は実行インフラが委譲を起動できなかった状態であり、実装が試行されていない。両者は異なる回復アクション（再実装 vs インフラ修正・harness 再設定）を要し、case-auto のルーティング判定（Issue を failed 扱いするか pending 扱いするか）が異なる。現在のフォールバック例外（REQ-0114-006/098）は harness 固有の実行制御であり配布物から除去する。
  - id: CR-002
    conflict: .sisyphus/ 除去を要件とするか、反映作業とするか
    resolution: |
      反映作業とする。AG-001 が AgentDevFlow の所有範囲を積極的に定義し、runtime workspace はその範囲外である。既存 REQ/ADR/SPEC/guides の .sisyphus/ 記述除去は AG-001 への整合作業であり、独立した要件行を生成しない。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_req: REQ-0162
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0001
    target_req: REQ-0139
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: epic
    result: {}
  - ou_id: OU-003
    source_ru: RU-0001
    target_req: REQ-0146
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: epic
    result: {}
  - ou_id: OU-004
    source_ru: RU-0001
    target_req: REQ-0130
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: epic
    result: {}
  - ou_id: OU-005
    source_ru: RU-0001
    target_req: REQ-0114
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: epic
    result: {}
  - ou_id: OU-006
    source_ru: RU-0001
    target_req: REQ-0151
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 3
    issue_policy: epic
    result: {}
  - ou_id: OU-007
    source_ru: RU-0001
    target_req: REQ-0101
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: epic
    result: {}
  - ou_id: OU-008
    source_ru: RU-0001
    target_req: REQ-0104
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: epic
    result: {}
  - ou_id: OU-009
    source_ru: RU-0001
    target_req: REQ-0112
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: epic
    result: {}
  - ou_id: OU-010
    source_ru: RU-0001
    target_req: REQ-0135
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: epic
    result: {}
  - ou_id: OU-011
    source_ru: RU-0001
    target_req: REQ-0103
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: epic
    result: {}
  - ou_id: OU-012
    source_ru: RU-0001
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-013
    source_ru: RU-0001
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: epic
    result: {}
  - ou_id: OU-014
    source_ru: RU-0001
    target_spec:
      operation: update
      domain: workflows
      slug: delegation-contracts
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: epic
    result: {}
  - ou_id: OU-015
    source_ru: RU-0001
    target_spec:
      operation: update
      domain: workflows
      slug: epic-wave-model
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: epic
    result: {}
  - ou_id: OU-016
    source_ru: RU-0001
    target_spec:
      operation: update
      domain: foundations
      slug: document-model
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: epic
    result: {}
  - ou_id: OU-017
    source_ru: RU-0001
    target_spec:
      operation: update
      domain: foundations
      slug: patterns
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 4
    issue_policy: epic
    result: {}
  - ou_id: OU-018
    source_ru: RU-0001
    target_spec:
      operation: update
      domain: commands
      slug: case-run
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: epic
    result: {}
  - ou_id: OU-019
    source_ru: RU-0001
    target_spec:
      operation: update
      domain: commands
      slug: case-auto
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: epic
    result: {}
  - ou_id: OU-020
    source_ru: RU-0001
    target_spec:
      operation: update
      domain: responsibilities
      slug: document-type-responsibilities
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 5
    issue_policy: epic
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      src/opencode/commands/agentdev/*.md、src/opencode/skills/agentdev-*/SKILL.md、src/opencode/skills/agentdev-*/references/*.md、docs/requirements/REQ-*.md、docs/specs/**/*.md で以下を grep する（retired/ は除外）:
      - `oh-my-openagent`
      - `Sisyphus-Junior`
      - `task(subagent_type`
      - `/ulw-loop`
      - `task()`（委譲起動の文脈での使用）
    pass_criteria: |
      上記 grep 結果が0件であること。配布対象文書に harness 固有の実行制御記述が含まれないこと。
    on_failure: |
      fix-and-reverify。該当箇所を抽象的な実行担当記述に修正して再検証する。
  - id: TS-002
    target_item: AG-001
    verification: |
      docs/ 配下の全ファイルおよび .agentdev/README.md で `.sisyphus` を grep する（retired/ は除外）。
    pass_criteria: |
      grep 結果が0件であること。配布 docs に runtime workspace ディレクトリへの言及が含まれないこと。
    on_failure: |
      fix-and-reverify。.sisyphus/ 参照を削除して再検証する。
  - id: TS-003
    target_item: AG-002
    verification: |
      docs/specs/workflows/epic-wave-model.md の子Issue 実行状態 enum テーブルと結果状態遷移テーブル、docs/specs/workflows/delegation-contracts.md の結果状態記述を確認する。
    pass_criteria: |
      delegation-unavailable が completed-pr/blocked/failed と並列で4状態として定義されていること。
    on_failure: |
      fix-and-reverify。delegation-unavailable の定義を追加して再検証する。
  - id: TS-004
    target_item: AG-002
    verification: |
      docs/specs/workflows/epic-wave-model.md で delegation-unavailable と failed の定義文を確認する。
    pass_criteria: |
      delegation-unavailable が「実行インフラス起動不能」として定義され、failed（実装試行後の領域レベル失敗）と意味的に区別されていること。
    on_failure: |
      fix-and-reverify。定義文を修正して再検証する。

case_open_hints:
  epic_needed: true
  decomposition:
    - wave: 1
      items: [OU-001, OU-012]
      rationale: "新規 REQ/ADR 作成（基盤）。後続 Wave の前提となる"
    - wave: 2
      items: [OU-002, OU-003, OU-004, OU-005, OU-006]
      rationale: "harness 固有記述を含む REQ の更新。OU-001 の原則に従う"
    - wave: 3
      items: [OU-007, OU-008, OU-009, OU-010, OU-011, OU-013, OU-016, OU-017]
      rationale: ".sisyphus/ 除去および独立した SPEC/ADR 更新。前提依存なし"
    - wave: 4
      items: [OU-014, OU-015, OU-018, OU-019, OU-020]
      rationale: "委譲契約・実行モデル SPEC の更新。Wave 2 の REQ 更新に対応"
  wave_hints:
    - "Wave 1 は新規 REQ-0162 と ADR-0136 の作成。他 Wave の前提"
    - "Wave 2 と Wave 3 は並列実行可能（依存関係なし）"
    - "Wave 4 は Wave 2 完了後に実行（SPEC が REQ 変更に対応するため）"
  additional_notes: |
    guides/ 配下のファイル（consumer-project-setup.md、artifacts-and-state.md）、DOC-MAP.md、requirements/README.md、.agentdev/README.md からも .sisyphus/ 記述を削除すること。これらは artifact_actions 対象外（REQ/ADR/SPEC 以外）だが、AG-001 の整合作業として case-run で実行する。
```

# summary

AgentDevFlow 配布物から harness 固有の実行制御を除去し、業務ワークフロー契約のみを所有する境界を確立する。実行結果契約に委譲起動不能（delegation-unavailable）を4番目の状態として追加する。全 docs から .sisyphus/ への言及を除去する。

新規 REQ-0162（配布物の harness 実行制御分離）と新規 ADR-0136 を作成し、既存 REQ 7件（0139, 0146, 0130, 0114, 0151, 0101, 0104, 0112, 0135, 0103）、既存 ADR 1件（0101）、既存 SPEC 7件を更新する。
