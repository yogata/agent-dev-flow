# SPEC インデックス

SPEC ファイルは現行アーキテクチャの正規文書である（REQ-001）。
システムが現在「どうなっているか」を記述し、満たすべき成果を定義する REQ ファイルとは対比される。

> **リポジトリ内部設計文書**: SPEC ファイルは agent-dev-flow リポジトリのリポジトリ内部設計文書である。
> 実行時配布対象ではなく、実行時コマンドは本ファイル群に依存しない（charter 原則、DEC-001）。

## SPEC status 追跡情報源

本ファイルが SPEC の `status`（draft / accepted / superseded）を視認する単一の追跡情報源である。
後述の各 SPEC 一覧表の `status` 列で全 SPEC のライフサイクル状態を集約表示する。
基盤SPEC（6ドメイン配下）の status を含め、全 SPEC の status を追跡対象とする。

- **情報源**: 本ファイル（`docs/specs/README.md`）のみ
- **status 値**: `draft` / `accepted` / `superseded` の3つ。`superseded` は `superseded_by` で後継SPECを明示する
- **更新タイミング**: spec-save（draft 保存）、case-close（draft から accepted への昇格）の各工程で本ファイルの status 列を更新する。基盤SPEC も同一工程に従う
- **欠落扱い**: `status` frontmatter を持たない SPEC は表中で `-` で示す。`-` の SPEC は status 付与を要する（対象 SPEC は spec-save / case-close で順次 status を付与する）

draft status の SPEC が一定期間更新されず放置されることを検出するルール（IR-054）は [integrity-rule-catalog.md](integrity/integrity-rule-catalog.md) 参照。
基盤SPEC も IR-054 の検出対象に含む。

### 基盤SPEC 一覧表の status 列

基盤SPEC 一覧表（foundations/、responsibilities/、quality/、integrity/、local/、authoring/ の6表）は command/skill/workflow SPEC 一覧表と同じ `status` 列を持つこと。各基盤SPEC の初期 status は以下に従う:

- 既に lifecycle に沿って draft→accepted 昇格が確認済みの SPEC（例: quality/spec-health-metrics.md）は `accepted`
- 上記以外は現状の frontmatter `status` 値（`draft` または欠落時は `-`）

初期 status 値の確定は spec-save 工程で行い、本一覧表へ反映する。

### 新規 SPEC 追加時の index 登録手順

新規 SPEC ファイルを `docs/specs/` 配下に作成した場合（spec-save 完了後）、本ファイルの該当一覧表へ当該 SPEC の行を登録する。
登録漏れを docs-check で検出する。

**タイミング**: spec-save が新規 SPEC を作成した直後。
既存 SPEC への追記（UPDATE）では行を追加せず、status 列のみ更新する。

**登録先一覧表の特定**: SPEC の配置ディレクトリに基づき、対応する一覧表へ登録する。

| SPEC 配置ディレクトリ | 登録先の一覧表 |
|---|---|
| `specs/commands/` | 「command SPEC 一覧」表 |
| `specs/skills/` | 「skill SPEC 一覧」表 |
| `specs/workflows/` | 「横断 SPEC 一覧」表 |
| `specs/foundations/` | 「基盤 SPEC 一覧」> foundations/ 表 |
| `specs/responsibilities/` | 「基盤 SPEC 一覧」> responsibilities/ 表 |
| `specs/quality/` | 「基盤 SPEC 一覧」> quality/ 表 |
| `specs/integrity/` | 「基盤 SPEC 一覧」> integrity/ 表 |
| `specs/local/` | 「基盤 SPEC 一覧」> local/ 表 |
| `specs/authoring/` | 「基盤 SPEC 一覧」> authoring/ 表 |

**登録内容**: SPEC パス（相対リンク）、`status`（spec-save 新規作成時は `draft`）、タイトル、責務の概要。

**docs-check 検出仕組み**: docs-check は `docs/specs/**/*.md` の実ファイルと本ファイルの一覧表エントリを突き合わせし、一覧表に未登録の SPEC ファイルを検出する。
`_template.md` はテンプレートのため検出対象外とする。
SPEC ファイルのドメイン間移送が発生した場合は旧ドメイン表から行を削除し、新ドメイン表へ登録する。
`references/` サブディレクトリの SPEC（詳細・実装固有事項）は親 SPEC 行の備考欄で言及し、独立行としては登録しない。

### audits/・baselines/ の Report 位置づけ

`docs/specs/integrity/audits/`（監査記録）と `docs/specs/integrity/baselines/`（監査 baseline snapshot）のファイルは SPEC ではなく Report（document-model の Report 分類）として位置づける。

- 両ディレクトリのファイルは本 README の一覧表へ独立行として登録しない（SPEC ではないため docs-check の SPEC 突合対象外）
- 索引導線は、該当 SPEC 行の備考欄または本文の関連情報節での言及、および AUTOGEN 計測表の計測行で担保する
- AUTOGEN 計測表（spec-health-metrics「SPEC 計測例」）は `docs/specs/` 配下の `.md` をファイル単位で計測するため、Report ファイルも計測行として計上される。ただし計測行であることは SPEC としての位置づけを与えない
- 配置は document-model の Report 分類が許容する現行配置（integrity/ 配下）を維持し、移動しない

## 3 層構造と基盤 6 ドメイン

SPEC は commands / skills / workflows の 3 層ディレクトリ構造と、基盤 6 ドメイン（foundations / responsibilities / quality / integrity / local / authoring）を持つ。
横断 SPEC（`workflows/`）は共通契約のみを扱い、個別 command / skill の現在動作は代替しない。
基盤 6 ドメインの直下に主要 SPEC を配置し、詳細・実装固有事項は `references/` サブディレクトリへ分離する（Wave 3 再構築）。

| 層 / ドメイン | 配置先 | 役割 |
|---|---|---|
| commands/ | `specs/commands/<command-name>.md` | 各 `/agentdev/*` コマンド専用 SPEC |
| skills/ | `specs/skills/<skill-name>.md` | 各 `agentdev-*` スキル専用 SPEC |
| workflows/ | `specs/workflows/<topic>.md`、`specs/workflows/references/*.md` | 複数コマンド、スキルにまたがる共通契約。詳細アルゴリズムは `references/` |
| foundations/ | `specs/foundations/*.md`、`specs/foundations/references/*.md` | 文書モデル、フォーマット、設計原則、harness 分離、Project Extensions。具体抽象化等の詳細は `references/` |
| responsibilities/ | `specs/responsibilities/*.md` | 文書種別責務、アーティファクト契約、責務境界 |
| quality/ | `specs/quality/*.md` | 品質基準、品質ゲート、健全性メトリクス |
| integrity/ | `specs/integrity/*.md`、`specs/integrity/references/*.md`、`specs/integrity/rules/*.md` | 整合性契約、ルールカタログ、IR-NNN 個別ルール。実装固有詳細は `references/`、個別ルールは `rules/` |
| local/ | `specs/local/*.md` | ローカル版 SPEC（link mode、Case ファイル、パッケージ境界） |
| authoring/ | `specs/authoring/*.md` | 執筆規約（コマンドファイルフォーマット等） |

### command SPEC 一覧（`specs/commands/`）

| SPEC | status | 責務 |
|------|--------|------|
| [commands/_template.md](commands/_template.md) | accepted | command SPEC テンプレート |
| [commands/req-define.md](commands/req-define.md) | accepted | `/agentdev/req-define` |
| [commands/req-save.md](commands/req-save.md) | accepted | `/agentdev/req-save` |
| [commands/spec-save.md](commands/spec-save.md) | accepted | `/agentdev/spec-save` |
| [commands/case-open.md](commands/case-open.md) | accepted | `/agentdev/case-open` |
| [commands/case-run.md](commands/case-run.md) | accepted | `/agentdev/case-run` |
| [commands/case-close.md](commands/case-close.md) | accepted | `/agentdev/case-close` |
| [commands/case-auto.md](commands/case-auto.md) | accepted | `/agentdev/case-auto` |
| [commands/case-update.md](commands/case-update.md) | accepted | `/agentdev/case-update` |
| [commands/intake-capture.md](commands/intake-capture.md) | accepted | `/agentdev/intake-capture` |
| [commands/intake-from-github.md](commands/intake-from-github.md) | accepted | `/agentdev/intake-from-github` |
| [commands/intake-promote.md](commands/intake-promote.md) | accepted | `/agentdev/intake-promote` |
| [commands/learning-promote.md](commands/learning-promote.md) | accepted | `/agentdev/learning-promote` |
| [commands/backlog-review.md](commands/backlog-review.md) | accepted | `/agentdev/backlog-review` |
| [commands/inspect-docs.md](commands/inspect-docs.md) | accepted | `/agentdev/inspect-docs` |
| [commands/inspect-skills.md](commands/inspect-skills.md) | accepted | `/agentdev/inspect-skills` |
| [commands/inspect-promote.md](commands/inspect-promote.md) | accepted | `/agentdev/inspect-promote` |
| [commands/backlog-auto.md](commands/backlog-auto.md) | accepted | `/agentdev/backlog-auto` |
| [commands/inspect-extensions.md](commands/inspect-extensions.md) | superseded | `/agentdev/inspect-extensions`（DEC-006 により廃止。extension 検査は docs-check / inspect-skills / inspect-promote の3層責務分離へ移管） |

`/repo/docs-check` は repo-local、配布対象外のため対象外。

### skill SPEC 一覧（`specs/skills/`）

| SPEC | status | 分類 | 責務 |
|------|--------|------|------|
| [skills/_template.md](skills/_template.md) | accepted | template | skill SPEC テンプレート |
| [skills/agentdev-doc-writing.md](skills/agentdev-doc-writing.md) | accepted | 中核 | 文書品質ゲート |
| [skills/agentdev-req-analysis.md](skills/agentdev-req-analysis.md) | accepted | 中核 | 要件分析 |
| [skills/agentdev-req-file-manager.md](skills/agentdev-req-file-manager.md) | accepted | 中核 | REQ ファイル管理 |
| [skills/agentdev-req-structure-diagnostics.md](skills/agentdev-req-structure-diagnostics.md) | accepted | 中核 | REQ 構造診断 |
| [skills/agentdev-artifact-graph.md](skills/agentdev-artifact-graph.md) | draft | 中核 | Artifact Graph 標準配布スキル（生成、検査、問い合わせ、open extensibility、augmentation） |
| [skills/agentdev-decision-file-manager.md](skills/agentdev-decision-file-manager.md) | accepted | 中核 | Decision ファイル管理 |
| [skills/agentdev-decision-guidelines.md](skills/agentdev-decision-guidelines.md) | accepted | 中核 | Decision 要否判定 |
| [skills/agentdev-architecture-advisory.md](skills/agentdev-architecture-advisory.md) | accepted | 中核 | アーキテクチャ助言 |
| [skills/agentdev-workflow-orchestration.md](skills/agentdev-workflow-orchestration.md) | accepted | 中核 | ワークフロー orchestration |
| [skills/agentdev-workflow-routing.md](skills/agentdev-workflow-routing.md) | accepted | 中核 | ワークフロー routing |
| [skills/agentdev-workflow-lifecycle.md](skills/agentdev-workflow-lifecycle.md) | accepted | 中核 | ワークフロー lifecycle |
| [skills/agentdev-workflow-templates.md](skills/agentdev-workflow-templates.md) | accepted | 中核 | ワークフロー templates |
| [skills/agentdev-spec-file-manager.md](skills/agentdev-spec-file-manager.md) | draft | 中核 | SPEC ファイル管理（作成、更新、配置判断、target_area、SPEC 固有整合性、SPEC 固有 script 呼出契約） |
| [skills/agentdev-doc-diagnostics.md](skills/agentdev-doc-diagnostics.md) | draft | 中核 | docs 横断診断カテゴリ、共通証拠構造、finding 出力契約、文書種別別診断へのルーティング |
| [skills/agentdev-artifact-validation.md](skills/agentdev-artifact-validation.md) | draft | 中核 | 文書種別横断の決定的検証 script と共有 lib の所有、公開検証契約、JSON 結果契約 |
| [skills/agentdev-case-run-execution-adapter.md](skills/agentdev-case-run-execution-adapter.md) | accepted | 補助 | case-run 外部実行 adapter |
| [skills/agentdev-issue-management.md](skills/agentdev-issue-management.md) | accepted | 補助 | Issue 管理 |
| [skills/agentdev-epic-tracker.md](skills/agentdev-epic-tracker.md) | accepted | 補助 | Epic 進捗追跡 |
| [skills/agentdev-gh-cli.md](skills/agentdev-gh-cli.md) | accepted | 補助 | gh CLI 手続き委譲 |
| [skills/agentdev-git-worktree.md](skills/agentdev-git-worktree.md) | accepted | 補助 | git worktree 操作 |
| [skills/agentdev-intake-pipeline.md](skills/agentdev-intake-pipeline.md) | accepted | 補助 | intake pipeline |
| [skills/agentdev-learning-capture.md](skills/agentdev-learning-capture.md) | accepted | 補助 | learning capture |
| [skills/agentdev-learning-pipeline.md](skills/agentdev-learning-pipeline.md) | accepted | 補助 | learning pipeline |
| [skills/agentdev-quality-gates.md](skills/agentdev-quality-gates.md) | accepted | 補助 | quality gates |
| [skills/agentdev-inspect-skills.md](skills/agentdev-inspect-skills.md) | accepted | 補助 | inspect-skills |
| [skills/agentdev-command-authoring.md](skills/agentdev-command-authoring.md) | accepted | 補助 | command authoring |
| [skills/agentdev-command-creator.md](skills/agentdev-command-creator.md) | accepted | 補助 | command creator |
| [skills/agentdev-conventional-commits.md](skills/agentdev-conventional-commits.md) | accepted | 補助 | conventional commits |
| [skills/agentdev-skill-authoring.md](skills/agentdev-skill-authoring.md) | accepted | 補助 | skill authoring |
| [skills/agentdev-backlog-integration.md](skills/agentdev-backlog-integration.md) | accepted | 補助 | backlog integration |
| [skills/agentdev-project-extensions.md](skills/agentdev-project-extensions.md) | accepted | 補助 | project extensions 読み込み |
| [skills/agentdev-deep-review.md](skills/agentdev-deep-review.md) | superseded | 補助 | 敵対的審議型レビュー（Deep Review）の振る舞い契約。agentdev-adversarial-review SPEC へ後継移行済み（superseded_by: agentdev-adversarial-review.md） |
| [skills/agentdev-adversarial-review.md](skills/agentdev-adversarial-review.md) | accepted | 補助 | 対論型レビュー（adversarial review）の振る舞い契約、レビュー手続き、責務構造。3論理役割、動的レビュー戦略、対称的相互反証、戦略メタ反証、合意候補再検証、read-only 境界を所有 |
| [skills/agentdev-git-worktree-test-fallback.md](skills/agentdev-git-worktree-test-fallback.md) | draft | 補助 | worktree 構造系テスト fallback 契約（junction 未設定時の src/opencode/ fallback、構造的制約の明示） |
| [skills/agentdev-workflow-backlog-auto.md](skills/agentdev-workflow-backlog-auto.md) | accepted | 中核 | backlog-auto workflow 実装本体（orchestration stage 構成、直列化契約、fan-in 判定、resume 契約） |

`repo-agentdev-integrity` は repo-local、配布対象外のため対象外。

### 横断 SPEC 一覧（`specs/workflows/`）

| SPEC | status | タイトル | 責務 |
|------|--------|---------|------|
| [workflows/workflow-contracts.md](workflows/workflow-contracts.md) | accepted | ワークフロー契約（横断） | パイプライン概要、共通フェーズ、SSoT 遷移、実装分類、case-auto と case-run の委譲モデル、result 4状態契約 |
| [workflows/workflow-skill-model.md](workflows/workflow-skill-model.md) | draft | Workflow Skill Model | Command / Workflow Skill / Capability Skill の責務、依存方向、1:N分割基準、配置契約。DEC-010 実装詳細 |
| [workflows/step-reference-contract.md](workflows/step-reference-contract.md) | draft | STEP Reference Contract | STEP reference 構造、開始条件、結果、証拠、完了確認、べき等性。DEC-011 実装詳細 |
| [workflows/input-resolution-and-durable-state.md](workflows/input-resolution-and-durable-state.md) | draft | Input Resolution and Durable State | 入力解決優先順位、永続状態、current STEP 再構成、並列child task 復元。DEC-011 入力解決・永続状態側面 |
| [workflows/delegation-contracts.md](workflows/delegation-contracts.md) | accepted | サブエージェント委譲契約 | 委譲時最小契約、委譲種別、制約、manager-orchestrator 分離 |
| [workflows/capture-boundaries.md](workflows/capture-boundaries.md) | accepted | キャプチャ境界 | intake / learning 境界、Split Rule、PR 本文永続チャネル |
| [workflows/epic-wave-model.md](workflows/epic-wave-model.md) | accepted | Epic / Wave / Issue 実行モデル | OU 階層、子Issue 状態 enum、Wave スケジューリング、execution_unit 構成契約、orchestration stage モデル、per-Epic 単一書き手 |
| [workflows/backlog-artifact-lifecycle.md](workflows/backlog-artifact-lifecycle.md) | accepted | RU / 採用済み成果物 / draft lifecycle | artifact lifecycle、検出事項プロトコル、artifact_actions 工程分岐 |
| [workflows/references/execution-unit-construction.md](workflows/references/execution-unit-construction.md) | accepted | execution_unit 構成アルゴリズム参照 | epic-wave-model.md から参照される連結成分アルゴリズム、3軸判断モデルの機械的判定手順 |

### 基盤 SPEC 一覧（6 ドメイン配下）

基盤 SPEC は agent-dev-flow リポジトリの内部構造に従い、以下の6つのドメインディレクトリに分類、体系化する（REQ-001、charter 原則）。
各基盤SPEC の status は後述の status 列で追跡する。
各ドメインの責務と配置対象の詳細は [document-model.md](foundations/document-model.md)「docs/specs/ 直下のドメイン別体系化」を参照。

#### foundations/（基盤モデル）

主要 SPEC と `references/` サブディレクトリで構成する。
`references/` には親 SPEC から参照される詳細・抽象化事項を配置する（Wave 3 再構築）。

| SPEC | status | タイトル | 責務 |
|------|--------|---------|------|
| foundations/numbering-policy.md | accepted | 採番管理 SPEC | REQ/Decision/IR の識別子採番規則、欠番維持、決定的採番スクリプトとの協調 |
| foundations/system.md | accepted | システム仕様 | コマンドシステムの構成定義、運用モデル |
| foundations/document-model.md | accepted | 文書モデル | REQ/Decision/SPEC/guides の責務マトリックス、ドメイン別体系化規範 |
| foundations/decision-lifecycle.md | draft | Decision Lifecycle | Decision 関係モデル（relates-to / supersedes / reaffirms）、粒度管理規則、健全性評価モデル。document-model.md「Decision ライフサイクル詳細」から参照される詳細を正規所有 |
| foundations/patterns.md | accepted | 文書フォーマット規約 | frontmatter、ID 体系、命名規則、URL 参照形式、共通フォーマット規約（本文構造・執筆規約寄り内容は authoring/ への移管候補、実移管は case-run で判断） |
| foundations/design-principles.md | accepted | 設計原則 | アーキテクチャ設計原則 |
| foundations/project-extensions.md | accepted | Project Extensions | 実行時プロジェクト固有追加・拡張機構（`.agentdev/extensions/**`）、extension schema、実行時読み込み契約、project-local skill 委譲、配布物具体参照禁止（REQ-002） |
| foundations/harness-separation-model.md | accepted | harness 分離モデル | 配布物と harness 実行制御の責務分離モデル。配布物の大多数を harness 非依存とし、依存具体を references/ へ集約 |
| foundations/traceability-model.md | draft | Traceability Information Model（TIM）語彙カタログ | TIM の成果物型、トレースリンク型、関係の意味、関係制約のカタログ。agentdev-artifact-graph の派生索引生成と高位問い合わせが正とする語彙・意味定義の実体を正規所有（REQ-012、DEC-017） |
| foundations/references/concrete-abstraction.md | accepted | 配布物具体参照の抽象化参照 | 配布物から harness 固有・実装固有の具体を抽象化する手順の参照。harness-separation-model.md、responsibility-boundary-purification.md から参照される |

#### responsibilities/（文書種別、成果物責務）

| SPEC | status | タイトル | 責務 |
|------|--------|---------|------|
| responsibilities/document-type-responsibilities.md | accepted | 文書種別責務、配置基準 | 文書品質ゲート原本仕様、文書種別責務 |
| responsibilities/artifact-responsibilities.md | accepted | 成果物責任表 | 各成果物種別の正規所有者と責務 |
| responsibilities/artifact-contracts.md | accepted | アーティファクト契約 | Command/Skill/Template/Script の入出力、依存方向 |
| responsibilities/req-impact-map.md | accepted | REQ 影響マップ | REQ → 影響するルール/アーティファクト の対応表。`integrity/rule-ownership.md`（ルールドメイン → canonical REQ/SPEC）と逆方向。同期更新が必要なケースあり。配置は responsibilities/ 残置（移動は別途判断） |
| responsibilities/responsibility-boundary-purification.md | accepted | 責務境界浄化: 所有/非所有リスト詳細 | 配布物と harness 実行制御の責務境界（所有/非所有リスト）。原則は harness-separation-model.md を SSoT とし、各工程（case-auto/case-run/adapter/extensions/タイムスタンプ）の詳細を集約。抽象化手順は `foundations/references/concrete-abstraction.md` を参照 |
| responsibilities/artifact-quality-control-routing.md | draft | Artifact Quality Control Routing SPEC | artifact type から必須品質能力を導出する合成規則、能力キー定義、QG-2 投影契約。REQ-017 execution contract の設計記録 |

#### quality/（品質、メトリクス）

| SPEC | status | タイトル | 責務 |
|------|--------|---------|------|
| quality/quality-specs.md | accepted | 品質仕様 | 品質基準、検証ルール |
| quality/quality-gates.md | accepted | 品質ゲート | QG-1〜QG-4 定義、機械化境界 |
| quality/req-health-metrics.md | accepted | REQ 健全性メトリクス | REQ 肥大化、関心ズレ検出の定量閾値 |
| quality/spec-health-metrics.md | accepted | SPEC 健全性メトリクス | SPEC 肥大化、放置、ドメイン分類適合の定量閾値 |

#### integrity/（整合性契約、ルール）

主要 SPEC、`references/` サブディレクトリ（実装固有詳細）、`rules/` サブディレクトリ（IR-NNN 個別ルール）で構成する。

| SPEC | status | タイトル | 責務 |
|------|--------|---------|------|
| integrity/index-auto-generation.md | accepted | 索引類自動生成 SPEC | README 群、索引類の件数・一覧を実ファイル frontmatter から再生成する機構 |
| integrity/integrity-contracts.md | accepted | 整合性契約 | strict/heuristic/observation 分類と検査カテゴリ |
| integrity/integrity-rule-catalog.md | accepted | 整合性ルールカタログ | スキーマ定義とルールインデックス（詳細は rules/ へ分離） |
| integrity/rules/ | accepted | 整合性ルール詳細 | IR-NNN 個別ルールの15フィールド詳細（局所物理分離） |
| integrity/rule-ownership.md | accepted | ルール所有権マトリックス | ルールドメイン → canonical REQ/SPEC の対応表。`responsibilities/req-impact-map.md`（REQ → 影響するルール/アーティファクト）と逆方向 |
| integrity/docs-spec-rebuild-integrity.md | accepted | 配布物整合性検査ルール | 配布物 ID 除去後の品質保持 |
| integrity/distribution-boundary.md | accepted | 配布依存境界 | REQ-029 が宣言する意味境界の検証モデル、分類値、検出パイプライン、projection 契約、事前 gate と最終 gate の契約、archive 公開前検査、安定実装契約（モジュールパス、plugin パス、tool.execute.before フック種別、archive 検査呼び出し点）。DEC-014 多層 enforcement の正規参照先 |
| integrity/backticks-identifier-threshold.md | accepted | backticks 識別子/一般名詞 判定閾値 | backticks 必須と任意の機械判定閾値 |
| integrity/validator-split-criteria.md | accepted | validator 分割基準 | check_changed_docs.ts の validator 分割基準（責務境界、ファイルサイズ上限、関心分離ルール）。内部 validator 構成は `references/validator-internal-config.md` へ分離 |
| integrity/targeted-docs-guard-implementation.md | accepted | Targeted Docs Guard 実装詳細 | check_changed_docs.ts 変更文書限定検査契約（CLI 引数、workflow 別検査項目、判定条件、false-clean 予防）。Phase 1-6 実装計画、report フィールド一覧、完了済み移行作業は `references/targeted-docs-guard-implementation-details.md` へ分離 |
| integrity/autogen-freshness-gate.md | draft | AUTOGEN ブロック鮮度検出 gate | AUTOGEN ブロック（spec-health-metrics.md 等）の鮮度検出、rename/status 変更時の再生成必要性判定、不合格時の処置 |
| integrity/test-impact-detection-gate.md | draft | テスト影響範囲検出 gate | リファクタリング PR で SPEC 変更に連動する周辺テストの陳腐化検出。変更 SPEC を参照し同一 PR で未更新のテストを陳腐化候補として報告、不合格時の処置契約（REQ-019） |
| integrity/checker-execution-contracts.md | accepted | checker 実行契約と検出基盤規則 | checker 共通実行契約、検出対象除外規定、宣言的データ YAML の schema 原則、detector 命名規約 |

#### local/（ローカル版 SPEC）

| SPEC | status | タイトル | 責務 |
|------|--------|---------|------|
| local/runtime-package-boundary.md | accepted | 実行時パッケージ境界 | リポジトリ種別別 .opencode/ 定義、命名規約、link mode 導入フロー、更新運用 |
| local/local-case-file.md | accepted | ローカル Case ファイル | ローカル版 Case ファイルスキーマ、状態遷移 |
| local/install-script-usability.md | draft | 導入スクリプトの使いやすさ詳細 | install/check/sync-self の使いやすさ詳細（対話ウィザード、cwd 安全化、ヘルプ、上級者向けオプション） |
| [local/artifact-graph.md](local/artifact-graph.md) | superseded | Artifact Graph（本体リポジトリ固有派生索引） | 成果物間の明示関係を検索する派生索引の生成、検査、問い合わせ契約。DEC-007 により標準配布スキル `agentdev-artifact-graph` へ移行（後継: [skills/agentdev-artifact-graph.md](skills/agentdev-artifact-graph.md)）。詳細は[効果検証判断資料](local/references/artifact-graph-effect-evaluation.md)を参照 |

#### authoring/（執筆規約）

| SPEC | status | タイトル | 責務 |
|------|--------|---------|------|
| authoring/command-file-format.md | accepted | コマンドファイルフォーマット規約 | command 定義ファイルの Markdown 構成標準。本文構造・見出し構成・Step 表現・記述形式を扱い、`foundations/patterns.md`（共通文書モデル規約）と責務分離。authoring/ は REQ/SPEC/SKILL/guide 執筆規約の集約先として将来拡張余地あり（即時統合・authoring/ 削除は行わない） |
| authoring/dependency-version-compatibility.md | draft | 外部依存メジャーバージョン互換性管理ガイド | 外部依存のメジャーバージョン互換性事前確認手順、影響範囲スキャン方法、検査器と対象コードの TypeScript バージョン整合要件 |
| authoring/vocabulary-registry.md | accepted | 語彙レジストリ | 語彙対照表の配置基準、連携契約、IR-045 文意品質検出対象語の移管状態、IR-050/IR-051/IR-044 協調契約（ACT-SPEC-007、REQ-028-007、DEC-013 適用） |

> 上記分類は段階的に適用する。
> 既存直下SPECの移送は inspect/backlog 経由で個別に行い、一括移送しない。
> 移送完了まで旧パスと新パスが混在する期間がある。

## 文書間関係（REQ-001）

```
REQ (requirements/REQ-*.md)    -- 要件定義（満たすべき成果）
  |
  v
Decision (decisions/DEC-*.md) -- 意思決定記録（判断根拠）
  |
  v
SPEC (specs/**/*.md)           -- 現行アーキテクチャ基準（現在どうなっているか）。commands/skills/workflows の3層と基盤6ドメイン（foundations/responsibilities/quality/integrity/local/authoring）で構成
  |
  v
Guides (guides/*.md)           -- 人間向けナビゲーション（規範的権限なし）
```

- **REQ** ファイルは要件を定義する。システムが満たすべき成果の信頼できる情報源である。
- **Decision** ファイルは意思決定記録とその判断根拠を記録する。
- **SPEC** ファイルは実装された現行アーキテクチャを記述する。「現在どう動作しているか」の基準となる。3 層構造（commands / skills / workflows）と基盤 6 ドメイン（foundations / responsibilities / quality / integrity / local / authoring）を持つ。3 層は個別 command/skill と共通契約を扱い、基盤 6 ドメインはシステム全体の構成・フォーマット・整合性検査等を扱う（両系統を混同しない）。横断 SPEC は個別 SPEC の代替ではない。
- **Guides** は人間向けナビゲーション層である。規範的権限を持たない。
