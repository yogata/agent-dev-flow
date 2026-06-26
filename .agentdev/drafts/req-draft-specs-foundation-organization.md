---
draft_type: req_draft
topic_slug: specs-foundation-organization
status: saved
spec_consumed: true
created_at: 2026-06-26T00:00:00Z
source_rus:
  - RU-0002
---

<!-- req_draft テンプレート
  このテンプレートは req-define が生成する構造化引き継ぎ成果物の原本である。
  後続工程（req-save/ spec-save/ case-open/ case-auto/ case-run/ case-close）が参照する
  原本の情報源は # draft-data 内の YAML コードブロックであり、人間可読 Markdown セクションではない。
  soft contract（生成元側標準）であり、LLM 推論経由で消費される。
  厳格なスキーマバージョン、JSON Schema、バリデータは導入しない。 -->

# draft-data

```yaml
# work_type: 要件の分類（bugfix / feature / maintenance / docs_chore）
# workflow_route の派生値は保存せず、work_type + scale から各コマンドが導出する
work_type: feature

# scale: feature のみ standard / large。それ以外は未設定でよい
scale: standard

# summary: 当該 draft が何を合意したかの1段落要約。人間可読補助（処理の正ではない）
summary: |
  agent-dev-flow リポジトリの docs/specs/ 直下の基盤SPEC群を、既存の commands/skills/workflows 層を維持したまま、6つのドメインディレクトリ（foundations/responsibilities/quality/integrity/local/authoring）に体系化する。SPEC 文書種別は増やさず、全面再配置ではなく基盤SPECのドメイン別整理とする。spec-health-metrics.md を quality/ 配下に新設し（RU-1 連携）、integrity-rule-catalog.md の詳細を integrity/rules/ に分離する。既存SPECの移送は段階的かつ個別とし、一括移送を禁止する。この体系化は agent-dev-flow リポジトリ特有であり、consumer プロジェクトへの docs 構成強制は対象外とする。req-impact-map.md（responsibilities/）と workflow-contracts.md（foundations/）の分類先は親エージェント確認済み。

# auto_gate: case-auto 自走可否の判定材料
auto_gate:
  # auto_ready が false の場合、または未解決 item が残る場合、後続コマンドは停止する
  auto_ready: true
  unresolved_questions: []
  unresolved_conflicts: []
  out_of_repo_operations: []
  stop_reasons: []

# agreed_items: 合意された個別項目。artifact_actions.source_items から ID 参照される
# 必要十分な長文として保持し、項目数を増やして短い値を多数並べない
agreed_items:
  - id: AG-001
    content: |
      docs/specs/ 直下の基盤SPEC群を、既存の commands/skills/workflows 層を維持したまま、ドメイン別サブディレクトリに体系化する。全面的な behavior/catalog 分割ではなく、基盤SPECのドメイン別整理とする。SPEC 文書種別は増やさず、CATALOG 等の新文書種別は作らず、既存3層構造（commands/skills/workflows/直下）も壊さない。この体系化は agent-dev-flow リポジトリ特有であり、AgentDevFlow 利用先プロジェクト（consumer）への docs 構成強制は対象外とする。foundation/quality/integrity/local 等のサブディレクトリは agent-dev-flow の内部 SPEC 構造であり、consumer プロジェクトの docs 構成を縛らない。
  - id: AG-002
    content: |
      6つのドメインディレクトリとその責務・配置対象は以下の通り。foundations/（system, document-model, patterns, design-principles 等の基盤モデル）、responsibilities/（document-type-responsibilities, artifact-responsibilities, artifact-contracts 等の文書種別・成果物責務定義）、quality/（quality-specs, quality-gates, req-health-metrics, spec-health-metrics 等の品質・メトリクス）、integrity/（integrity-contracts, integrity-rule-catalog, rule-ownership, docs-spec-rebuild-integrity, backticks-identifier-threshold 等の整合性契約・ルール）、local/（runtime-package-boundary, local-case-file, local-generation, local-transform 等のローカル版仕様）、authoring/（command-file-format 等の執筆規約）。req-impact-map.md と workflow-contracts.md の分類先は RU-0002 の提案構造に明示されておらず、別途親エージェントが確定する（Inferred 仮置き: req-impact-map.md → responsibilities/、workflow-contracts.md → foundations/）。
  - id: AG-003
    content: |
      docs/specs/README.md に直下SPECのドメイン分類方針を明文化し、各SPECがどのドメインに属するかを示す。新規SPEC作成時は document-model.md に定義されたドメイン分類に従って該当ディレクトリに配置する。
  - id: AG-004
    content: |
      spec-health-metrics.md を quality/ 配下に新設する。内容概念（REQ/SPEC 健全性の双方向メトリクス）は RU-1（REQ-0155 文書粒度モデル）で決定済みであり、RU-2 はその配置先（quality/）を決定する。RU-1 が「何を品質メトリクスSPECに入れるか」、RU-2 が「そのSPECをどこに置くか」を担う。既存の req-health-metrics.md（REQ 健全性メトリクス）と対をなす SPEC 健全性メトリクスとして、SPEC の肥大化、放置、ドメイン分類適合を定量的に検出する。
  - id: AG-005
    content: |
      integrity-rule-catalog.md の個別ルール詳細（IR-NNN）は、局所物理分離（REQ-0155-007）として integrity/rules/ サブディレクトリに分離する。integrity-rule-catalog.md はスキーマ定義とルールインデックスを維持し、各ルールの15フィールド詳細は integrity/rules/IR-NNN-{slug}.md に配置する。
  - id: AG-006
    content: |
      既存直下SPECのドメインディレクトリへの移送は、inspect/backlog 経由で段階的かつ個別に行う。一括移送を禁止する。移送の優先順位は inspect/backlog で決定する。移送時、旧パスを参照する文書（README.md、DOC-MAP.md、他SPEC内の相対リンク等）の参照先を移送単位で更新する。
  - id: AG-007
    content: |
      RU-1（REQ-0155 文書粒度モデル: 流入制御・粒度ゲート・全レポジトリ共通）と RU-2（docs/specs/ 直下の配置体系: agent-dev-flow リポジトリ特有）は関心が異なり、同一 RU に統合しない。適用順序は RU-1 先（粒度制御・分類確定）、RU-2 次（受け皿整理）とする。

# artifact_actions: REQ/ADR/SPEC への保存対象を成果物別ではなく1つの配列に統合
# 1 action = 1 artifact × 1 editing concern（REQ-ID 単位でも箇条書き1行単位でもない）
# 同一関心の複数 agreed items は単一 action に複数段落の content としてまとめる
artifact_actions:
  - id: ACT-REQ-001
    artifact: req
    operation: create
    target: new:specs-foundation-organization
    source_items: [AG-001, AG-002, AG-003, AG-004, AG-005, AG-006, AG-007]
    content: |
      ---
      id: REQ-0156
      title: "docs/specs 基盤SPECドメイン別体系化"
      created: "2026-06-26"
      updated: "2026-06-26"
      ---

      ## 目的

      agent-dev-flow リポジトリの docs/specs/ 直下の基盤SPEC群をドメイン別に体系化し、分類軸を明確にする。基盤SPECが横並びで分類軸を持たない現状を解消し、各SPECの所属ドメインと責務を明文化する。この体系化は agent-dev-flow リポジトリ特有であり、AgentDevFlow 利用先プロジェクト（consumer）の docs 構成を縛らない。

      ## 要件

      | ID | 要件 |
      |---|---|
      | REQ-0156-001 | docs/specs/ 直下の基盤SPECは、既存の commands/skills/workflows 層を維持したまま、ドメイン別に分類・体系化されること |
      | REQ-0156-002 | ドメイン分類の各ディレクトリの責務と配置対象が document-model.md に定義されること |
      | REQ-0156-003 | docs/specs/README.md に直下SPECのドメイン分類方針が明文化され、各SPECの所属ドメインが示されること |
      | REQ-0156-004 | 新規SPEC作成時は document-model.md に定義されたドメイン分類に従って該当ディレクトリに配置されること |
      | REQ-0156-005 | 既存直下SPECの移送は段階的かつ個別に行われ、一括移送を禁止すること |
      | REQ-0156-006 | SPEC の移送時、旧パスを参照する文書の参照先は移送単位で更新されること |
      | REQ-0156-007 | SPEC 健全性メトリクス（spec-health-metrics）が品質ドメイン配下に存在すること。内容概念は REQ-0155（文書粒度モデル）で決定された REQ/SPEC 健全性の双方向メトリクスに基づくこと |
      | REQ-0156-008 | 整合性ルールカタログの詳細ルールが、局所物理分離（REQ-0155-007）として integrity ドメイン配下のサブディレクトリに分離されること |
      | REQ-0156-009 | CATALOG 等の新規文書種別を新設せず、既存 SPEC 文書種別内でのディレクトリ整理として完結すること |

      ## 適用範囲

      - **対象**: agent-dev-flow リポジトリの docs/specs/ 直下基盤SPEC群のドメイン別体系化、document-model.md へのドメイン定義追加、docs/specs/README.md の分類方針追加、spec-health-metrics の品質ドメイン配下新設、整合性ルール詳細のサブディレクトリ分離、既存SPECの段階移送方針
      - **対象外**: AgentDevFlow 利用先プロジェクト（consumer）への docs 構成強制、commands/skills/workflows 層の再編、全文書体系の一括再編、CATALOG 新文書種別の新設、intake/learning パイプライン変更（REQ-0155 責務）、REQ/SPEC 粒度ゲート（REQ-0155 責務）、SPEC 内部の挙動/カタログ論理区分（REQ-0155 責務）

      ## 関連情報

      - **関連 REQ**: REQ-0155（文書粒度モデル: 流入制御・粒度ゲート・局所物理分離許容）、REQ-0101（文書・REQ管理基準）、REQ-0108（整合性検査: req-impact-map.md 起源）、REQ-0154（SPEC status 追跡と draft 放置検出: spec-health-metrics.md 連携）
      - **関連 ADR**: ADR-0103（文書種別責務境界、記述対象境界: docs/specs/ は agent-dev-flow 専用内部設計文書）、ADR-0104（実行時独立性: SPEC 非依存）
      - **関連 SPEC**: document-model.md（ドメイン別体系化の規範記述先）、specs/README.md（分類方針記述先）、req-health-metrics.md（REQ 健全性メトリクス: spec-health-metrics.md の対番）

  - id: ACT-SPEC-001
    artifact: spec
    operation: spec-update
    target: docs/specs/document-model.md
    target_area: "## docs/specs/ 直下のドメイン別体系化（agent-dev-flow リポジトリ）"
    source_items: [AG-001, AG-002, AG-004, AG-005, AG-006]
    content: |
      ## docs/specs/ 直下のドメイン別体系化（agent-dev-flow リポジトリ）

      agent-dev-flow リポジトリの docs/specs/ 直下の基盤SPECは、既存の commands/skills/workflows 層を維持したまま、以下の6つのドメインディレクトリに分類・体系化する（REQ-0156-001）。全面的な behavior/catalog 分割ではなく、基盤SPECのドメイン別整理である。この体系化は agent-dev-flow リポジトリ特有であり、AgentDevFlow 利用先プロジェクトの docs 構成を縲らない。

      ### ドメインディレクトリと責務

      | ディレクトリ | 責務 | 配置対象SPEC |
      |---|---|---|
      | foundations/ | 基盤モデル、システム構成、文書フォーマット、設計原則、縮小済みワークフロー契約 | system.md, document-model.md, patterns.md, design-principles.md, workflow-contracts.md（縮小済み旧版） |
      | responsibilities/ | 文書種別責務、成果物責任、アーティファクト契約、REQ影響マップ | document-type-responsibilities.md, artifact-responsibilities.md, artifact-contracts.md, req-impact-map.md |
      | quality/ | 品質仕様、品質ゲート、健全性メトリクス（REQ/SPEC 双方向） | quality-specs.md, quality-gates.md, req-health-metrics.md, spec-health-metrics.md |
      | integrity/ | 整合性契約、整合性ルールカタログ、ルール所有権、配布物整合性、backticks 判定閾値 | integrity-contracts.md, integrity-rule-catalog.md, rule-ownership.md, docs-spec-rebuild-integrity.md, backticks-identifier-threshold.md |
      | local/ | ローカル版 SPEC 群（実行時パッケージ境界、Case ファイル、生成、変換） | runtime-package-boundary.md, local-case-file.md, local-generation.md, local-transform.md |
      | authoring/ | コマンドファイル執筆規約 | command-file-format.md |

      ### 分類確定ファイル（親エージェント確認済み）

      以下のファイルは RU-0002 の提案構造に明示されていなかったが、親エージェントにより分類先が確定した。

      | ファイル | 分類先 | 根拠 |
      |---|---|---|
      | req-impact-map.md | responsibilities/ | REQ → アーティファクト影響マッピングであり、責務・影響追跡の位置づけ。artifact-responsibilities.md、artifact-contracts.md と同領域 |
      | workflow-contracts.md | foundations/ | 縮小済み旧版であり、基盤的なワークフロー契約の残存。内容の大部分は workflows/workflow-contracts.md へ移管済み。廃止・統合の検討は段階移送方針に従い別途 inspect-docs で行う |

      ### 整合性ルールの局所物理分離

      integrity-rule-catalog.md の個別ルール（IR-NNN）は integrity/rules/ サブディレクトリに分離する（REQ-0156-008, REQ-0155-007）。integrity-rule-catalog.md はスキーマ定義とルールインデックスを維持し、各ルールの15フィールド詳細は integrity/rules/IR-NNN-{slug}.md に配置する。

      ### SPEC 健全性メトリクス

      spec-health-metrics.md を quality/ 配下に配置する（REQ-0156-007）。req-health-metrics.md と対となる SPEC 健全性の定量メトリクスを定義する。内容概念（REQ/SPEC 健全性の双方向メトリクス）は REQ-0155 で決定された。

      ### 段階移送方針

      既存直下SPECのドメインディレクトリへの移送は、inspect/backlog 経由で段階的かつ個別に行う（REQ-0156-005）。一括移送を禁止する。移送の優先順位は inspect/backlog で決定する。移送時、旧パスを参照する文書（README.md、DOC-MAP.md、他SPEC内の相対リンク等）の参照先を移送単位で更新する（REQ-0156-006）。

      新規SPEC作成時は、本セクションのドメイン分類に従って該当ディレクトリに配置する（REQ-0156-004）。

  - id: ACT-SPEC-002
    artifact: spec
    operation: spec-update
    target: docs/specs/README.md
    target_area: "### 基盤 SPEC 一覧（specs/ 直下）"
    source_items: [AG-001, AG-002, AG-003]
    content: |
      ### 基盤 SPEC 一覧（specs/ 直下）

      基盤 SPEC は agent-dev-flow リポジトリの内部構造に従い、以下の6つのドメインディレクトリに分類・体系化する（REQ-0156-001, REQ-0156-003）。各ドメインの責務と配置対象の詳細は [document-model.md](document-model.md)「docs/specs/ 直下のドメイン別体系化」を参照。

      #### foundations/（基盤モデル）

      | SPEC | タイトル | 責務 |
      |------|---------|------|
      | foundations/system.md | システム仕様 | コマンドシステムの構成定義、運用モデル |
      | foundations/document-model.md | 文書モデル | REQ/ADR/SPEC/guides/DOC-MAP の責務マトリックス、ドメイン別体系化規範 |
      | foundations/patterns.md | 文書フォーマット規約 | frontmatter 規約、REQ/SPEC/guides の記述形式 |
      | foundations/design-principles.md | 設計原則 | アーキテクチャ設計原則 |
      | foundations/workflow-contracts.md | ワークフロー契約（旧版、縮小済み） | 個別動作は各 command/skill SPEC および workflows/ へ移管済み |

      #### responsibilities/（文書種別・成果物責務）

      | SPEC | タイトル | 責務 |
      |------|---------|------|
      | responsibilities/document-type-responsibilities.md | 文書種別責務、配置基準 | 文書品質ゲート原本仕様、文書種別責務 |
      | responsibilities/artifact-responsibilities.md | 成果物責任表 | 各成果物種別の正規所有者と責務 |
      | responsibilities/artifact-contracts.md | アーティファクト契約 | Command/Skill/Template/Script の入出力、依存方向 |
      | responsibilities/req-impact-map.md | REQ 影響マップ | 各現行 REQ が影響する整合性ルールとアーティファクト（分類先: responsibilities/、親エージェント確認済み） |

      #### quality/（品質・メトリクス）

      | SPEC | タイトル | 責務 |
      |------|---------|------|
      | quality/quality-specs.md | 品質仕様 | 品質基準、検証ルール |
      | quality/quality-gates.md | 品質ゲート | QG-1〜QG-4 定義、機械化境界 |
      | quality/req-health-metrics.md | REQ 健全性メトリクス | REQ 肥大化、関心ズレ検出の定量閾値 |
      | quality/spec-health-metrics.md | SPEC 健全性メトリクス | SPEC 肥大化、放置、ドメイン分類適合の定量閾値（REQ-0156-007 新設） |

      #### integrity/（整合性契約・ルール）

      | SPEC | タイトル | 責務 |
      |------|---------|------|
      | integrity/integrity-contracts.md | 整合性契約 | strict/heuristic/observation 分類と検査カテゴリ |
      | integrity/integrity-rule-catalog.md | 整合性ルールカタログ | スキーマ定義とルールインデックス（詳細は rules/ へ分離） |
      | integrity/rules/ | 整合性ルール詳細 | IR-NNN 個別ルールの15フィールド詳細（局所物理分離: REQ-0155-007） |
      | integrity/rule-ownership.md | ルール所有権マトリックス | ルールドメインと責任 REQ/SPEC の対応 |
      | integrity/docs-spec-rebuild-integrity.md | 配布物整合性検査ルール | 配布物 ID 除去後の品質保持 |
      | integrity/backticks-identifier-threshold.md | backticks 識別子/一般名詞 判定閾値 | backticks 必須と任意の機械判定閾値 |

      #### local/（ローカル版 SPEC）

      | SPEC | タイトル | 責務 |
      |------|---------|------|
      | local/runtime-package-boundary.md | 実行時パッケージ境界 | リポジトリ種別別 .opencode/ 定義、命名規約 |
      | local/local-case-file.md | ローカル Case ファイル | ローカル版 Case ファイルスキーマ、状態遷移 |
      | local/local-generation.md | ローカル版 OpenCode 生成 | link mode 接続フロー、更新運用 |
      | local/local-transform.md | ローカル版 OpenCode 変換プロンプト | 変換品質検証の読み替え |

      #### authoring/（執筆規約）

      | SPEC | タイトル | 責務 |
      |------|---------|------|
      | authoring/command-file-format.md | コマンドファイルフォーマット規約 | command 定義ファイルの Markdown 構成標準 |

      > 上記分類は段階的に適用する。既存直下SPECの移送は inspect/backlog 経由で個別に行い、一括移送しない（REQ-0156-005）。移送完了まで旧パスと新パスが混在する期間がある。

  - id: ACT-SPEC-003
    artifact: spec
    operation: spec-create
    target: new:spec-health-metrics
    source_items: [AG-004]
    content: |
      ---
      title: SPEC 健全性メトリクス
      status: draft
      created: 2026-06-26
      updated: 2026-06-26
      ---

      # SPEC 健全性メトリクス

      SPEC の肥大化、関心ズレ、放置を定量的に検出するための閾値を定義する。
      req-health-metrics.md と対となる SPEC 健全性の定量メトリクスであり、REQ/SPEC 健全性の双方向メトリクスを構成する（REQ-0155-001, REQ-0156-007）。

      ## 適用範囲

      - **対象**: docs/specs/ 配下の SPEC ファイル（commands/, skills/, workflows/, ドメインディレクトリ配下）
      - **対象外**: REQ, ADR, guides, DOC-MAP, .agentdev/ 配下のドラフト

      ## 測定対象と計測方法

      | メトリクス | 定義 | 計測方法 |
      |---|---|---|
      | SPEC 行数 | SPEC ファイルの本文行数 | frontmatter、HTML コメントを除く本文行数 |
      | status 放置期間 | draft status の SPEC が最終更新から現在までの日数 | frontmatter updated 日付から現在までの日数 |
      | ドメイン分類適合 | SPEC が document-model.md のドメイン分類に従って配置されているか | ファイルパスと document-model.md ドメイン定義の照合 |

      ## 閾値とシグナル

      ### SPEC 行数

      | SPEC 行数 | シグナル | 判定 |
      |---|---|---|
      | 0〜300 | +0 | 健全 |
      | 301〜500 | +1 | 肥大化傾向。分割検討 |
      | 501 以上 | +2 | 肥大化。分割推奨 |

      ### status 放置期間（draft SPEC）

      | 放置期間 | シグナル | 判定 |
      |---|---|---|
      | 0〜30 日 | +0 | 健全 |
      | 31〜90 日 | +1 | 放置傾向。case-close での昇格を促進 |
      | 91 日以上 | +2 | 放置。IR-054 対象 |

      ### ドメイン分類適合

      | 状態 | シグナル | 判定 |
      |---|---|---|
      | ドメイン分類に適合 | +0 | 健全 |
      | ドメイン未分類（直下残留） | +1 | 分類候補。inspect/backlog で移送検討 |

      ## 他 SPEC、スキルとの関係

      - **req-health-metrics.md**: REQ 健全性メトリクス。本 SPEC は SPEC 健全性メトリクスとして対をなす（REQ/SPEC 双方向メトリクス）
      - **document-model.md**: ドメイン分類の定義元。本 SPEC のドメイン分類適合判定が参照する
      - **integrity-rule-catalog.md IR-054**: draft SPEC 放置検出ルール。本 SPEC の放置期間閾値と連動する
      - **REQ-0154**: SPEC status 追跡と draft 放置検出。本 SPEC の放置期間メトリクスと連動する

      ## 機械化境界

      本 SPEC は閾値の定義のみを提供し、計測、判定の実装は以下が担う:

      - **inspect-docs / inspect-skills**: 定期診断で本 SPEC の閾値を適用
      - **case-close**: draft → accepted 昇格時に放置期間をリセット

      本 SPEC 自体は計測ロジックを実装しない。
      閾値の変更は本 SPEC の更新をもって正とし、各実装は本 SPEC を参照する。

# conflict_resolutions: 壁打ちで解消された衝突の記録
# 記録済みの衝突について、後続コマンドは同じ内容をユーザーへ再確認しない
conflict_resolutions:
  - id: CR-001
    conflict: "RU-2 と REQ-0155（RU-1）の関心境界。両者は docs/specs/ 体系化に関連するが、関心対象が異なる（RU-1=流入制御・粒度モデル・全レポジトリ共通、RU-2=配置体系・agent-dev-flow 特有）。同一 RU への統合が検討された。"
    resolution: "関心が異なるため統合しない。RU-1 は REQ-0155 として実装済み（PR #1211 MERGED）。RU-2 は独立 REQ（REQ-0156）として新設する。適用順序は RU-1 先（粒度制御・分類確定）、RU-2 次（受け皿整理）。REQ-0155-007 が局所物理分離を許容しており、RU-2 はその agent-dev-flow リポジトリへの具体適用である。"
  - id: CR-002
    conflict: "req-impact-map.md のドメイン分類先が RU-0002 の提案構造に明示されていない。候補: responsibilities/（責務・影響マッピング）または integrity/（整合性ルールカタログの同伴）。"
    resolution: "Confirmed（親エージェント確認済み）: responsibilities/ に確定。根拠: req-impact-map.md は REQ → アーティファクト影響マッピングであり、artifact-responsibilities.md、artifact-contracts.md と同領域の責務追跡文書。"
  - id: CR-003
    conflict: "workflow-contracts.md のドメイン分類先が RU-0002 の提案構造に明示されていない。候補: foundations/（基盤契約）または廃止検討（内容は workflows/workflow-contracts.md へ移管済み）。"
    resolution: "Confirmed（親エージェント確認済み）: foundations/ に確定。根拠: 縮小済み旧版であり、残存内容は基盤的なワークフロー契約。廃止・統合の検討は段階移送方針に従い別途 inspect-docs で行う。"

# operation_units: 複数RU入力時の統合/分離結果。単一REQ操作の場合も1件の OU として出力
operation_units:
  - ou_id: OU-001
    source_ru: RU-0002
    target_req: REQ-0156
    operation: create
    scale: standard
    depends_on: []
    recommended_order: 1
    issue_policy: single
    result: {}
  - ou_id: OU-002
    source_ru: RU-0002
    target_spec: docs/specs/document-model.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-003
    source_ru: RU-0002
    target_spec: docs/specs/README.md
    operation: spec-update
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}
  - ou_id: OU-004
    source_ru: RU-0002
    target_spec: new:spec-health-metrics
    operation: spec-create
    scale: standard
    depends_on: []
    recommended_order: 2
    issue_policy: single
    result: {}

# test_strategy: 各合意項目（AG-*）の検証方法。各項目は3要素（verification / pass_criteria / on_failure）を必須とする
# on_failure（不合格時の処置）を持たない検証項目は test_strategy に含めないこと（REQ-0102-075）
# 項目識別子: TS-NNN 形式（NNNは3桁ゼロ埋め連番）
# on_failure アクション種別: fix-and-reverify（実装を修正して再検証）/ record-in-findings（Findings に out-of-scope として記録）
test_strategy:
  - id: TS-001
    target_item: AG-001
    verification: |
      document-model.md に「docs/specs/ 直下のドメイン別体系化」セクションが存在し、6つのドメインディレクトリ（foundations/responsibilities/quality/integrity/local/authoring）が定義されていることを確認する。commands/skills/workflows 層が維持されていることも確認する。
    pass_criteria: |
      6つのドメインディレクトリが定義され、既存3層構造が維持されていること。SPEC 文書種別の増加（CATALOG 等）がないこと。
    on_failure: |
      fix-and-reverify: document-model.md のセクションを修正して再確認する。
  - id: TS-002
    target_item: AG-002
    verification: |
      document-model.md のドメイン定義セクションで、各ディレクトリの責務と配置対象SPECが定義されていることを確認する。RU-0002 の提案構造と照合し、配置対象が漏れなく記載されていることを確認する。
    pass_criteria: |
      全6ディレクトリの責務と配置対象SPECが定義されていること。req-impact-map.md と workflow-contracts.md の分類先が明記されていること（Informed 仮置きを含む）。
    on_failure: |
      fix-and-reverify: document-model.md のドメイン定義を修正して再確認する。
  - id: TS-003
    target_item: AG-003
    verification: |
      docs/specs/README.md の「基盤 SPEC 一覧」セクションがドメイン別分類に更新され、各SPECの所属ドメインが示されていることを確認する。
    pass_criteria: |
      基盤SPEC一覧が6ドメイン別に分類され、各SPECの所属が明示されていること。
    on_failure: |
      fix-and-reverify: docs/specs/README.md の分類表を修正して再確認する。
  - id: TS-004
    target_item: AG-004
    verification: |
      quality/spec-health-metrics.md が存在し、SPEC 健全性メトリクス（SPEC 行数、status 放置期間、ドメイン分類適合）の閾値が定義されていることを確認する。req-health-metrics.md との双方向関係が文書内で明記されていることを確認する。
    pass_criteria: |
      quality/spec-health-metrics.md が存在し、3つの測定メトリクスと閾値が定義されていること。REQ-0155 への参照が含まれること。
    on_failure: |
      fix-and-reverify: spec-health-metrics.md の内容を修正して再確認する。
  - id: TS-005
    target_item: AG-005
    verification: |
      integrity/rules/ サブディレクトリが存在し、個別ルール（IR-NNN）の詳細が配置されていることを確認する。integrity-rule-catalog.md がスキーマ定義とルールインデックスを維持していることを確認する。
    pass_criteria: |
      integrity/rules/ に個別ルールファイルが配置され、integrity-rule-catalog.md がインデックスとして機能していること。
    on_failure: |
      fix-and-reverify: integrity/rules/ の構成を修正して再確認する。※詳細なルール抽出は case-run 実装工程の対象であり、本検証は構造の存在確認を最小限とする。
  - id: TS-006
    target_item: AG-006
    verification: |
      既存直下SPECの移送が段階的かつ個別に行われていることを確認する。移送は inspect/backlog 経由で行われ、一括移送が発生していないことを確認する。移送されたSPECの旧パス参照が更新されていることを確認する。
    pass_criteria: |
      一括移送が発生していないこと。移送されたSPECについて、旧パスを参照する文書の参照先が更新されていること。
    on_failure: |
      record-in-findings: 段階移送は継続的な作業（inspect/backlog 経由）であり、本 RU の完了時に全移送が完了している必要はない。一括移送が発生した場合は out-of-scope として Findings に記録し、個別移送に差し替える。

# adr_judgement: ADR 要否判断結果（agentdev-adr-guidelines 準拠）
adr_judgement:
  needed: false
  reason: |
    docs/specs/ 直下のドメイン別ディレクトリ化は directory 規約（命名規約、ディレクトリ構造規則）であり、ADR 作成禁止条件（agentdev-adr-guidelines「ADR を作成してはならない条件」#4: 命名規約、directory 規約）に該当する。既存 SPEC（document-model.md）の適用範囲に収まり、REQ-0155-007 が既に局所物理分離（*-rules.md 併設、integrity-rules/ サブディレクトリ）を許容し「具体配置は各レポジトリの document-model.md に従う」と確立済みである。技術判断（技術スタック選定、アーキテクチャパターン、データモデル、認証スキーム等）を含まず、可逆的な文書構成変更である。
  false_negative_check: |
    文書体系を制約する決定ではあるが、(1) ADR 禁止条件（directory 規約）に明確該当、(2) REQ-0155-007 が既に原理を確立済み、(3) ADR-0103 が docs/specs/ を agent-dev-flow 専用内部設計文書と位置づけ済み、の三点から False negative リスクは低い。本件は REQ-0155-007 の具体適用（agent-dev-flow リポジトリの document-model.md への記述）であり、新規アーキテクチャ判断ではない。
  existing_adr_overlap: |
    ADR-0103（文書種別責務境界、記述対象境界）と関連するが、ADR-0103 は文書種別（REQ/ADR/SPEC/guides/DOC-MAP）の責務境界を定めるものであり、docs/specs/ 内部のディレクトリ構成は「各リポジトリの document-model.md に従う」と各リポジトリに委ねられている。重複なし。ADR-0104（実行時独立性）は SPEC ファイルが実行時配布物の依存先でないことを宣言しており、docs/specs/ のディレクトリ再編は実行時影響を持たない。

# split_forecast: 新規ドラフトの健全性メトリクス計測（req-health-metrics.md 閾値準拠）
split_forecast:
  target: draft
  thresholds_ref: docs/specs/req-health-metrics.md
  metrics:
    requirement_line_count: 9
    concern_classification_count: 0
    artifact_type_count: 2
    spec_separation_violation: 0
  signals:
    line_count: 0
    concern_classification: 0
    artifact_type: 0
    spec_separation: 0
  total_signal: 0
  recommended_action: "no-action / APPEND許可（新規 REQ の場合、単一 REQ として作成可能。SPLIT 不要）"
  notes: |
    要件行数 9 行（0〜50 範囲: +0）。関心分類数 0（docs/specs/ 直下体系化の単一関心: +0）。アーティファクト種別数 2（REQ + SPEC: +0）。SPEC 分離基準違反 0（ディレクトリ名・ファイルマッピング等の具体値は SPEC へ分離済み: +0）。合計シグナル 0 で SPLIT 不要。

# case_open_hints: case-open 構成生成への参考情報（Issue 階層は case-open が決定する）
case_open_hints:
  epic_needed: false
  decomposition: null
  wave_hints:
    - "OU-001（REQ 作成）を先頭に実行し、REQ-0156 を確定する"
    - "OU-002/003/004（SPEC 更新・作成）は並行可能。document-model.md 更新、specs/README.md 更新、spec-health-metrics.md 新設は互いに独立"
    - "既存SPECの段階移送（inspect/backlog 経由）は別 Issue / 別 Wave として扱う（本 RU の direct scope 外、継続作業）"
```

# summary

## 合意内容の要約

RU-0002（docs/specs 基盤SPEC体系化）の要件定義ドラフト。agent-dev-flow リポジトリの docs/specs/ 直下の基盤SPEC群を6つのドメインディレクトリ（foundations/responsibilities/quality/integrity/local/authoring）に体系化する。既存の commands/skills/workflows 層は維持し、直下のみを整理する。spec-health-metrics.md を quality/ 配下に新設し（RU-1 連携）、integrity-rule-catalog.md の詳細を integrity/rules/ に分離する。移送は段階的・個別とし、一括移送を禁止する。

## RU-1（REQ-0155）との境界

REQ-0155（RU-1: 文書粒度モデル）は流入制御・粒度ゲート・全レポジトリ共通。REQ-0156（RU-2: docs/specs 基盤SPECドメイン別体系化）は配置体系・agent-dev-flow リポジトリ特有。REQ-0155-007 が局所物理分離を許容し「具体配置は各レポジトリの document-model.md に従う」と確立済みであり、RU-2 はその agent-dev-flow リポジトリへの具体適用である。関心が異なるため同一 REQ には統合しない。

## ADR 判断

ADR 不要。directory 規約（ADR 作成禁止条件 #4）に該当し、REQ-0155-007 が原理を確立済み、ADR-0103 が docs/specs/ を内部設計文書と位置づけ済み。技術判断を含まず、可逆的な文書構成変更。

## 確認済み事項（親エージェント）

以下2ファイルのドメイン分類先は RU-0002 の提案構造に明示されていなかったが、親エージェントにより確定した。

### req-impact-map.md: responsibilities/

REQ → アーティファクト影響マッピングであり、artifact-responsibilities.md、artifact-contracts.md と同領域の責務追跡文書。

### workflow-contracts.md: foundations/

縮小済み旧版であり、残存内容は基盤的なワークフロー契約。廃止・統合の検討は段階移送方針に従い別途 inspect-docs で行う（一括決定しない）。

## split_forecast

合計 SPLIT シグナル 0（要件行数 9 / 関心分類 0 / 成果物種別 2 / SPEC 分離違反 0）。単一 REQ として作成可能、SPLIT 不要。
