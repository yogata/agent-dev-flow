---
draft_type: req_draft
topic_slug: artifact-graph
status: saved
spec_actions_consumed: true
created_at: "2026-08-06T21:30:00+09:00"
source_rus:
  - RU-0001
---

<!-- req_draft テンプレート
  このテンプレートは req-define が生成する構造化引き継ぎ成果物の原本である。
  後続工程（req-save/ spec-save/ case-open/ case-auto/ case-run/ case-close）が参照する
  原本の情報源は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。
  soft contract（生成元側標準）であり、LLM 推論経由で消費される。
  厳格なスキーマバージョン、JSON Schema、バリデータは導入しない。 -->

# draft-data

```yaml
work_type: feature

scale: large

summary: |
  AgentDevFlow 本体リポジトリに限定して、REQ/ADR/SPEC/command/skill/extension 間の明示関係を検索できる Artifact Graph を導入する。Artifact Graph は正規情報の代替ではなく、関連成果物と根拠箇所を発見する派生索引として扱う。生成、検査、問い合わせ処理はリポジトリ固有 skill（`.opencode/skills/repo-agentdev-artifact-graph/`）が所有し、既存 Project Extensions の `rules.skill`/`checks.skill` 委譲経路で各コマンド、skill へ統合する。配布契約（`src/opencode/commands/**`、`src/opencode/skills/**`）は変更せず、専用 extension ディレクトリ、専用グラフDB、ベクトルDB、embeddings を導入しない。導入効果は最低10件の代表質問と DOC-MAP/rg 基準結果との比較で検証する。REQ 影響なし（`req_impact: no`）のため REQ は作成せず、安定した振る舞い契約を `docs/specs/local/artifact-graph.md`（挙動SPEC）へ定義する。

auto_gate:
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

agreed_items:
  - id: AG-001
    content: |
      Artifact Graph は正規情報の代替ではなく、関連成果物と根拠箇所を発見する派生索引として扱う。生成、検査、問い合わせ処理はリポジトリ固有 skill（`.opencode/skills/repo-agentdev-artifact-graph/`）が所有する。既存 Project Extensions 契約に従い、`req-define`、`spec-save`、`case-open`、`case-run`、`case-close` の各 command extension と `agentdev-deep-review` skill extension が `rules.skill` または `checks.skill` から `repo-agentdev-artifact-graph` へ委譲する。専用 extension ディレクトリ（`.agentdev/extensions/artifact-graph/`）は新設しない。新しい extension loader または独自の読込方式は導入しない。

  - id: AG-002
    content: |
      正規情報として `docs/requirements/`、`docs/adr/`、`docs/specs/`、`src/opencode/`、`.opencode/`、`.agentdev/extensions/`、その他の実装、検査、テストを入力する。派生索引として `.agentdev/graph/` 配下に `manifest.json`、`nodes.jsonl`、`edges.jsonl`、`provenance.jsonl`、`diagnostics.json` を生成する。`.agentdev/graph/` は手編集せず、正規情報として扱わない。

  - id: AG-003
    content: |
      初期対象ノードは requirement、adr、specification、integrity_rule、command、skill、extension、source_file の8種とする。初期対象関係は `references`、`supersedes`、`defined_in`、`contains`、`extends`、`delegates_to`、`governs` の7種とする。関係は `declared`（宣言された関係）と `derived`（正規情報から導出した関係）を対象とし、意味的に推定する `inferred` は予約値にとどめて初期実装では生成しない。初期利用範囲は、関連文書の候補取得、明示参照に基づく変更影響候補の取得、未解決参照の検出、廃止済み成果物への参照検出、直接関係・指定深度・2ノード間経路の問い合わせ、根拠ファイルと根拠箇所の提示、明示された所有者・識別子・関係に基づく構造的重複候補の検出、孤立候補・循環関係・過度に集中したノードの観測とする。

  - id: AG-004
    content: |
      抽出元は YAML フロントマター、既知の構造化 field、Markdown リンク、extension の `id`/`context.paths`/`rules.skill`/`checks.skill`、既知の見出しまたは表内にある識別子、自由文中の裸の識別子、の順で段階導入する。初期実装では1から4を必須対象とする。5は対象文書と記法を限定して導入し、6は誤検出評価が完了するまで対象外とする。現行成果物、廃止済み成果物、`v2:` で識別される過去版、コードブロック内の例示、検出規則を説明する識別子を区別する。

  - id: AG-005
    content: |
      すべてのノードと関係から、`path`、`heading`、`element_id`、`matched_text`、`matched_text_hash`、`line_start`、`line_end`、`extraction_rule` の根拠情報を取得できるようにする。`path`、見出し、要素 ID、抽出文字列のハッシュを安定した根拠識別に使用し、行番号は人が根拠へ移動するための補助情報として要素の主識別子には使用しない。

  - id: AG-006
    content: |
      `manifest.json` は `schema_version`、`generator_version`、`input_digest`、`indexed_paths`、`excluded_paths` を保持する。現在時刻を表す `generated_at` は決定論的生成物に含めず、必要な実行日時は標準出力または実行報告へ記録する。`input_digest` は対象入力ファイルの相対パスと内容から計算する。`.agentdev/graph/**`、`.git/**`、ビルド成果物、キャッシュ、一時ファイル、作業ツリー固有の管理ファイルは入力から除外する。同じ入力から生成した5ファイル（`manifest.json`、`nodes.jsonl`、`edges.jsonl`、`provenance.jsonl`、`diagnostics.json`）はバイト単位で同一になるようにする。

  - id: AG-007
    content: |
      試行期間中は `.agentdev/graph/**` を Git 管理対象外とする。生成物はローカルまたは CI で再生成し、実行報告には件数と診断結果を記録する。グラフ本体を Git 管理するかどうかは、差分量と利用効果を測定した後に別課題で判断する。

  - id: AG-008
    content: |
      `req-define`、`spec-save`、`case-open`、`case-run`、`case-close`、`agentdev-deep-review` は、それぞれ既存REQ/関連ADRとSPEC/構造的所有者重複、対応REQ/同じ正規所有対象を持つSPEC/関連command・skill・整合性ルール、起点成果物から到達できる変更影響/廃止参照/未解決参照、実装対象に関係するREQ/SPEC/整合性ルール/周辺成果物、鮮度/未解決参照/存在しないノードへの関係/根拠欠落/関係閉包候補、複数規範関係/循環/集中ノード/孤立候補/複数経路の論点、の候補取得に Artifact Graph を利用できる。グラフ結果を変更対象、操作単位、要件充足、責務重複の確定根拠として使用しない。グラフから候補を取得した後、根拠ファイルを読み、`rg` などの別手段で補完、反証してから判断する。

  - id: AG-009
    content: |
      実装前に最低10件の代表的な探索質問と、DOC-MAP、`rg` による現行結果を記録する。初回生成後、同じ質問に対する Artifact Graph の結果を比較する。評価対象は、抽出漏れ、誤った候補、根拠到達率、探索操作数、生成失敗時の標準ワークフロー継続とする。

artifact_actions:
  - id: ACT-SPEC-001
    artifact: spec
    operation: create
    target_spec:
      operation: create
      domain: local
      slug: artifact-graph
    target_area:
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007, AG-008, AG-009]
    spec_logical_division: behavior
    canonical_owner: repo-agentdev-artifact-graph
    content: |
      ---
      title: Artifact Graph（本体リポジトリ固有派生索引）
      status: draft
      created: 2026-08-06
      updated: 2026-08-06
      spec_logical_division: behavior
      canonical_owner: repo-agentdev-artifact-graph
      ---

      # Artifact Graph（本体リポジトリ固有派生索引）

      ## 目的

      AgentDevFlow 本体リポジトリに限って、成果物間の明示関係を検索できる Artifact Graph を導入する。Artifact Graph は正規情報の代替ではなく、関連成果物と根拠箇所を発見する派生索引として扱う。初期導入により、関連文書探索、明示参照に基づく変更影響候補の取得、未解決参照と廃止済み成果物への参照の検出、成果物間の経路探索、根拠箇所の提示を可能にする。

      ## 所有と配置

      生成、検査、問い合わせ処理は、リポジトリ固有 skill である `.opencode/skills/repo-agentdev-artifact-graph/` が所有する。既存 Project Extensions 契約に従い、必要な規則または検査を次の既存 extension へ追加し、`rules.skill` または `checks.skill` から `repo-agentdev-artifact-graph` へ委譲する。

      - `.agentdev/extensions/commands/req-define.yaml`
      - `.agentdev/extensions/commands/spec-save.yaml`
      - `.agentdev/extensions/commands/case-open.yaml`
      - `.agentdev/extensions/commands/case-run.yaml`
      - `.agentdev/extensions/commands/case-close.yaml`
      - `.agentdev/extensions/skills/agentdev-deep-review.yaml`

      専用の extension ディレクトリ（`.agentdev/extensions/artifact-graph/`）は新設しない。新しい extension loader または独自の読込方式は導入しない。配布物（`src/opencode/commands/**`、`src/opencode/skills/**`）へ Artifact Graph 固有処理または固有依存を追加しない。

      ## 正規情報と生成物

      次を正規情報として入力する。

      - `docs/requirements/`
      - `docs/adr/`
      - `docs/specs/`
      - `src/opencode/`
      - `.opencode/`
      - `.agentdev/extensions/`
      - その他の実装、検査、テスト

      次を派生索引として `.agentdev/graph/` 配下に生成する。

      - `manifest.json`
      - `nodes.jsonl`
      - `edges.jsonl`
      - `provenance.jsonl`
      - `diagnostics.json`

      `.agentdev/graph/` は手編集せず、正規情報として扱わない。

      ## グラフモデル

      ### 初期対象ノード

      - requirement
      - adr
      - specification
      - integrity_rule
      - command
      - skill
      - extension
      - source_file

      ### 初期対象関係

      - `references`
      - `supersedes`
      - `defined_in`
      - `contains`
      - `extends`
      - `delegates_to`
      - `governs`

      ### 関係カテゴリ

      関係は `declared`（宣言された関係）と `derived`（正規情報から導出した関係）を対象とする。意味的に推定する `inferred` は予約値にとどめ、初期実装では生成しない。

      ### 初期利用範囲

      初期実装は次を扱う。

      - 関連文書の候補取得
      - 明示参照に基づく変更影響候補の取得
      - 未解決参照の検出
      - 廃止済み成果物への参照検出
      - 直接関係、指定深度、2ノード間経路の問い合わせ
      - 根拠ファイルと根拠箇所の提示
      - 明示された所有者、識別子、関係に基づく構造的重複候補の検出
      - 孤立候補、循環関係、過度に集中したノードの観測

      ## 抽出契約

      ### 抽出順序

      抽出元は次の順で段階導入する。

      1. YAML フロントマター
      2. 既知の構造化 field
      3. Markdown リンク
      4. extension の `id`、`context.paths`、`rules.skill`、`checks.skill`
      5. 既知の見出しまたは表内にある識別子
      6. 自由文中の裸の識別子

      初期実装では 1 から 4 を必須対象とする。5 は対象文書と記法を限定して導入し、6 は誤検出評価が完了するまで対象外とする。

      ### 成果物の版区別

      現行成果物、廃止済み成果物、`v2:` で識別される過去版、コードブロック内の例示、検出規則を説明する識別子を区別する。

      ## 根拠追跡

      すべてのノードと関係から、次の根拠情報を取得できるようにする。

      - `path`
      - `heading`
      - `element_id`
      - `matched_text`
      - `matched_text_hash`
      - `line_start`
      - `line_end`
      - `extraction_rule`

      `path`、見出し、要素 ID、抽出文字列のハッシュを安定した根拠識別に使用する。行番号は人が根拠へ移動するための補助情報とし、要素の主識別子には使用しない。

      ## 決定論性と鮮度

      `manifest.json` は少なくとも次を保持する。

      - `schema_version`
      - `generator_version`
      - `input_digest`
      - `indexed_paths`
      - `excluded_paths`

      現在時刻を表す `generated_at` は決定論的生成物に含めず、必要な実行日時は標準出力または実行報告へ記録する。`input_digest` は対象入力ファイルの相対パスと内容から計算する。

      `.agentdev/graph/**`、`.git/**`、ビルド成果物、キャッシュ、一時ファイル、作業ツリー固有の管理ファイルは入力から除外する。

      同じ入力から生成した 5 ファイル（`manifest.json`、`nodes.jsonl`、`edges.jsonl`、`provenance.jsonl`、`diagnostics.json`）はバイト単位で同一になるようにする。

      ## Git管理

      試行期間中は `.agentdev/graph/**` を Git 管理対象外とする。生成物はローカルまたは CI で再生成し、実行報告には件数と診断結果を記録する。グラフ本体を Git 管理するかどうかは、差分量と利用効果を測定した後に別課題で判断する。

      ## ワークフロー利用

      各コマンド、skill は次の候補取得に Artifact Graph を利用できる。

      - `req-define`: 既存REQ、関連ADRとSPEC、構造的所有者重複の候補取得
      - `spec-save`: 対応REQ、同じ正規所有対象を持つSPEC、関連command、skill、整合性ルールの候補取得
      - `case-open`: 起点成果物から到達できる変更影響、廃止参照、未解決参照の候補取得
      - `case-run`: 実装対象に関係するREQ、SPEC、整合性ルール、周辺成果物の候補取得
      - `case-close`: 鮮度、未解決参照、存在しないノードへの関係、根拠欠落、関係閉包候補の観測
      - `agentdev-deep-review`: 複数規範関係、循環、集中ノード、孤立候補、複数経路の論点抽出

      ### 利用上の防護

      グラフ結果を変更対象、操作単位、要件充足、責務重複の確定根拠として使用しない。グラフから候補を取得した後、根拠ファイルを読み、`rg` などの別手段で補完、反証してから判断する。構造的重複候補と意味的な責務重複を区別する。グラフ不在を「影響なし」とする判断を行わない。

      ## 障害耐性

      グラフが存在しない場合も標準ワークフローが従来どおり続行する。グラフが古い場合は再生成するか、古い状態であることを明示して補助利用に限定する。グラフ生成失敗だけを理由に標準ワークフローを恒常的に停止しない。

      ## 効果検証

      実装前に最低 10 件の代表的な探索質問と、DOC-MAP、`rg` による現行結果を記録する。初回生成後、同じ質問に対する Artifact Graph の結果を比較する。評価対象は、抽出漏れ、誤った候補、根拠到達率、探索操作数、生成失敗時の標準ワークフロー継続とする。

      ## 対象外

      - consumer リポジトリへの導入
      - ADF 標準機能への昇格
      - `src/opencode/commands/**`、`src/opencode/skills/**` への Artifact Graph 固有処理の追加、固有依存の追加
      - `.agentdev/extensions/artifact-graph/` の新設
      - 新しい extension loader または独自の読込方式
      - Neo4j などの専用グラフDB
      - embeddings 生成と外部ベクトルストア
      - Microsoft GraphRAG ランタイム
      - LLM による全面的な関係抽出
      - 文章の意味が類似する責務重複の決定論的な確定
      - 明示参照が存在しない影響の網羅保証
      - グラフ不在を「影響なし」とする判断
      - グラフ生成失敗による標準ワークフローの恒常的停止
      - 初期段階での checker、test、draft、Issue 関連成果物の全面グラフ化
      - 効果検証前の Artifact Graph 固有検査のマージゲート化

      ## 正規所有者とアンカー

      | 関心 | 正規所有者またはアンカー |
      |---|---|
      | リポジトリ固有の生成、検査、問い合わせ | `.opencode/skills/repo-agentdev-artifact-graph/` |
      | command固有の追加利用規則 | `.agentdev/extensions/commands/<command>.yaml` |
      | skill固有の追加利用規則 | `.agentdev/extensions/skills/<skill>.yaml` |
      | 派生索引 | `.agentdev/graph/` |
      | Project Extensions の配置と読込契約 | `docs/specs/foundations/project-extensions.md` |
      | extension の決定論的検査 | `docs/specs/integrity/rules/IR-056-project-extensions-integrity.md` |
      | 文書種別と正規情報の責務境界 | `docs/specs/foundations/document-model.md` |
      | RU 契約 | `docs/specs/responsibilities/artifact-contracts.md` |

      既存の解析、索引生成、整合性検査処理を調査し、再利用可能な処理を重複実装しない。

conflict_resolutions:
  - id: CR-001
    conflict: |
      元計画（RU Source Summary 参照）の配置パス（`docs/req/`、`docs/spec/`、`.agentdev/extensions/artifact-graph/`）が現行リポジトリ構成（`docs/requirements/`、`docs/adr/`、`docs/specs/`、Project Extensions 読込対象外の独立 extension ディレクトリ）と不一致だった。
    resolution: |
      文書入力を実配置（`docs/requirements/`、`docs/adr/`、`docs/specs/`）へ修正し、実装をリポジトリ固有 skill（`.opencode/skills/repo-agentdev-artifact-graph/`）へ配置した。ワークフロー組込みは既存の command、skill 単位の extension からリポジトリ固有 skill へ委譲する方式へ変更した。併せて、初期効果を明示参照と構造的診断へ限定し、代表質問による効果測定、抽出元の段階化、現在時刻を含まない決定論的出力、安定した根拠識別、試行期間中の生成物 Git 管理対象外を追加した。RU Source Summary で合意済み。

operation_units:
  - ou_id: OU-001
    source_ru: RU-0001
    target_spec:
      operation: create
      domain: local
      slug: artifact-graph
    operation: create
    scale: large
    depends_on: []
    recommended_order: 1
    issue_policy: epic
    result: {}

test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      `.opencode/skills/repo-agentdev-artifact-graph/` が生成、検査、問い合わせの skill として存在すること、6件の既存 extension（req-define、spec-save、case-open、case-run、case-close、agentdev-deep-review）から `repo-agentdev-artifact-graph` への委譲記述（`rules.skill` または `checks.skill`）が存在することを確認する。`.agentdev/extensions/artifact-graph/` が存在しないことを確認する。
    pass_criteria: |
      skill ディレクトリと SKILL.md が存在し、6 extension 全てに委譲記述があり、専用 extension ディレクトリが存在しないこと。
    on_failure: |
      不足する skill、extension、委譲記述を追加して再検証する（fix-and-reverify）。

  - id: TS-002
    target_item: AG-001
    verification: |
      `src/opencode/commands/**` と `src/opencode/skills/**` の差分を確認し、Artifact Graph 固有の変更が含まれていないことを確認する。
    pass_criteria: |
      配布物（`src/opencode/commands/**`、`src/opencode/skills/**`）に Artifact Graph 固有の変更が存在しないこと。
    on_failure: |
      配布物への混入を取り除いて再検証する（fix-and-reverify）。

  - id: TS-003
    target_item: AG-002
    verification: |
      Artifact Graph 生成スクリプトを実行し、入力対象（`docs/requirements/`、`docs/adr/`、`docs/specs/`、`src/opencode/`、`.opencode/`、`.agentdev/extensions/`）が正規情報として読み込まれ、`.agentdev/graph/` 配下に5ファイル（`manifest.json`、`nodes.jsonl`、`edges.jsonl`、`provenance.jsonl`、`diagnostics.json`）が生成されることを確認する。
    pass_criteria: |
      宣言した入力対象が全て読み込まれ、5ファイルが生成されること。
    on_failure: |
      入力対象または生成処理の不備を修正して再検証する（fix-and-reverify）。

  - id: TS-004
    target_item: AG-003
    verification: |
      生成された `nodes.jsonl`、`edges.jsonl` を検査し、初期対象として宣言した8種のノードと7種の関係が生成されていることを確認する。
    pass_criteria: |
      宣言した8種のノード型と7種の関係型が少なくとも1件以上生成されること。`inferred` カテゴリの関係が生成されないこと。
    on_failure: |
      抽出規則の不備を修正して再検証する（fix-and-reverify）。

  - id: TS-005
    target_item: AG-004
    verification: |
      対象とする構造化記法（フロントマター、構造化 field、Markdown リンク、extension の id/paths/skill）を含む既知テストデータで抽出を実行し、期待するノードと関係が全て抽出されることを確認する。
    pass_criteria: |
      既知テストデータに対する抽出漏れが存在しないこと。
    on_failure: |
      抽出規則の不備を修正して再検証する（fix-and-reverify）。

  - id: TS-006
    target_item: AG-005
    verification: |
      生成されたノードと関係の各エントリが、`path`、`heading`、`element_id`、`matched_text`、`matched_text_hash`、`line_start`、`line_end`、`extraction_rule` の根拠情報を保持していることを確認する。代表質問の結果から根拠ファイルと根拠要素へ到達できることを確認する。
    pass_criteria: |
      全ノード・全関係が根拠情報を持ち、代表質問の根拠ファイル到達率が100%であること。
    on_failure: |
      根拠追跡の不備を修正して再検証する（fix-and-reverify）。

  - id: TS-007
    target_item: AG-006
    verification: |
      同じ入力から2回グラフを生成し、`manifest.json`、`nodes.jsonl`、`edges.jsonl`、`provenance.jsonl`、`diagnostics.json` の5ファイルがバイト単位で一致することを確認する。
    pass_criteria: |
      同じ入力から生成した5ファイルがバイト単位で完全に一致すること。
    on_failure: |
      非決定論的要因（ソート順、ハッシュ計算、パス正規化等）を特定して除去し、再検証する（fix-and-reverify）。

  - id: TS-008
    target_item: AG-006
    verification: |
      異なる時刻に同じ入力からグラフを生成し、生成物間に現在時刻だけを理由とする差分が発生しないことを確認する。
    pass_criteria: |
      現在時刻だけを理由とする差分が発生しないこと。
    on_failure: |
      タイムスタンプの混入箇所を特定して除去し、再検証する（fix-and-reverify）。

  - id: TS-009
    target_item: AG-006
    verification: |
      `manifest.json` の `input_digest` が、対象入力ファイルの相対パスと内容から計算されていることを確認する。`.agentdev/graph/**`、`.git/**`、ビルド成果物、キャッシュ、一時ファイルが入力から除外されていることを確認する。
    pass_criteria: |
      `input_digest` により入力の鮮度を判定でき、除外対象が入力に含まれないこと。
    on_failure: |
      digest 計算または除外設定の不備を修正して再検証する（fix-and-reverify）。

  - id: TS-010
    target_item: AG-007
    verification: |
      `.gitignore` または Git 管理状態を確認し、試行期間中に `.agentdev/graph/**` が Git 管理対象外になっていることを確認する。
    pass_criteria: |
      `.agentdev/graph/**` が Git 管理対象外であること。
    on_failure: |
      Git 管理設定を修正して再検証する（fix-and-reverify）。

  - id: TS-011
    target_item: AG-008
    verification: |
      グラフが存在しない状態、グラフが古い状態、グラフ生成が失敗した状態のそれぞれで、標準ワークフロー（req-define、spec-save、case-open、case-run、case-close、agentdev-deep-review）が従来どおり継続することを確認する。
    pass_criteria: |
      グラフ不在、古いグラフ、生成失敗のいずれの状態でも標準ワークフローが恒常的に停止しないこと。古いグラフは再生成または古い状態であることを明示して補助利用に限定されること。
    on_failure: |
      障害耐性の不備を修正して再検証する（fix-and-reverify）。

  - id: TS-012
    target_item: AG-008
    verification: |
      SPEC 本文に、グラフ結果を変更対象、操作単位、要件充足、責務重複の確定根拠として使用しない利用規則が明記されていることを確認する。構造的重複候補と意味的な責務重複を区別する記述が存在することを確認する。
    pass_criteria: |
      利用規則が明記され、構造的重複と意味重複の区別が記述されていること。
    on_failure: |
      SPEC 本文の記述を補完して再検証する（fix-and-reverify）。

  - id: TS-013
    target_item: AG-009
    verification: |
      最低10件の代表探索質問と DOC-MAP、`rg` による基準結果が記録されていることを確認する。初回生成後、同じ質問に対する Artifact Graph の結果を比較し、抽出漏れ、誤った候補、根拠到達率、探索操作数を評価する。
    pass_criteria: |
      代表質問で重大な関係の見逃しがないこと。代表質問の根拠ファイル到達率が100%であること。代表質問に対する誤った候補が全候補の10%以下であること。10問中8問以上で DOC-MAP と `rg` だけを使う場合より探索操作が減ること。
    on_failure: |
      抽出規則または照合方法の不備を特定して修正し、再検証する（fix-and-reverify）。効果検証の設計自体に起因する out-of-scope 事象は Findings に記録する（record-in-findings）。

review_dispositions:
  - id: RD-001
    source_ru: RU-0001
    source_item: RU-0001.対象.現行構成に従う実装配置
    disposition: partially_covered
    reason_code: implementation_detail_separated
    reason: |
      RU 第2節の実装配置（skill 内のファイル構造、scripts/ 配下のスクリプト群）は実装詳細であり、振る舞い契約を SPEC（ACT-SPEC-001）へ配置した上で、具体的ファイル構造とスクリプト実装は case-run で扱う。SPEC は振る舞い契約に集中し、ファイル構造の列挙は実装詳細として分離した。
    evidence:
      path: .agentdev/drafts/req-draft-artifact-graph.md
      section: ACT-SPEC-001
      checked_at_commit: null
    related_removed_items: []

  - id: RD-002
    source_ru: RU-0001
    source_item: RU-0001.要件化の方向.実装段階
    disposition: not_applicable
    reason_code: case_run_concern
    reason: |
      RU 第6節の7フェーズ実装計画（現状確認→スキーマ定義→実装→テストデータ→extension統合→効果検証→第2段階判断）は case-open/case-run の実行計画責務であり、要件 doc の保存対象ではない。case_open_hints に Wave 構成の参考情報として記録した。
    evidence:
      path: .agentdev/drafts/req-draft-artifact-graph.md
      section: case_open_hints
      checked_at_commit: null
    related_removed_items: []

  - id: RD-003
    source_ru: RU-0001
    source_item: RU-0001.正規所有者とアンカー.既存索引生成
    disposition: covered
    reason_code: captured_in_spec
    reason: |
      RU 第4節が挙げる既存索引生成（`.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts`）の再利用可能性調査は、SPEC 本文「正規所有者とアンカー」節に「既存の解析、索引生成、整合性検査処理を調査し、再利用可能な処理を重複実装しない」として取り込んだ。個別スクリプトの再利用判断は case-run の実装詳細とする。
    evidence:
      path: .agentdev/drafts/req-draft-artifact-graph.md
      section: ACT-SPEC-001.正規所有者とアンカー
      checked_at_commit: null
    related_removed_items: []

case_open_hints:
  epic_needed: true
  decomposition: |
    実装を3 Wave へ分解することを推奨する。Wave 構成、Issue 分割、依存関係の最終決定は case-open が行う。
  wave_hints:
    - wave: 1
      label: コア実装
      scope: 現行構造確認、スキーマ定義（schema.yaml/extraction.yaml）、生成（build_graph.ts）、検査（check_graph.ts）、問い合わせ（query_graph.ts）の実装
      depends_on: []
    - wave: 2
      label: 統合
      scope: 初回生成と既知関係のテストデータ化、鮮度判定（check_freshness.ts）、6件の既存 extension への必要最小限組込み
      depends_on: [1]
    - wave: 3
      label: 効果検証
      scope: 最低10件の代表質問と DOC-MAP/rg 基準結果の記録、Artifact Graph 結果との比較、第2段階判断資料の作成
      depends_on: [2]
```

# summary

本 draft は RU-0001（本体リポジトリ固有 Artifact Graph 導入）を要件定義したものである。

REQ 影響なし（`req_impact: no`）のため REQ は作成せず、安定した振る舞い契約を `docs/specs/local/artifact-graph.md`（挙動SPEC、正規所有者: `repo-agentdev-artifact-graph`）へ新規作成する。配布物（`src/opencode/commands/**`、`src/opencode/skills/**`）は変更せず、既存 Project Extensions の委譲経路で統合する。

実装規模は `large` と判定し、コア実装、統合、効果検証の3 Wave 分解を推奨する。Epic 構成、Issue 分割の最終決定は case-open が行う。

後続工程は `artifact: spec` の存在により spec-save から開始する（`artifact: req`/`adr` を含まないため req-save は経由しない）。
