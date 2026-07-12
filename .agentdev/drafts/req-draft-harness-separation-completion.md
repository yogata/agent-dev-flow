---
draft_type: req_draft
topic_slug: harness-separation-completion
status: draft
created_at: 2026-07-12T00:00:00+09:00
source_rus: []
---

<!-- 本 draft はセッションコンテキスト由来（ユーザーとの壁打ちによる要件定義）。ADR-0136 適用完了と設計原則明文化を主題とする。 -->

# draft-data

```yaml
work_type: maintenance

summary: |
  ADR-0136「配布物ハーネス境界浄化」の完全適用。配布物から omo 固有名詞（oracle, momus,
  Sisyphus, Sisyphus-Junior, explore, oh-my-openagent）を抽象化し、業務ワークフロー契約と
  実行制御を分離。大多数を harness 非依存とし、harness 依存の具体を各 skill の
  references/<topic>.md へ集約する設計原則を REQ-0162 へ要件化し、新設 SPEC
  (harness-separation-model.md) で詳細化する。agentdev-architecture-advisory skill は
  case-run-execution-adapter と同じ分離モデル（SKILL.md 残存 + references/ 分離）へ整理し、
  廃止しない。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      REQ-0162-002 を強化し、配布物の大多数（SKILL.md 本体、command .md 本体、docs）は業務
      ワークフロー契約のみで完結し、実行制御の具体は各 skill の references/<topic>.md へ集約
      して利用時に必要に応じて読み込む、という分離モデルを明記する。case-run-execution-adapter
      を参照実装とする。
  - id: AG-002
    content: |
      REQ-0162-005 を肯定形へ書き直す。「含まないこと」から「業務ワークフロー契約のみを記述
      し、runtime workspace 管理は harness 側の責務とすること」へ。
  - id: AG-003
    content: |
      REQ-0139-003 を抽象化する。「oracle は助言のみを返し...」から「アーキテクチャ助言
      サブエージェントは助言のみを返し...」へ。
  - id: AG-004
    content: |
      REQ-0139-014 を抽象化する。「oracle 分類結果にブロッカーが含まれる場合...」から
      「アーキテクチャ助言サブエージェントの分類結果にブロッカーが含まれる場合...」へ。
  - id: AG-005
    content: |
      REQ-0139 目的欄を抽象化する。「外部エージェント（oracle, momus）」から「外部エージェント
      （アーキテクチャ助言、実行計画確認）」へ。適用範囲欄の「oracle 助言」も「アーキテクチャ
      助言」へ。
  - id: AG-006
    content: |
      REQ-0102-073 を抽象化する。「oracle 相談の入力...oracle 出力を 4 ラベル構造...」から
      「アーキテクチャ助言サブエージェントへの相談入力...助言サブエージェントの出力を 4 ラベル
      構造...」へ。
  - id: AG-007
    content: |
      REQ-0137 の oracle 言及（事前調査欄「oracle 検証済み」、Update Notes「req-define +
      oracle 検証ベース」）を抽象化する。「外部アーキテクチャ助言エージェント検証済み」へ。
  - id: AG-008
    content: |
      新設 SPEC docs/specs/foundations/harness-separation-model.md を配置する。harness 分離
      モデルの基盤 SPEC として、配布物の大多数は harness 非依存、依存は references/ 集約、
      case-run-execution-adapter を参照実装とする原則を明文化する。
  - id: AG-009
    content: |
      agentdev-architecture-advisory skill を抽象化する。SKILL.md 本体から oracle 固有名詞を
      除去し「サブエージェントへのアーキテクチャレビュー委譲」として整理。新設
      references/architecture-review-delegation.md にアーキテクチャ助言サブエージェントの
      具体的起動方法、相談プロトコル具体を集約する。SKILL.md は AGENTS.md 参照を明記。
  - id: AG-010
    content: |
      agentdev-req-analysis skill を抽象化する。SKILL.md 本体と
      references/explore-scope-refinement.md から explore 固有名詞を除去し「サブエージェント
      への調査委譲」として整理。priority_targets 構造等の調査スコープ絞り込みプロトコルは
      抽象化して維持する。
  - id: AG-011
    content: |
      src/opencode/commands/agentdev/req-define.md を抽象化する。Step 5-4「ADR要否確認
      ゲート」の「oracle に確認する」を「アーキテクチャ助言サブエージェントへ委譲する」へ。
      G16/G17/G18 ガードレールの oracle を抽象化。
  - id: AG-012
    content: |
      docs/specs/foundations/system.md の agent 割当表（sisyphus/prometheus 9件）を完全削除
      する。agent 割当は harness 側の AGENTS.md で記述する。SPEC はコマンドの目的・責務のみ
      を記述し、agent 割当を非述とする。
  - id: AG-013
    content: |
      README.md および各 command .md 末尾の .sisyphus/ 言及（gitignore 推奨設定）を完全削除
      する。runtime workspace 管理は harness 側の責務。
  - id: AG-014
    content: |
      ADR-0136/0128/0114 本文の oh-my-openagent, Sisyphus-Junior を抽象名（「特定 harness」
      等）へ置換する。task() は OpenCode 標準表記として許容し残置する。判断経緯の正確さを
      担保するため、検討対象名詞は抽象名で保持する。
  - id: AG-015
    content: |
      docs/specs/commands/req-define.md の oracle 言及（Step 5-4、対象外 G18、See Also、
      REQ-0139 参照）を抽象化する。同 SPEC の explore 言及（Step 5-1 REQ-0102-072）も抽象化。
  - id: AG-016
    content: |
      docs/specs/skills/agentdev-architecture-advisory.md の oracle 言及（目的欄、適用対象、
      現在の動作、検証観点）および momus 言及（対象外欄）を抽象化する。
  - id: AG-017
    content: |
      src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md の非対象テーブル
      「agentdev-architecture-advisory（oracle）」から oracle を除去する。
  - id: AG-018
    content: |
      docs/specs/skills/agentdev-req-analysis.md の explore 言及を抽象化する（SKILL.md と
      同様）。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: update
    target: docs/requirements/REQ-0162.md
    source_items: [AG-001, AG-002]
    content: |
      REQ-0162-002（修正後全文）:
      実行エージェント選定、起動方法、実行制御パラメータ（timeout、並列度、再試行、context
      管理、ハーネス起動失敗の解析・救済を含む）は harness の責務としてプロジェクトルート
      （`AGENTS.md`、`references/<harness>.md`）に配置し、配布 command/skill の本文から分離
      すること。配布物の大多数（SKILL.md 本体、command .md 本体、docs）は業務ワークフロー契約
      のみで完結し、実行制御の具体は各 skill の `references/<topic>.md` へ集約して、利用時に
      必要に応じて読み込むこと（case-run-execution-adapter を参照実装とする）。

      REQ-0162-005（修正後全文）:
      配布 docs（REQ/ADR/SPEC/guides/README/DOC-MAP）は業務ワークフロー契約のみを記述し、
      runtime workspace ディレクトリ（`.sisyphus/` 等）の管理は harness 側の責務として
      取り扱うこと。

  - id: ACT-REQ-002
    artifact: req
    operation: update
    target: docs/requirements/REQ-0139.md
    source_items: [AG-003, AG-004, AG-005]
    content: |
      目的欄（修正後全文）:
      AgentDevFlowのワークフローに、OpenCodeプラグインとして別途導入される外部エージェント
      （アーキテクチャ助言、実行計画確認）を組み込む。
      AgentDevFlow側は外部エージェントの実装を同梱せず、どの工程で、どの責務範囲で利用するかの
      ワークフロー契約のみを定義する。
      case-run の外部実行ハーネス選定は抽象インターフェースでは非依存とし、プロジェクトルート
      AGENTS.md で具体ハーネスを選定する。

      REQ-0139-003（修正後全文）:
      アーキテクチャ助言サブエージェントは助言のみを返し、draft、REQ、ADR、SPEC、Issue、PRを
      直接更新しないこと。最終判断は親エージェントが保持すること。

      REQ-0139-014（修正後全文）:
      アーキテクチャ助言サブエージェントの分類結果にブロッカーが含まれる場合、または未決事項が
      解消されず残る場合、req-define は要件doc生成へ進まず壁打ちへ差し戻すこと。

      適用範囲欄（修正後全文）:
      - **対象**: req-define（アーキテクチャ助言、分類結果アクション）, case-run（ハーネス実行
      計画確認、実行担当サブエージェント）, 外部エージェント出力のSSoT境界, AGENTS.md
      ハーネス選定機構, 委譲契約（実行担当サブエージェントへの委譲）

  - id: ACT-REQ-003
    artifact: req
    operation: update
    target: docs/requirements/REQ-0102.md
    source_items: [AG-006]
    content: |
      REQ-0102-073（修正後全文）:
      req-define はアーキテクチャ助言サブエージェントへの相談入力を
      `agentdev-architecture-advisory` skill が定める標準テンプレートで構築し、助言
      サブエージェントの出力を 4 ラベル構造（確定事項/推定事項/ユーザー確認事項/ブロッカー）
      で要求すること。ラベル構造は soft-contract（ADR-0124）とし厳格スキーマ検証を導入しない
      こと。最終的なラベル分類は親エージェントが行うこと。

  - id: ACT-REQ-004
    artifact: req
    operation: update
    target: docs/requirements/REQ-0137.md
    source_items: [AG-007]
    content: |
      目的欄内の「事前調査（oracle 検証済み）で、以下の構造的欠陥が判明した:」を「事前調査
      （外部アーキテクチャ助言エージェント検証済み）で、以下の構造的欠陥が判明した:」へ修正。

      Update Notes の「2026-06-19 | REQ-0137 | 初版作成（req-define + oracle 検証ベース。
      case-auto 並行実行安全 git 操作規律と消費アーティファクト削除信頼性）」を「2026-06-19 |
      REQ-0137 | 初版作成（req-define + 外部アーキテクチャ助言エージェント検証ベース。
      case-auto 並行実行安全 git 操作規律と消費アーティファクト削除信頼性）」へ修正。

  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-create
    target_spec:
      operation: create
      domain: foundations
      slug: harness-separation-model
    source_items: [AG-001, AG-008]
    content: |
      ---
      title: harness 分離モデル
status: saved
      created: 2026-07-12
      updated: 2026-07-12
      ---

      # harness 分離モデル

      ## 目的

      AgentDevFlow 配布物と harness 実行制御の責務分離モデルを定義する。配布物の大多数を
      harness 非依存とし、harness 依存の具体を限定された場所へ集約する。

      ## 分離原則

      ### 配布物側（業務ワークフロー契約）

      配布物の大多数（SKILL.md 本体、command .md 本体、docs/REQ、docs/ADR、docs/SPEC、
      docs/guides、README、DOC-MAP）は業務ワークフロー契約のみで完結する:

      - 工程の進行条件、停止条件
      - 永続成果物（REQ/ADR/SPEC/Issue/PR/`.agentdev/`）
      - Quality Gate
      - 実行結果契約

      ### harness 側（実行制御）

      実行エージェント選定、起動方法、実行制御パラメータは harness の責務として配置する:

      - プロジェクトルート `AGENTS.md`: harness 選定、エージェント型指定
      - 各 skill の `references/<topic>.md`: skill 固有の実行制御具体（エージェント型名、起動
        方法、timeout、並列度、再試行等）

      ## 参照実装

      `agentdev-case-run-execution-adapter` skill が本モデルの参照実装である:

      - `SKILL.md`: 業務ワークフロー契約（result 4状態契約、test-fix ループ、worktree 隔離、
        Findings 配置等）
      - `references/harness-delegation.md`: harness 固有の実行制御具体

      他 skill も同一モデルへ整理する（agentdev-architecture-advisory は
      references/architecture-review-delegation.md を新設し同モデルへ移行）。

      ## 適用基準

      配布物から harness 固有の記述を分離する基準:

      | 配布物側に残す | harness 側へ分離 |
      |---|---|
      | サブエージェントへの委譲ステップ（業務ワークフロー契約） | サブエージェントの具体名、起動方法 |
      | result 契約、ラベル構造、分類権限 | timeout、並列度、再試行等の実行制御パラメータ |
      | 進行条件、停止条件、永続成果物、QG | ハーネス起動失敗の解析・救済手順 |

      ## 配布 docs の制約

      配布 docs（REQ/ADR/SPEC/guides/README/DOC-MAP）は runtime workspace ディレクトリ
      （`.sisyphus/` 等）の管理を扱わず、業務ワークフロー契約のみを記述する。runtime workspace
      管理は harness 側の責務とする。

      ## 関連

      - REQ-0162（配布物ハーネス境界浄化）
      - ADR-0136（配布物ハーネス境界浄化）

  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/req-define.md
    target_area: "## 現在の動作"
    source_items: [AG-011, AG-015]
    content: |
      ## 現在の動作（oracle/explore 抽象化後）

      - Step 5-1: RU 由来キーワード抽出 + glob/grep 前処理によるサブエージェント調査委譲
        スコープの絞り込み（REQ-0102-072）。絞り込みはサブエージェント調査委譲の調査優先対象
        リストのみに適用（ヒントでありハードフィルタではない）し、実ファイル列挙
        （REQ-0102-002）の完全性は維持する
      - Step 5-4: ADR要否確認ゲート（`agentdev-architecture-advisory` 経由でアーキテクチャ
        助言サブエージェントへ委譲）
      - アーキテクチャ助言サブエージェントへの入力標準テンプレート使用 + 出力 4 ラベル構造要求
        （REQ-0102-073）。ラベル構造は soft-contract（ADR-0124）とし、分類権限は親が保持する

      上記 Step 5-1, 5-4 以外の「現在の動作」セクション記事項は変更なし。

  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/req-define.md
    target_area: "## 対象外"
    source_items: [AG-015]
    content: |
      ## 対象外（G18 抽象化後）

      - 実装コードの作成、編集（G01: 壁打ちフェーズのみ）
      - 関連ドキュメントの個別ファイル列挙をユーザーに求める（G02）
      - `.agentdev/drafts/**` 以外のファイル作成、編集（G03）
      - ユーザー明示入力ファイルの変更、削除、RU 削除（G04）
      - `docs/` 配下の広範な探索（G05。例外: 明示入力ファイル、`docs/requirements/**` 参照、
        Step 5-1 限定探索）
      - `inbox.md` / `deferred.md` 直接ロード（G06）
      - 採用済み成果物の直読み（G07）
      - `git` コマンド実行（G08）
      - Issue 階層決定（G13、case-open 責務）
      - `execution_groups` セクション出力（G14）
      - SPEC 分離基準（REQ-0101-068）該当要件行の REQ 残留（G15、`artifact_actions` へ分離）
      - ADR判断における未確認事項の要件本文混入（G17、REQ-0139-002/004）
      - アーキテクチャ助言サブエージェントによるファイル編集（G18、REQ-0139-003）

  - id: ACT-SPEC-004
    artifact: spec
    operation: spec-update
    target: docs/specs/commands/req-define.md
    target_area: "## See Also"
    source_items: [AG-015]
    content: |
      ## See Also（oracle 抽象化後）

      - [req-save.md](req-save.md)（後続コマンド（REQ/ADR 保存））
      - [spec-save.md](spec-save.md)（後続コマンド（SPEC 保存））
      - [case-open.md](case-open.md)（後続コマンド（Issue 作成））
      - `agentdev-req-analysis` skill（要件分析手法）
      - `agentdev-req-file-manager` skill（REQ ファイル管理、照合）
      - `agentdev-adr-guidelines` skill（ADR 判断基準）
      - `agentdev-architecture-advisory` skill（アーキテクチャ助言サブエージェント連携）
      - `agentdev-workflow-lifecycle` skill（work_type、scale 判定）
      - REQ-0102（要件定義、保存）
      - REQ-0138（構造化 req_draft 契約）
      - REQ-0139（外部エージェント統合契約）
      - ADR-0124（構造化 draft-data 形式）

  - id: ACT-SPEC-005
    artifact: spec
    operation: spec-update
    target: docs/specs/skills/agentdev-architecture-advisory.md
    target_area: "## 目的"
    source_items: [AG-016]
    content: |
      ## 目的（oracle 抽象化後）

      req-define が要件を確定する前にアーキテクチャ上の影響を確認するため、アーキテクチャ助言
      サブエージェント（harness 側で選定）が助言を提供し、最終判断は親エージェントが行う。

  - id: ACT-SPEC-006
    artifact: spec
    operation: spec-update
    target: docs/specs/skills/agentdev-architecture-advisory.md
    target_area: "## 現在の動作"
    source_items: [AG-016]
    content: |
      ## 現在の動作（oracle 抽象化後）

      - アーキテクチャ助言サブエージェントの助言のみを根拠にドラフト本文へ確定事項を混入させない
        （REQ-0139-002/004）
      - 外部助言エージェントが利用できない場合はブロッカーとして報告
      - アーキテクチャ助言サブエージェントはファイル編集主体ではない（REQ-0139-003）
      - 相談入力: 要件候補、既存 REQ/ADR/SPEC の矛盾候補、ADR 候補、SPEC 候補、責務境界変更、
        未解決分岐、具体質問
      - 助言出力: 推奨方向、主要な設計リスク、ADR create/update/unnecessary 判断、SPEC 分離
        候補、矛盾解消提案、根拠参照、確信度

conflict_resolutions:
  - id: CR-001
    conflict: agentdev-architecture-advisory skill の存廃（廃止 vs 残存）
    resolution: |
      case-run-execution-adapter と同じ分離モデル（skill 残存 + references/<topic>.md 分離）
      で存続。廃止案は case-run-execution-adapter の分離モデルと整合しないた不採用。ユーザー
      指摘「极一部に依存を集約」原則に従い、advisory skill の references/ へ依存を集約する。
  - id: CR-002
    conflict: docs/specs/foundations/system.md の agent 割当表の扱い
    resolution: |
      完全削除。agent 割当は harness 側の AGENTS.md で記述する。SPEC はコマンドの目的・責務
      のみを記述する。「きれいに分離」原則に従い、配布 docs から agent 具体名を除去。
  - id: CR-003
    conflict: .sisyphus/ 言及（gitignore 推奨設定）の扱い
    resolution: |
      完全削除。runtime workspace 管理は harness 側の責務。配布 docs は業務ワークフロー契約
      のみを記述する。
  - id: CR-004
    conflict: ADR-0136/0128/0114 本文の omo 固有名詞の扱い
    resolution: |
      oh-my-openagent, Sisyphus-Junior を抽象名（「特定 harness」等）へ置換。task() は
      OpenCode 標準表記として許容。判断経緯の正確さを担保するため、検討対象名詞は抽象名で
      保持する。ユーザー原則「ADR/REQは肯定形で書く」に従い、否定形表記は肯定形へ。
  - id: CR-005
    conflict: design intent（完全削除 vs きれいな分離）
    resolution: |
      ユーザー指摘「omoの全てを完全に削除するのではなく、きれいに分離していることが重要」。
      配布物からの omo 名詞除去は「不存在化」ではなく「適切な分離先（harness 側）への移動」
      を意味する。agentdev-case-run-execution-adapter の references/harness-delegation.md
      分離モデルを参照実装とする。

operation_units:
  - ou_id: OU-001
    target_req: REQ-0162
    target_spec:
      operation: create
      domain: foundations
      slug: harness-separation-model
    operation: update
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    target_req: REQ-0139
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    target_req: REQ-0102
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 3
    issue_policy: single
    result: {}
  - ou_id: OU-004
    target_req: REQ-0137
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 4
    issue_policy: single
    result: {}
  - ou_id: OU-005
    operation: update
    scale: standard
    depends_on: [OU-001, OU-002, OU-003, OU-004]
    recommended_order: 5
    issue_policy: single
    result: {}
    target_spec: docs/specs/commands/req-define.md
  - ou_id: OU-006
    operation: update
    scale: standard
    depends_on: [OU-001]
    recommended_order: 6
    issue_policy: single
    result: {}
    target_spec: docs/specs/skills/agentdev-architecture-advisory.md

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      docs/requirements/REQ-0162.md の REQ-0162-002 を読み、「配布物の大多数... references/<topic>.md へ集約」
      の記述が含まれることを確認する。
    pass_criteria: |
      REQ-0162-002 に references/<topic>.md 集約モデルの記述が含まれ、case-run-execution-adapter
      が参照実装として明記されていること。
    on_failure: |
      fix-and-reverify。REQ-0162-002 へ当該記述を追加して再検証する。要件行として REQ-0162-002
      の本文が正しく更新されているか確認し、誤りがあれば修正する。
  - id: TS-002
    target_item: AG-003
    verification: |
      docs/requirements/REQ-0139.md に対し grep で "oracle" を検索する。同様に REQ-0102.md
      (AG-006)、REQ-0137.md (AG-007) にも grep を実行する。
    pass_criteria: |
      REQ-0139.md, REQ-0102.md, REQ-0137.md のいずれにも "oracle" の文字列が0件であること。
    on_failure: |
      fix-and-reverify。残存 oracle を抽象名へ置換し再検証する。
  - id: TS-003
    target_item: AG-008
    verification: |
      docs/specs/foundations/harness-separation-model.md が存在し、内容に「配布物の大多数は
      harness 非依存」「references/<topic>.md 集約」「case-run-execution-adapter 参照実装」
      が含まれることを確認する。
    pass_criteria: |
      ファイルが存在し、分離原則・参照実装・適用基準・配布 docs 制約の4セクションが揃っていること。
    on_failure: |
      fix-and-reverify。不足セクションを補って再検証する。
  - id: TS-004
    target_item: AG-009
    verification: |
      src/opencode/skills/agentdev-architecture-advisory/SKILL.md に grep で "oracle" を検索
      し0件であること。references/architecture-review-delegation.md が新設されていることを
      確認する。
    pass_criteria: |
      SKILL.md から oracle が0件、references/architecture-review-delegation.md が存在し、
      同ファイルにアーキテクチャ助言サブエージェントの具体的起動方法が集約されていること。
    on_failure: |
      fix-and-reverify。SKILL.md の oracle 残存を抽象化し、references/ へ具体を移動して再検証。
  - id: TS-005
    target_item: AG-010
    verification: |
      src/opencode/skills/agentdev-req-analysis/SKILL.md および
      references/explore-scope-refinement.md に grep で "explore" を検索（英単語一般用法を
      除外）し0件であること。
    pass_criteria: |
      SKILL.md, references/explore-scope-refinement.md のいずれも explore 固有名詞が0件で
      あること。サブエージェント調査委譲の抽象表現へ置換されていること。
    on_failure: |
      fix-and-reverify。残存 explore を抽象名へ置換し再検証する。
  - id: TS-006
    target_item: AG-012
    verification: |
      docs/specs/foundations/system.md に grep で "sisyphus", "prometheus" を検索し0件である
      こと。agent 割当表が削除されていることを確認する。
    pass_criteria: |
      system.md から sisyphus, prometheus の文字列が0件であること。コマンド一覧表は目的・責務
      のみを記述していること。
    on_failure: |
      fix-and-reverify。agent 割当表を削除し再検証する。
  - id: TS-007
    target_item: AG-013
    verification: |
      README.md および src/opencode/commands/agentdev/*.md の末尾に対し grep で ".sisyphus/"
      を検索する。
    pass_criteria: |
      README.md, 全 command .md の末尾から .sisyphus/ 言及が0件であること。
    on_failure: |
      fix-and-reverify。.sisyphus/ 言及を削除し再検証する。
  - id: TS-008
    target_item: AG-014
    verification: |
      docs/adr/ADR-0136.md, ADR-0128.md, ADR-0114.md に対し grep で "oh-my-openagent",
      "Sisyphus-Junior" を検索する。task() は許容し検査対象外とする。
    pass_criteria: |
      ADR-0136.md, ADR-0128.md, ADR-0114.md のいずれにも oh-my-openagent, Sisyphus-Junior
      が0件であること。task() は残存を許容する。
    on_failure: |
      fix-and-reverify。残存 omo 名詞を抽象名へ置換し再検証する。

case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints:
    - wave: 1
      ous: [OU-001]
      rationale: 設計原則確立が前提。REQ-0162 UPDATE と新設 SPEC を最初に完了させる。
    - wave: 2
      ous: [OU-002, OU-003, OU-004]
      rationale: OU-001 完了後に並列実行可能。各 REQ の抽象化は独立。
    - wave: 3
      ous: [OU-005, OU-006]
      rationale: 既存 SPEC の抽象化。OU-001〜004 の要件確定後に行う。
  implementation_hints:
    - description: command/skill/README/ADR 実装抽象化（AG-009, AG-010, AG-011, AG-012, AG-013, AG-014, AG-017）
      targets:
        - src/opencode/commands/agentdev/req-define.md
        - src/opencode/skills/agentdev-architecture-advisory/SKILL.md
        - src/opencode/skills/agentdev-architecture-advisory/references/architecture-review-delegation.md（新設）
        - src/opencode/skills/agentdev-req-analysis/SKILL.md
        - src/opencode/skills/agentdev-req-analysis/references/explore-scope-refinement.md
        - src/opencode/skills/agentdev-case-run-execution-adapter/SKILL.md
        - docs/specs/foundations/system.md
        - docs/adr/ADR-0136.md
        - docs/adr/ADR-0128.md
        - docs/adr/ADR-0114.md
        - README.md
        - src/opencode/commands/agentdev/*.md（末尾 .sisyphus/ 除去）
      timing: Wave 3 と並行または後に別 Issue で実施。非 OU 対象。
```

# summary

本 draft は ADR-0136「配布物ハーネス境界浄化」の完全適用と、設計原則（大多数は harness 非依存、依存は references/ 集約）の明文化を主題とする。

ユーザーとの壁打ちで確定した主要方針:
- agentdev-architecture-advisory skill は廃止せず、case-run-execution-adapter と同じ分離モデル（SKILL.md 残存 + references/architecture-review-delegation.md 新設）で整理
- system.md agent 表、.sisyphus/ 言及は完全削除（runtime workspace 管理、agent 割当は harness 側の責務）
- ADR 本文の oh-my-openagent, Sisyphus-Junior は抽象名へ置換（task() は許容）
- REQ-0162-002 を強化して分離モデルを要件化、新設 SPEC harness-separation-model.md で詳細化
- 採用しなかった方針: advisory skill の廃止（case-run 分離モデルとの不整合により不採用）

検討経緯: REQ-0139 が未更新で oracle/momus を具体名で保持しており、下流の command/skill/SPEC がそれに引きずられていた。ADR-0136 の適用を完了させ、設計原則を明文化することで構造的に防止する。
