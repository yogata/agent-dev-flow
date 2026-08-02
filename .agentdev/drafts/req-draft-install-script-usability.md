---
draft_type: req_draft
topic_slug: install-script-usability
status: saved
created_at: 2026-08-02T00:00:00+09:00
source_rus: []
---

# draft-data

```yaml
work_type: feature

scale: standard

summary: |
  REQ-009（配布基盤と導入モデル）へ、導入系スクリプト（install-consumer-opencode.ps1、
  check-consumer-opencode.ps1、sync-self-opencode.ps1）の使いやすさ要件（REQ-009-040〜043）を
  APPEND する。対話ウィザード、cwd 安全化、ヘルプの明示、上級者向けオプション注記の4点。
  詳細（ウィザード質問内容、停止条件リスト、メッセージ文面、dry-run/check/apply 技術差、
  隠しオプション名）は新規 SPEC docs/specs/local/install-script-usability.md へ分離。
  ADR 不要（アーキテクチャ変更なし、junction/clone/link 仕組みは維持）、feature standard、
  SPLIT 不要（同一関心: 導入モデルの使いやすさ）。
  入力元: .omo/plans/install-script-usability.md（実行計画、構造化済み）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      install-consumer-opencode.ps1 と sync-self-opencode.ps1 は引数なし（-Mode 未指定）で起動した
      場合、対話ウィザード（Read-Host）により Mode（install は環境も）を問う。引数あり（-Mode 明示）
      の場合はウィザードを起動しない。check-consumer-opencode.ps1 は Mode を持たないため対象外。
      ウィザード起動前に cwd 安全化（AG-002）を通過すること。
  - id: AG-002
    content: |
      install-consumer-opencode.ps1 と check-consumer-opencode.ps1 は、実行ディレクトリ（cwd）が
      想定外（Git リポジトリでない、原本領域、実行時領域、clone 先）の場合、即座に停止し、
      現在のパスと移動先を具体的に案内する。正常系（Git リポジトリのルート）は通過する。
      停止メッセージは「導入先ルート」「ルート」等の用語を使わず、現在のパスと移動先を示す。
      sync-self-opencode.ps1 は cwd 非依存（$PSScriptRoot 基準）だが、本体リポジトリ以外へ
      コピーして実行された場合を検出して停止する（src/opencode の存在確認）。
  - id: AG-003
    content: |
      install-consumer-opencode.ps1、check-consumer-opencode.ps1、sync-self-opencode.ps1 の
      ヘルプ（.DESCRIPTION）に dry-run/check/apply の3モードの違い（check=clone しない軽量確認、
      dry-run=clone して予測、apply=clone して実行）を明示する。加えて install のヘルプに
      -LocalMode の判断基準（GitHub Issue/PR を使わずローカルファイル（.agentdev/cases/）で
      運用する環境）を明示する。check はヘルプで当スクリプトと install -Mode check の使い分け
      （clone するか否か）を明示する。
  - id: AG-004
    content: |
      install-consumer-opencode.ps1、check-consumer-opencode.ps1、sync-self-opencode.ps1 の
      clone 先・clone 元を変更する上級者向けオプション（-PluginDir、-RepoUrl、-Branch。
      check は -PluginDir のみ）に、上級者向けである旨を注記する。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: append
    target: docs/requirements/REQ-009.md
    target_area: "## 要件"
    source_items: [AG-001, AG-002, AG-003, AG-004]
    content: |
      | REQ-009-040 | 同期、インストール手段は引数なしで起動した場合、対話ウィザードにより実行モードを問うこと（install は環境も問う） |
      | REQ-009-041 | 同期、インストール手段は実行ディレクトリが想定外（Git リポジトリでない、原本領域、実行時領域、clone 先）の場合、停止して移動先を案内すること |
      | REQ-009-042 | 同期、インストール手段のヘルプに dry-run/check/apply の3モードの違いと -LocalMode の判断基準を明示すること |
      | REQ-009-043 | 同期、インストール手段の clone 先、clone 元を変更する上級者向けオプションにその旨を注記すること |

  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-create
    target_spec:
      operation: create
      domain: local
      slug: install-script-usability
    target_area:
    source_items: [AG-001, AG-002, AG-003, AG-004]
    spec_logical_division: behavior
    canonical_owner: install-script
    content: |
      ---
      title: 導入スクリプトの使いやすさ詳細
      status: draft
      created: 2026-08-02
      updated: 2026-08-02
      spec_logical_division: behavior
      canonical_owner: install-script
      ---

      # 導入スクリプトの使いやすさ詳細

      本 SPEC は REQ-009（配布基盤と導入モデル）の要件行 REQ-009-040〜043 を具体化する、
      導入系スクリプト（install-consumer-opencode.ps1、check-consumer-opencode.ps1、
      sync-self-opencode.ps1）の使いやすさ詳細を定義する。

      ## 対話ウィザード

      ### install-consumer-opencode.ps1

      引数なし起動時（-Mode 未指定）に以下のウィザードを起動する。Q1 目的は dry-run/check/apply
      の違いを併記する。

      - Q1 目的:
        - 1) 新規インストール → apply
        - 2) 更新・再同期 → apply
        - 3) 状態確認（clone しない軽量確認）→ check
        - 4) 変更予測（clone するが変更しない）→ dry-run
      - Q2 環境:
        - 1) GitHub 版（通常）→ $LocalMode = $false
        - 2) ローカル版（GitHub Issue/PR を使わずローカルファイルで運用）→ $LocalMode = $true

      ### sync-self-opencode.ps1

      引数なし起動時に以下のウィザードを起動する。

      - Q1 目的:
        - 1) 同期実行 → apply
        - 2) 乖離確認 → check
        - 3) 変更予測 → dry-run

      ### check-consumer-opencode.ps1

      Mode を持たないため対象外。

      ## dry-run/check/apply の技術的差

      | モード | clone | ファイル変更 |
      |---|---|---|
      | check | しない | しない（検証のみ） |
      | dry-run | する | しない（予測のみ） |
      | apply | する | する |

      ## cwd 安全化

      ### 停止条件

      install-consumer-opencode.ps1 と check-consumer-opencode.ps1 は、実行ディレクトリが
      以下のいずれかの場合、即座に停止する。

      1. .git が存在しない（Git リポジトリでない）
      2. .agentdev-plugin/ 配下（clone 先）
      3. src/opencode/ 配下（原本領域）
      4. .opencode/ 配下（実行時領域）

      sync-self-opencode.ps1 は $PSScriptRoot の親に src/opencode が存在しない場合、
      本体リポジトリ外での誤実行として停止する。

      ### 停止メッセージ形式

      install と check の停止メッセージ形式:

      ```
      現在のフォルダ: <cwd の絶対パス>。<理由>。AgentDevFlow をインストールしたいリポジトリの一番上のフォルダ（.git がある場所）で実行してください。
      ```

      理由の具体文:

      | 条件 | 理由文 |
      |---|---|
      | .git 無し | このフォルダは Git リポジトリではありません |
      | .agentdev-plugin/ 内 | このフォルダは agent-dev-flow の clone 先です。1つ上のフォルダへ移動してください |
      | src/opencode/ 内 | このフォルダは agent-dev-flow の原本領域です |
      | .opencode/ 内 | このフォルダは OpenCode の実行時領域です |

      sync-self の停止メッセージ:

      ```
      このスクリプトは AgentDevFlow 本体リポジトリ専用です。<cwd> には src\opencode がありません。導入先リポジトリでは install-consumer-opencode.ps1 を使ってください。
      ```

      ## -LocalMode の判断基準

      GitHub Issue/PR を使わずローカルファイル（.agentdev/cases/）で運用する環境
      （ローカル版 OpenCode）では -LocalMode を指定する。

      ## 上級者向けオプション

      以下のオプションは clone 先・clone 元を変更する上級者向けであり、通常は指定不要。

      ### install-consumer-opencode.ps1

      - -PluginDir: clone 先ディレクトリ名（既定: .agentdev-plugin）
      - -RepoUrl: clone 元リポジトリ URL
      - -Branch: clone 元ブランチ

      ### check-consumer-opencode.ps1

      - -PluginDir: clone 先ディレクトリ名

      ### sync-self-opencode.ps1

      上級者向けオプションは現在なし（本スクリプトは本体専用のため）。

      ## 適用範囲

      - 対象: install-consumer-opencode.ps1、check-consumer-opencode.ps1、
        sync-self-opencode.ps1 の使いやすさ詳細（ウィザード、cwd 検査、ヘルプ、上級者向けオプション）
      - 対象外: junction 作成、clone、orphan 検出、VERIFY 等の核心ロジック
        （runtime-package-boundary.md 参照）

conflict_resolutions:
  - id: CR-001
    conflict: |
      REQ-009 の SPLIT シグナルが 2（関心分類 +1: 同期基盤/ローカル版導入/ローカルCase 等、
      アーティファクト種別 +1: scripts/.agentdev-plugin/.agentdev/cases/.opencode/src 等）で、
      APPEND 実施前に SPLIT 要否の判断が必要（req-health-metrics SPEC）。
    resolution: |
      今回の APPEND は「導入スクリプトの使いやすさ」という関心で、REQ-009「配布基盤と導入モデル」
      と同一関心。関心の分裂を生じさせず、既存関心の補完。SPLIT すべき関心の境界が見えないため
      SPLIT 不要と判断。ユーザー承認済み（2026-08-02）。
  - id: CR-002
    conflict: |
      今回の変更が ADR 閾値（アーキテクチャ変更、複数システム影響、長期間有効な決定、
      取り返しがつかない変更）に達するか。
    resolution: |
      アーキテクチャ変更なし（junction/clone/link 仕組みは維持）。単一モジュール（scripts/ 配下）
      の実装選択と CLI 使いやすさ改善。既存 ADR-004（差し替え可能な I/O 境界）と整合。
      ADR 不要と判断。Step 5-4 アーキテクチャ助言サブエージェントへの委譲も不要（衝突候補なし）。

operation_units:
  - ou_id: OU-001
    source_ru:
    target_req: REQ-009
    target_spec:
    operation: append
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}

  - ou_id: OU-002
    source_ru:
    target_req:
    target_spec:
      operation: create
      domain: local
      slug: install-script-usability
    operation: spec-create
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      ダミー導入先リポジトリ（.git あり）を作成する。
      scripts/install-consumer-opencode.ps1 を引数なしで起動し、ウィザードが起動すること、
      Q1「1」Q2「1」選択で apply が走ること（.agentdev-plugin と junction が作られること）を確認。
      scripts/sync-self-opencode.ps1 を本体リポジトリで引数なし起動し、ウィザードが起動すること、
      Q1「1」選択で apply 相当の処理が走ること（.opencode の junction 再作成）を確認。
      引数あり（-Mode apply 等）で起動し、ウィザードが起動しないことを確認。
    pass_criteria: |
      install/sync-self とも引数なしでウィザード起動、選択に応じた Mode で実行される。
      引数あり（-Mode 明示）でウィザード起動せず、従来通りの挙動を維持する。
    on_failure: |
      fix-and-reverify。ウィザード起動ロジック、Mode 分岐、引数判定の実装不良の場合、
      実装を修正して再検証する。

  - id: TS-002
    target_item: AG-002
    verification: |
      ダミー導入先リポジトリ（.git あり）を作成する。
      その .agentdev-plugin/ サブディレクトリ、src\opencode/ サブディレクトリ（ダミー）、
      .opencode/ サブディレクトリ（ダミー）、.git 無しディレクトリでそれぞれ
      install-consumer-opencode.ps1 と check-consumer-opencode.ps1 を起動し、
      停止とメッセージ（現在のパスと移動先）を確認。
      正常系（.git ありルート）で起動し、通過することを確認。
      ダミー導入先リポジトリへ scripts/sync-self-opencode.ps1 をコピーして実行し、
      誤実行検出で停止すること、本体リポジトリでは通過することを確認。
    pass_criteria: |
      install/check とも想定外ディレクトリ（.git 無し、.agentdev-plugin 内、src\opencode 内、
      .opencode 内）で停止し、現在のパスと移動先が表示される。正常系は通過。
      sync-self は導入先コピー実行で停止、本体では通過。
    on_failure: |
      fix-and-reverify。停止条件判定、メッセージ生成の実装不良の場合、
      実装を修正して再検証する。

  - id: TS-003
    target_item: AG-003
    verification: |
      pwsh -Command "Get-Help ./scripts/install-consumer-opencode.ps1 -Detailed" を実行し、
      dry-run/check/apply の3モードの違いと -LocalMode の判断基準が .DESCRIPTION に表示されることを確認。
      pwsh -Command "Get-Help ./scripts/check-consumer-opencode.ps1 -Detailed" を実行し、
      当スクリプトの位置づけ（clone しない軽量確認）と install -Mode check との使い分けが表示されることを確認。
      pwsh -Command "Get-Help ./scripts/sync-self-opencode.ps1 -Detailed" を実行し、
      3モードの違いと本体専用である旨が表示されることを確認。
    pass_criteria: |
      3スクリプトとも Get-Help -Detailed に3モードの違いが表示される。
      install には -LocalMode の判断基準が、check には install との使い分けが、
      sync-self には本体専用である旨が表示される。
    on_failure: |
      fix-and-reverify。ヘルプコメント（.DESCRIPTION）の追記漏れ、誤記の場合、
      実装を修正して再検証する。

  - id: TS-004
    target_item: AG-004
    verification: |
      pwsh -Command "Get-Help ./scripts/install-consumer-opencode.ps1 -Detailed" を実行し、
      -PluginDir, -RepoUrl, -Branch に上級者向けである旨の注記が表示されることを確認。
      pwsh -Command "Get-Help ./scripts/check-consumer-opencode.ps1 -Detailed" を実行し、
      -PluginDir に上級者向けである旨の注記が表示されることを確認。
      pwsh -Command "Get-Help ./scripts/sync-self-opencode.ps1 -Detailed" を実行し、
      上級者向けオプションが現在なしであることが確認できること（注記自体は不要）。
    pass_criteria: |
      install の -PluginDir/-RepoUrl/-Branch、check の -PluginDir に上級者向け注記が表示される。
      sync-self は上級者向けオプションなしなので注記不要。
    on_failure: |
      fix-and-reverify。注記の追記漏れ、誤記の場合、実装を修正して再検証する。

review_dispositions:
  - id: RD-001
    source_ru:
    source_item: plan-apply-mechanical-replacement
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      apply-mechanical-replacement.ps1（226行）は文書整形スクリプトであり、導入系スクリプトと無関係。
      要件化対象外。
    evidence:
      path: .omo/plans/install-script-usability.md
      section: "Out of scope / Must-NOT-Have"
      checked_at_commit: null
    related_removed_items: []

  - id: RD-002
    source_ru:
    source_item: plan-core-logic
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      スクリプト核心ロジック（junction 作成、clone、orphan 検出、VERIFY）の変更は対象外。
      既存の ADR-004/REQ-009 で規定された仕組みを維持する。
    evidence:
      path: .omo/plans/install-script-usability.md
      section: "Out of scope / Must-NOT-Have"
      checked_at_commit: null
    related_removed_items: []

  - id: RD-003
    source_ru:
    source_item: plan-tag-japaneseization
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      既存の出力タグ（[ACTION]/[DIVERGENCE] 等）の日本語化・凡例整備は対象外。
      ただしウィザードと cwd エラーメッセージは日本語とする（AG-001/AG-002 の対象）。
    evidence:
      path: .omo/plans/install-script-usability.md
      section: "Out of scope / Must-NOT-Have"
      checked_at_commit: null
    related_removed_items: []

  - id: RD-004
    source_ru:
    source_item: plan-modularization
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      共通ヘッダーファイル/モジュール化は対象外。1ファイル完結を維持。
      Assert-ValidConsumerCwd は install と check で重複定義する（導入先コピー運用のため）。
    evidence:
      path: .omo/plans/install-script-usability.md
      section: "Out of scope / Must-NOT-Have"
      checked_at_commit: null
    related_removed_items: []

  - id: RD-005
    source_ru:
    source_item: plan-docs-revision
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      docs（README、ガイド、SPEC）の改修は実装フェーズでは対象外。
      ただし req-define が SPEC 分離基準に基づき特定した SPEC 候補（ACT-SPEC-001）は
      spec-save で保存される。これは要件定義の責務であり、docs 改修のスコープ判定とは別。
    evidence:
      path: .omo/plans/install-script-usability.md
      section: "Out of scope / Must-NOT-Have"
      checked_at_commit: null
    related_removed_items: []

  - id: RD-006
    source_ru:
    source_item: plan-repository-type-variation
    disposition: not_applicable
    reason_code: out_of_scope
    reason: |
      リポジトリ種別 5種/4種 表記揺れの解消は対象外。
      consumer-project-setup.md（5種）と runtime-package-boundary.md（4種）の表記揺れは
      刷れ既存事象であり、今回の要件化対象外。
    evidence:
      path: .omo/plans/install-script-usability.md
      section: "Out of scope / Must-NOT-Have"
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: false
  decomposition:
  wave_hints: []
```

# summary

本要件docは、`.omo/plans/install-script-usability.md`（実行計画）を入力とし、AgentDevFlow の正式要件定義フローで REQ/ADR 化した成果物である。

主な内容:
- **REQ-009（配布基盤と導入モデル）への APPEND**: 導入系スクリプトの使いやすさ要件（REQ-009-040〜043）を4行追加。対話ウィザード、cwd 安全化、ヘルプの明示、上級者向けオプション注記。
- **新規 SPEC（docs/specs/local/install-script-usability.md）の spec-create**: REQ-009-040〜043 を具体化する詳細（ウィザード質問内容、停止条件リスト、メッセージ文面、dry-run/check/apply 技術差、隠しオプション名）。
- **ADR 不要**: アーキテクチャ変更なし。junction/clone/link 仕組みは ADR-004/REQ-009 で規定済み。
- **SPLIT 不要**: REQ-009 の SPLIT シグナルは 2 だが、今回の APPEND は同一関心（導入モデルの使いやすさ）のため関心の分裂なし。

検討経緯:
- 入力元は RU ではなく `.omo/plans/`（実行計画）。計画フェーズで合意済みの優先軸（C: 引数・モード + cwd 安全化）、対象（install/check/sync-self の3本）、スコープ外（apply-mechanical-replacement、核心ロジック、タグ日本語化、モジュール化、docs 改修、リポジトリ種別表記揺れ）を前提とした。
- REQ-009-001/002/014 が直接関連（3モード、scripts/ 別手段、ローカル版）。CREATE ではなく APPEND が妥当と判断。
- feature standard（3ファイル、局所）。

次のアクション: `/agentdev/req-save` で本 draft を消費し、REQ-009.md への APPEND と SPEC 新規作成を実行。
