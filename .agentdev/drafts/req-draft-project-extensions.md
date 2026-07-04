---
draft_type: req_draft
topic_slug: project-extensions
status: saved
created_at: 2026-07-04T15:30:00+09:00
saved_at: 2026-07-04T16:30:00+09:00
source_rus:
  - RU-20260704-project-extensions-runtime-reference-boundary
---

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  AgentDevFlow 配布 command/skill 本文をプロジェクト非依存とし、プロジェクト固有の文脈、規約、検査、
  受け入れゲート、禁止事項を追加・拡張する設定層として .agentdev/extensions/** を定義する。
  従来の .agentdev/doc-inputs/**（参照リスト）を .agentdev/extensions/**（追加・拡張設定層）に置き換える。
  配布 command/skill 本文に ADR/REQ/SPEC の具体ID、具体パス、固定URLを持たせない境界を徹底する。
  標準 skill agentdev-project-extensions、保守 command /agentdev/inspect-extensions を新設する。
  ADR-0133（Doc Inputs Architecture）を supersede する新規 ADR を作成する（oracle 相談 bg_a0c19723 で確認中）。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      .agentdev/extensions/** を、AgentDevFlow が提供する標準 command/skill に対してプロジェクト固有の文脈、規約、検査、受け入れゲート、禁止事項を追加・拡張する設定層として定義する。
      標準配置は .agentdev/extensions/commands/<command>.yaml と .agentdev/extensions/skills/<skill>.yaml とする。
      extension は標準 command/skill の改変ではなく、追加・拡張のみとする。
      docs/specs/foundations/project-doc-inputs.md を docs/specs/foundations/project-extensions.md に置き換える。

  - id: AG-002
    content: |
      extension はフロントマタ（version, kind, id）と標準5セクション（context, rules, checks, acceptance_gates, must_not）を持つ。
      command extension は kind: command-extension、skill extension は kind: skill-extension とする。
      id は対象 command（/agentdev/<command>）または対象 skill を識別する値とする。
      各セクションの意味: context（追加文脈）、rules（追加規約）、checks（追加検査）、acceptance_gates（実行完了前ゲート）、must_not（追加禁止事項）。
      acceptance_gates は REQ の受け入れ条件、case-close、QG 本体ではなく、command/skill extension によって追加される実行完了前ゲートである。
      初期契約に action, required, fail_on を含めない。

  - id: AG-003
    content: |
      command/skill は実行時に自分に対応する extension だけを読む。
      command は .agentdev/extensions/commands/<command>.yaml、skill は .agentdev/extensions/skills/<skill>.yaml を対象とする。
      対応 extension が存在しない場合は標準動作で続行する。
      対応 extension が破損している場合はエラーを表示し、当該 extension を無視して標準動作で続行する。
      extension は標準 command/skill の上書きではなく、追加・拡張としてのみ扱う。

  - id: AG-004
    content: |
      標準 skill agentdev-project-extensions を追加する。
      当該 skill は以下を担う: 対応 extension ファイルの探索、extension 不在時の空 extension 扱い、
      extension 破損時のエラー表示と無視、context/rules/checks/acceptance_gates/must_not の読み取り、
      extension が標準 command/skill の上書きではなく追加・拡張であることの扱い、
      rules/checks から project-local skill 委譲対象を抽出すること。

  - id: AG-005
    content: |
      保守用 command /agentdev/inspect-extensions を追加する。
      当該 command は以下を担う: .agentdev/extensions/** の一覧化、extension YAML の構造確認、
      kind と配置の整合確認、id と対象 command/skill の対応確認、context.paths の実在確認、
      rules.skill/checks.skill に記述された project-local skill の存在確認、
      旧 .agentdev/doc-inputs/** の残存検出、
      extension が標準 command/skill の上書きとして記述されていないことの確認。

  - id: AG-006
    content: |
      rules/checks は skill: に具体的な project-local skill 名を記述し、その skill に実行を委譲する。
      初期契約では action, required, fail_on は採用しない。
      呼び出された skill は extension entry の id, when, skill および周辺文脈をもとに判断する。
      AgentDevFlow 標準は skill: 構文を定義するが、委譲先 skill の中身には関与しない。
      各適用プロジェクトが project-local skill を用意し、rules/checks の中身を定義する。

  - id: AG-007
    content: |
      command/skill 本文には、ADR/REQ/SPEC の具体ID、具体パス、固定URLを記述しない。
      禁止対象は文書種別名としての ADR, REQ, SPEC ではなく、プロジェクト固有文書を直接指す具体参照である。
      .agentdev/extensions/** は、そのプロジェクトの ADR/REQ/SPEC 参照を許可する。
      REQ/ADR/SPEC 本文内の参照も許容する。

  - id: AG-008
    content: |
      AgentDevFlow 標準の責務は、inspect-extensions により extension 構造確認、context.paths 実在確認、
      rules/checks の skill 存在確認を提供すること、および command/skill 本文の ADR/REQ/SPEC 具体参照禁止ルールを
      SPEC として定義することまでとする。
      具体的な持続的検査の実装（どのような project-local skill を使うか、何を検査するか）は各適用プロジェクトの責務であり、
      AgentDevFlow 標準の対象外である。
      agent-dev-flow リポジトリ自身は適用プロジェクトの1つとして、repo-local skill により検査を実装するが、
      これは標準仕様ではなく agent-dev-flow のローカル運用である。

artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:{project-extensions}
    source_items: [AG-003, AG-004, AG-005, AG-006, AG-007, AG-008]
    content: |
      # Project Extensions 機構と配布物参照境界

      ## 概要

      AgentDevFlow 配布 command/skill 本文をプロジェクト非依存とし、プロジェクト固有の文脈、規約、検査、受け入れゲート、禁止事項を追加・拡張する設定層として .agentdev/extensions/** を定義する。配布 command/skill 本文に ADR/REQ/SPEC の具体参照を持たせない境界を徹底する。

      ## 要件

      ### project-extensions 機構

      - .agentdev/extensions/** を、標準 command/skill に対してプロジェクト固有の文脈、規約、検査、受け入れゲート、禁止事項を追加・拡張する設定層として定義する。
      - 標準配置は .agentdev/extensions/commands/<command>.yaml と .agentdev/extensions/skills/<skill>.yaml とする。
      - extension は標準 command/skill の改変ではなく、追加・拡張のみとする。

      ### 実行時読み込み契約

      - command/skill は実行時に自分に対応する extension だけを読む。
      - 対応 extension が存在しない場合は標準動作で続行する。
      - 対応 extension が破損している場合はエラーを表示し、当該 extension を無視して標準動作で続行する。

      ### 標準 skill / command

      - 標準 skill agentdev-project-extensions を追加する。当該 skill は extension 探索、不在・破損時の扱い、5セクション読み取り、上書きでないことの扱い、委譲対象抽出を担う。
      - 保守用 command /agentdev/inspect-extensions を追加する。当該 command は extension 一覧化、構造確認、配置・id 整合、path 実在確認、skill 存在確認、旧 doc-inputs 残存検出、上書き記述検出を担う。

      ### project-local skill 委譲

      - rules/checks は skill: に具体的な project-local skill 名を記述し委譲する。初期契約に action, required, fail_on を含めない。

      ### command/skill 本文の参照禁止

      - command/skill 本文に ADR/REQ/SPEC の具体ID、具体パス、固定URLを記述しない。禁止対象は文書種別名ではなく具体参照である。
      - .agentdev/extensions/** は当該プロジェクトの ADR/REQ/SPEC 参照を許可する。REQ/ADR/SPEC 本文内の参照も許容する。

      ### 検査・診断（AgentDevFlow 標準）

      - AgentDevFlow 標準は /agentdev/inspect-extensions により extension 構造確認、context.paths 実在確認、rules/checks の skill 存在確認を提供する。
      - command/skill 本文の ADR/REQ/SPEC 具体参照禁止ルールを SPEC として定義する。
      - 各適用プロジェクトは project-local skill により具体参照禁止の持続的検査を実装する（標準の対象外）。
      - 旧 .agentdev/doc-inputs/** の残存を検出する方針を定義する（inspect-extensions の責務）。

      ## 適用範囲

      ### 対象
      - .agentdev/extensions/** 機構の定義
      - 標準 skill agentdev-project-extensions
      - 保守 command /agentdev/inspect-extensions
      - command/skill 本文の ADR/REQ/SPEC 具体参照禁止ルール

      ### 対象外
      - 標準 command/skill の責務を extension から上書きすること
      - action, required, fail_on の初期契約への追加
      - REQ/ADR/SPEC 本文内の参照方針の再設計
      - REQ/ADR/SPEC 間参照の推奨可否の詳細設計
      - 具体的な実装手順、コード差分、移行スクリプトの詳細

  - id: ACT-ADR-001
    artifact: adr
    operation: create
    target: new:{project-extensions-architecture}
    source_items: [AG-001, AG-002, AG-003]
    content: |
      # ADR: Project Extensions Architecture

      ## 背景

      ADR-0133 は doc-inputs 機構を実行時 docs 参照の外部化機構として採用した。doc-inputs は command/skill が読む docs の参照リストとして機能する。

      しかし、各プロジェクトでは AgentDevFlow が提供する標準 command/skill に対して、プロジェクト固有の文脈、規約、検査、受け入れゲート、禁止事項を追加したい。この追加・拡張は、標準 command/skill 本文へ直接書き込むのではなく、プロジェクト側の設定層で与える必要がある。

      doc-inputs は参照リストとしての意味が強く、追加・拡張設定層としての機能を十分に提供しない。

      ## 決定

      project-extensions を、標準 command/skill へのプロジェクト固有追加・拡張の設定層として採用する。.agentdev/extensions/** は context, rules, checks, acceptance_gates, must_not の5セクションを提供し、参照リスト（doc-inputs の機能）を包含しつつ、より広い拡張機能を提供する。

      extension は標準 command/skill の上書きではなく、追加・拡張のみとする。command/skill は実行時に対応 extension のみを読み、不在時は標準動作、破損時はエラー表示+無視+標準動作とする。

      command/skill 本文に ADR/REQ/SPEC の具体参照を記述しないルールを徹底する。.agentdev/extensions/** 内では当該プロジェクトの ADR/REQ/SPEC 参照を許可する。

      本 ADR は ADR-0133（Doc Inputs Architecture）を supersede する。ADR-0104（実行時独立性）に relates-to し、supersede しない。

      ## 検討した代替案

      ### 代替案 A: doc-inputs 機構を拡張する

      doc-inputs に context, rules 等のセクションを追加する。採用しない。doc-inputs は「参照リスト」としての契約が明確であり、別の関心（追加・拡張設定）を混入させると責務が曖昧になるため。

      ### 代替案 B: DOC-MAP に拡張情報を持たせる

      採用しない。DOC-MAP は探索索引であり、command/skill 別の拡張設定を持たせると責務が混入するため。

      ## 結果

      - 配布 command/skill 本文は ADR/REQ/SPEC 具体参照を持たなくなる。
      - プロジェクトは .agentdev/extensions/** で独自の規約、検査、禁止事項を追加できる。
      - ADR-0133（doc-inputs）は supersede される。

      ## 関連

      - ADR-0133: Doc Inputs Architecture（本 ADR が supersede）
      - ADR-0104: 実行時独立性（relates-to、supersede しない）

  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-create
    target_spec:
      operation: create
      domain: foundations
      slug: project-extensions
    source_items: [AG-001, AG-002, AG-003, AG-006, AG-007, AG-008]
    content: |
      ---
      status: draft
      ---

      # Project Extensions

      実行時のプロジェクト固有追加・拡張機構としての project extensions を定義する（ADR: new:project-extensions-architecture）。
      配布 command/skill 本文をプロジェクト非依存とし、プロジェクト固有の文脈、規約、検査、受け入れゲート、禁止事項を .agentdev/extensions/** 経由で追加・拡張する仕組みを規定する。
      従来の .agentdev/doc-inputs/**（参照リスト機構）に替わる設定層である。

      ## 背景、目的

      AgentDevFlow 配布 command/skill 本文（src/opencode/commands/**, src/opencode/skills/**）は、AgentDevFlow 本体固有の ADR/REQ/SPEC への具体参照を持つと、利用先プロジェクトで解決不能な参照が混入する。

      project extensions 機構は、プロジェクト固有の追加・拡張を配布コードから分離し、プロジェクト別に与える。実装本文はプロジェクト非依存・単体利用可能とし、ADR/REQ/SPEC の具体ID、具体パス、固定URLを持たない。extensions（.agentdev/extensions/**）はプロジェクト固有情報を対象とし、そのプロジェクトの ADR/REQ/SPEC を具体的に参照してよい。

      ## 標準配置

      ```text
      .agentdev/extensions/commands/<command>.yaml
      .agentdev/extensions/skills/<skill>.yaml
      ```

      ## extension の基本構造

      extension は以下の基本構造を持つ。

      ```yaml
      version: 1
      kind: command-extension  # または skill-extension
      id: /agentdev/<command>  # または <skill>

      context: []
      rules: []
      checks: []
      acceptance_gates: []
      must_not: []
      ```

      各セクションの意味:

      | セクション | 意味 |
      |---|---|
      | context | command/skill に追加で与える文脈 |
      | rules | command/skill に追加で守らせる規約 |
      | checks | command/skill に追加で実行させる検査 |
      | acceptance_gates | command/skill extension が追加する実行完了前ゲート |
      | must_not | command/skill に追加で課す禁止事項 |

      acceptance_gates は REQ の受け入れ条件ではなく、case-close / QG 本体でもない。command/skill extension によって追加される実行完了前ゲートである。

      ## 実行時読み込み契約

      command/skill は実行時に自分に対応する extension だけを読む。

      - command は .agentdev/extensions/commands/<command>.yaml を対象とする。
      - skill は .agentdev/extensions/skills/<skill>.yaml を対象とする。
      - 対応 extension が存在しない場合は標準動作で続行する。
      - 対応 extension が破損している場合はエラーを表示し、当該 extension を無視して標準動作で続行する。
      - extension は標準 command/skill の上書きではなく、追加・拡張としてのみ扱う。

      ## project-local skill 委譲

      rules/checks は skill: に具体的な project-local skill 名を記述し、その skill に実行を委譲する。

      初期契約では action, required, fail_on は採用しない。
      呼び出された skill は extension entry の id, when, skill および周辺文脈をもとに判断する。

      AgentDevFlow 標準は skill: 構文を定義するが、委譲先 skill の中身には関与しない。
      各適用プロジェクトが project-local skill を用意し、rules/checks の中身を定義する。

      例:

      ```yaml
      rules:
        - id: <rule-id>
          when: <条件>
          skill: <project-local-skill-name>

      checks:
        - id: <check-id>
          when: <条件>
          skill: <project-local-skill-name>
      ```

      ## command/skill 本文の参照禁止

      command/skill 本文には、ADR/REQ/SPEC の具体ID、具体パス、固定URLを記述しない。

      禁止対象は文書種別名としての ADR, REQ, SPEC ではなく、プロジェクト固有文書を直接指す具体参照である。

      .agentdev/extensions/** は、そのプロジェクトの ADR/REQ/SPEC 参照を許可する。
      REQ/ADR/SPEC 本文内の参照も許容する。

      ## 検査、診断

      /agentdev/inspect-extensions は読み取り専用診断コマンドとして以下を検査する。

      1. .agentdev/extensions/** の一覧化
      2. extension YAML の構造確認
      3. kind と配置の整合確認
      4. id と対象 command/skill の対応確認
      5. context.paths の実在確認
      6. rules.skill / checks.skill に記述された project-local skill の存在確認
      7. 旧 .agentdev/doc-inputs/** の残存検出
      8. extension が標準 command/skill の上書きとして記述されていないことの確認

      AgentDevFlow 標準の inspect 責務は上記構造確認・path 実在確認・skill 存在確認までとする。
      command/skill 本文の ADR/REQ/SPEC 具体参照禁止の持続的検査は、各適用プロジェクトが project-local skill により実装する（AgentDevFlow 標準の対象外）。
      agent-dev-flow リポジトリ自身は適用プロジェクトの1つとして repo-local skill により検査を実装するが、これは標準仕様ではなくローカル運用である。

      ## ハイブリッド方式

      extension 原本は各プロジェクトが所有する。AgentDevFlow 本体は初期テンプレート、schema、検査、/agentdev/inspect-extensions コマンドを提供し、consumer はテンプレートを初期値として取り込みカスタマイズする。AgentDevFlow 本体リポジトリの .agentdev/extensions/** には本体固有 SPEC パスを記述してよい。

      ## 関連

      - ADR: new:project-extensions-architecture: Project Extensions Architecture
      - ADR-0104: 実行時独立性（本 SPEC は具体化機構を提供）

conflict_resolutions:
  - id: CR-001
    conflict: "REQ-0157（Project Doc Inputs Migration、2026-07-02 作成）が現行 REQ として存在し、RU は当該 REQ が確立した doc-inputs 機構の全面置き換えを要求する。RU の「主対象REQ変更候補」リストに REQ-0157 が含まれていない。"
    resolution: |
      親エージェント確定（oracle bg_a0c19723 高確信度推奨に基づく）: REQ-0157 を retired へ移動（履歴参照）、新規 REQ を CREATE。
      根拠: 概念の名称、ディレクトリ、schema、セクション構造が全て非互換に変わる。「移行」ではなく「置換」であり、REQ-0157 のタイトル「Project Doc Inputs Migration」は新体系では意味をなさない。
      新規 REQ に「REQ-0157（retired）を置換」と明記しトレーサビリティを確保する。retired REQ の ID は再利用しない（既存規約）。

  - id: CR-002
    conflict: "ADR-0133（Doc Inputs Architecture、accepted、2026-07-02）が現行基盤 ADR として存在し、RU は doc-inputs 機構の全面置き換えを要求する。わずか2日後の方向転換。"
    resolution: |
      親エージェント確定（oracle bg_a0c19723 高確信度推奨に基づく）: 新規 ADR が ADR-0133 を supersede する。
      根拠: schema・配置・命名の3点で非互換。relates-to のみだと ADR-0133 が現行基盤として残り、doc-inputs SPEC と project-extensions SPEC の両存矛盾を生む。
      新規 ADR は ADR-0104（実行時独立性）への relates-to を維持する。superseded になった ADR-0133 は superseded セクションへ移動（ADR-0111/ADR-0126 の前例）。
      反転スピード（2日）はプロジェクト文化として許容範囲（ADR-0126→ADR-0131 の前例あり）。新規 ADR に反転根拠と移行影響の全体像の明示が必須。

  - id: CR-003
    conflict: "RU 内に「置き換える」（一括移行）と「旧 doc-inputs 残存検出」（段階移行を暗示）の矛盾シグナルが存在する。"
    resolution: |
      親エージェント確定（oracle bg_a0c19723 中〜高確信度推奨に基づく）: 資産流用を前提とした一括置換（段階併存ではない）。
      RU 受け入れ条件17「旧 doc-inputs 残存検出」は段階併存ではなく、置換完了後の残存検出を意図。doc-inputs と extensions は schema 非互換のため併存すると実行時読み込み契約が2系統になり複雑化。
      実装作業（17 yaml 移行、check_doc_inputs.ts → check_extensions.ts、IR-056 更新、17コマンド本文書き換え）は大規模だが、詳細計画は case/Issue で扱う（反映作業）。

  - id: CR-004
    conflict: "inspect-doc-inputs の扱いが RU で未決（RU は inspect-extensions 新設のみ明記、inspect-doc-inputs の廃止/統合/改名を明示せず）。"
    resolution: |
      ユーザー確定: inspect-doc-inputs は inspect-extensions へ統合・改名する。
      既存 inspect-doc-inputs は .agentdev/doc-inputs/** と配布コード直接参照排除を診断する command であり、project-extensions 化では置換対象となる。

  - id: CR-005
    conflict: "RU および初期ドラフトが4層（AgentDevFlow標準 / 適用プロジェクトのextensions / 適用プロジェクトのproject-local skill / agent-dev-flow自身のrepo-local skill）を混同していた。repo-agentdev-integrity を AgentDevFlow 標準の前提として記述していた。"
    resolution: |
      ユーザー確定: 4層を厳密に分離する。
      AgentDevFlow 標準の責務は「extension 構造・読み込み契約・inspect による構造確認と skill 存在確認」までに限定する。
      repo-agentdev-integrity は agent-dev-flow リポジトリ自身の repo-local skill であり、標準の前提とはしない。
      repo-agentdev-runtime-boundary の例示は削除し、汎用プレースホルダーに置換した。
      各適用プロジェクトが project-local skill を用意し、rules/checks の中身を定義する。

operation_units:
  - ou_id: OU-001
    source_ru: RU-20260704-project-extensions-runtime-reference-boundary
    target_req: REQ-0160
    operation: create
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: epic
    result:
      saved_req_docs:
        - docs/requirements/REQ-0160.md
      artifact_action_mapping:
        ACT-REQ-001: docs/requirements/REQ-0160.md
        ACT-ADR-001: docs/adr/ADR-0135.md
      retire_actions:
        - REQ-0157 を docs/requirements/retired/REQ-0157.md へ移動（migrated→REQ-0160）
      supersede_actions:
        - ADR-0133 を superseded に遷移（superseded_by: ADR-0135）

  - ou_id: OU-002
    source_ru: RU-20260704-project-extensions-runtime-reference-boundary
    target_spec:
      operation: create
      domain: foundations
      slug: project-extensions
    operation: spec-create
    scale: standard
    depends_on: [OU-001]
    recommended_order: 2
    issue_policy: single
    result:
      saved_spec_docs:
        - docs/specs/foundations/project-extensions.md
      artifact_action_mapping:
        ACT-SPEC-001: docs/specs/foundations/project-extensions.md

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      docs/specs/foundations/project-extensions.md が存在することを確認する。
      .agentdev/extensions/** の配置（commands/<command>.yaml, skills/<skill>.yaml）が定義されていることを確認する。
      extension が追加・拡張（上書きでない）ことが明記されていることを確認する。
      project-doc-inputs.md から project-extensions.md への置換が示されていることを確認する。
    pass_criteria: |
      project-extensions.md が存在し、配置定義、追加・拡張の明記、旧 SPEC からの置換が全て明示されている。
    on_failure: |
      fix-and-reverify。SPEC 内容を修正して再確認する。SPEC の記述漏れが原因であり実装不良のため。

  - id: TS-002
    target_item: AG-002
    verification: |
      project-extensions.md に extension YAML schema（version, kind, id, context, rules, checks, acceptance_gates, must_not）が定義されていることを確認する。
      acceptance_gates が REQ 受け入れ条件/case-close/QG 本体ではなく、command/skill extension による実行完了前ゲートであることが明記されていることを確認する。
      初期契約に action, required, fail_on を含めないことが明記されていることを確認する。
    pass_criteria: |
      schema 定義が存在し、acceptance_gates の位置づけ、3項目除外が全て明記されている。
    on_failure: |
      fix-and-reverify。SPEC 内容を修正して再確認する。

  - id: TS-003
    target_item: AG-003
    verification: |
      project-extensions.md に実行時読み込み契約（対応 extension のみ読む、不在時標準動作、破損時エラー+無視+標準動作、上書きでなく追加・拡張）が定義されていることを確認する。
    pass_criteria: |
      4つの契項目が全て SPEC に定義されている。
    on_failure: |
      fix-and-reverify。SPEC 内容を修正して再確認する。

  - id: TS-004
    target_item: AG-004
    verification: |
      src/opencode/skills/agentdev-project-extensions/SKILL.md が存在することを確認する。
      RU に列挙された6つの責務（extension 探索、不在時空 extension 扱い、破損時エラー表示と無視、5セクション読み取り、上書きでないことの扱い、委譲対象抽出）が定義されていることを確認する。
    pass_criteria: |
      skill が存在し、6つの責務が全て定義されている。
    on_failure: |
      fix-and-reverify。SKILL.md を修正して再確認する。

  - id: TS-005
    target_item: AG-005
    verification: |
      src/opencode/commands/agentdev/inspect-extensions.md が存在することを確認する。
      RU に列挙された8つの責務（一覧化、構造確認、kind/配置整合、id 対応確認、path 実在確認、skill 存在確認、旧 doc-inputs 残存検出、上書き記述検出）が定義されていることを確認する。
    pass_criteria: |
      command が存在し、8つの責務が全て定義されている。
    on_failure: |
      fix-and-reverify。command 定義を修正して再確認する。

  - id: TS-006
    target_item: AG-006
    verification: |
      project-extensions.md に rules/checks の skill: 委譲方式が定義されていることを確認する。
      action, required, fail_on が初期契約に含まれないことが明記されていることを確認する。
    pass_criteria: |
      委譲方式が定義され、3項目除外が明記されている。
    on_failure: |
      fix-and-reverify。SPEC 内容を修正して再確認する。

  - id: TS-007
    target_item: AG-007
    verification: |
      project-extensions.md に command/skill 本文の具体参照禁止が定義されていることを確認する。
      禁止対象が具体参照（文書種別名 ADR/REQ/SPEC ではない）であることが明記されていることを確認する。
      .agentdev/extensions/** 内参照許可、REQ/ADR/SPEC 本文内参照許容が明記されていることを確認する。
    pass_criteria: |
      禁止ルール、3つの例外/許可（具体参照の定義、extensions 内許可、本文内参照許容）が全て明記されている。
    on_failure: |
      fix-and-reverify。SPEC 内容を修正して再確認する。

  - id: TS-008
    target_item: AG-008
    verification: |
      project-extensions.md に inspect-extensions による extension 構造確認、path 実在確認、skill 存在確認が定義されていることを確認する。
      AgentDevFlow 標準の inspect 責務が構造確認・path 実在・skill 存在確認までに限定されていることを確認する。
      持続的検査の実装が各適用プロジェクトの責務であり、標準の対象外であることが明記されていることを確認する。
    pass_criteria: |
      標準 inspect 責務の限定と、各プロジェクト責務の分離が明記されている。
    on_failure: |
      fix-and-reverify。SPEC 内容を修正して再確認する。

case_open_hints:
  epic_needed: true
  decomposition: |
    scale: large。以下の関心単位への分解を推奨:
    Wave 1: SPEC 保存（project-extensions.md）+ ADR 作成 + REQ 作成（基盤定義）
    Wave 2: 標準 skill agentdev-project-extensions 実装
    Wave 3: 保守 command /agentdev/inspect-extensions 実装
    Wave 4: 既存 doc-inputs 機構の extensions 移行（30個の doc-input ファイル、31個の command/skill 本文更新、check_doc_inputs.ts → check_extensions.ts、IR-056 更新、inspect-doc-inputs 廃止）
    Wave 5: project-local integrity skill による持続的検査の実装
  wave_hints:
    - "Wave 1 は基盤定義（SPEC+ADR+REQ）であり、後続 Wave の前提"
    - "Wave 2-3 は並列可能（skill と command は独立）"
    - "Wave 4 は Wave 2-3 完了後に実行（移行先機構が完成している必要）"
    - "Wave 5 は Wave 4 完了後に実行（検査対象が確定している必要）"
```

# summary

## 合意内容

RU-20260704-01 に基づき、AgentDevFlow の配布 command/skill 本文をプロジェクト非依存とし、プロジェクト固有の追加・拡張を `.agentdev/extensions/**` 経由で与える project-extensions 機構を定義した。

主な合意項目:
- `.agentdev/doc-inputs/**`（参照リスト）を `.agentdev/extensions/**`（追加・拡張設定層: context/rules/checks/acceptance_gates/must_not）に置換
- 標準 skill `agentdev-project-extensions`、保守 command `/agentdev/inspect-extensions` を新設
- inspect-doc-inputs は inspect-extensions へ統合・改名（ユーザー確定）
- command/skill 本文の ADR/REQ/SPEC 具体参照禁止（文書種別名、extensions 内参照、本文内相互参照は例外）
- project-local skill 委譲（rules/checks の skill: 記述、action/required/fail_on は初期契約から除外）

### 4層の厳密な分離（ユーザー指摘に基づく修正）

AgentDevFlow 標準、各適用プロジェクトの extensions、各適用プロジェクトの project-local skill、agent-dev-flow リポジトリ自身の repo-local skill の4層を厳密に分離した。

AgentDevFlow 標準の責務は「extension 構造・読み込み契約・inspect による構造確認と skill 存在確認」までに限定する。
各適用プロジェクトは自身の `.agentdev/extensions/**` と project-local skill を用意し、rules/checks の中身を定義する。
agent-dev-flow リポジトリ自身は適用プロジェクトの1つとして repo-local skill（repo-agentdev-integrity 等）を使うが、これは標準仕様ではなくローカル運用である。

## 確定事項

全ての未確定事項が解消された（auto_ready: true）:
1. **REQ-0157 の扱い**: retire + 新規 REQ CREATE（親エージェント確定、oracle 高確信度推奨）
2. **ADR-0133 の扱い**: 新規 ADR で supersede（親エージェント確定、oracle 高確信度推奨）
3. **移行方針**: 資産流用を前提とした一括置換（親エージェント確定、oracle 推奨）
4. **inspect-doc-inputs の扱い**: inspect-extensions へ統合・改名（ユーザー確定）
5. **4層分離**: AgentDevFlow 標準の責務を構造・読み込み・inspect・存在確認に限定（ユーザー確定）
