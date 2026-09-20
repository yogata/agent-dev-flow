<!-- ADF-COVERS(implementation): REQ-001-025, REQ-001-026, REQ-001-028, REQ-001-065, REQ-001-069, REQ-052-012 -->
# Design インデックス

Design ファイルは、REQ を満たすために現在採用している内部構造、内部動作、責務分担、データ構造、処理方式、規則、パラメータを記述する正規文書である（REQ-001）。
満たすべき成果を定義する REQ ファイルとは対比される。

> **リポジトリ内部設計文書**: Design ファイルは agent-dev-flow リポジトリのリポジトリ内部設計文書である。
> 実行時配布対象ではなく、実行時コマンドは本ファイル群に依存しない（charter 原則、DEC-001）。

## Design status 追跡情報源

本ファイルが Design の `status`（draft / accepted）を視認する単一の追跡情報源である。
後述の各 Design 一覧表の `status` 列で全 Design のライフサイクル状態を集約表示する。
基盤Design（6ドメイン配下）の status を含め、全 Design の status を追跡対象とする。

- **情報源**: 本ファイル（`docs/designs/README.md`）のみ
- **status 値**: `draft` / `accepted` の2つ。新規 Design は `draft` で作成され、確定時に `accepted` へ遷移する
- **更新タイミング**: case-ready / case-revise（draft 保存。保存実体は Capability Skill 委譲）、case-close（draft から accepted への昇格）の各工程で本ファイルの status 列を更新する。基盤Design も同一工程に従う
- **欠落扱い**: `status` frontmatter を持たない Design は `accepted` 相当として扱う

draft status の Design が一定期間更新されず放置されることを検出するルール（IR-054）は [integrity-rule-catalog.md](integrity/integrity-rule-catalog.md) 参照。
基盤Design も IR-054 の検出対象に含む。

### 基盤Design 一覧表の status 列

基盤Design 一覧表（foundations/、responsibilities/、quality/、integrity/、local/、authoring/ の6表）は command/skill/workflow Design 一覧表と同じ `status` 列を持つこと。

### 新規 Design 追加時の index 登録手順

新規 Design ファイルを `docs/designs/` 配下に作成した場合（case-ready / case-revise による保存完了後）、本ファイルの該当一覧表へ当該 Design の行を登録する。
登録漏れを docs-check で検出する。

**タイミング**: 新規 Design の保存が完了した直後（case-ready / case-revise）。
既存 Design への追記（update）では行を追加せず、status 列のみ更新する。

**登録先一覧表の特定**: Design の配置ディレクトリに基づき、対応する一覧表へ登録する。

| Design 配置ディレクトリ | 登録先の一覧表 |
|---|---|
| `designs/commands/` | 「command Design 一覧」表 |
| `designs/skills/` | 「skill Design 一覧」表 |
| `designs/workflows/` | 「横断 Design 一覧」表 |
| `designs/foundations/` | 「基盤 Design 一覧」> foundations/ 表 |
| `designs/responsibilities/` | 「基盤 Design 一覧」> responsibilities/ 表 |
| `designs/quality/` | 「基盤 Design 一覧」> quality/ 表 |
| `designs/integrity/` | 「基盤 Design 一覧」> integrity/ 表 |
| `designs/local/` | 「基盤 Design 一覧」> local/ 表 |
| `designs/authoring/` | 「基盤 Design 一覧」> authoring/ 表 |

**登録内容**: Design パス（相対リンク）、`status`（新規作成時は `draft`）、タイトル、責務の概要。

**docs-check 検出仕組み**: docs-check は `docs/designs/**/*.md` の実ファイルと本ファイルの一覧表エントリを突き合わせし、一覧表に未登録の Design ファイルを検出する。
`_template.md` はテンプレートのため検出対象外とする。
Design ファイルのドメイン間移送が発生した場合は旧ドメイン表から行を削除し、新ドメイン表へ登録する。
`references/` サブディレクトリの Design（詳細・実装固有事項）は親 Design 行の備考欄で言及し、独立行としては登録しない。

### Report の分離

監査記録、監査 baseline、効果評価、DOC-MAP 監査等の監査・評価・観測記録は Report として `docs/reports/` へ分離している。
Report は本 README の一覧表へ登録せず、docs-check の Design 突合対象外である。

## 3 層構造と基盤 6 ドメイン

Design は commands / skills / workflows の 3 層ディレクトリ構造と、基盤 6 ドメイン（foundations / responsibilities / quality / integrity / local / authoring）を持つ。
横断 Design（`workflows/`）は共通契約のみを扱い、個別 command / skill の現在動作は代替しない。
基盤 6 ドメインの直下に主要 Design を配置し、詳細・実装固有事項は `references/` サブディレクトリへ分離する（Wave 3 再構築）。

| 層 / ドメイン | 配置先 | 役割 |
|---|---|---|
| commands/ | `designs/commands/<command-name>.md` | 各 `/agentdev/*` コマンド専用 Design |
| skills/ | `designs/skills/<skill-name>.md` | 各 `agentdev-*` スキル専用 Design |
| workflows/ | `designs/workflows/<topic>.md`、`designs/workflows/references/*.md` | 複数コマンド、スキルにまたがる共通契約。詳細アルゴリズムは `references/` |
| foundations/ | `designs/foundations/*.md`、`designs/foundations/references/*.md` | 文書モデル、フォーマット、設計原則、harness 分離、Project Extensions。具体抽象化等の詳細は `references/` |
| responsibilities/ | `designs/responsibilities/*.md` | 文書種別責務、アーティファクト契約、責務境界 |
| quality/ | `designs/quality/*.md` | 品質基準、品質ゲート、健全性メトリクス |
| integrity/ | `designs/integrity/*.md`、`designs/integrity/references/*.md`、`designs/integrity/rules/*.md` | 整合性契約、ルールカタログ、IR-NNN 個別ルール。実装固有詳細は `references/`、個別ルールは `rules/` |
| local/ | `designs/local/*.md` | ローカル版 Design（link mode、Case ファイル、パッケージ境界） |
| authoring/ | `designs/authoring/*.md` | 執筆規約（コマンドファイルフォーマット等） |

### command Design 一覧（`designs/commands/`）

| Design | status | 責務 |
|------|--------|------|
| [commands/_template.md](commands/_template.md) | accepted | command Design テンプレート |
| [commands/req-define.md](commands/req-define.md) | accepted | `/agentdev/req-define` |
| [commands/case-open.md](commands/case-open.md) | accepted | `/agentdev/case-open` |
| [commands/case-ready.md](commands/case-ready.md) | accepted | `/agentdev/case-ready`（Definition 受入と実行準備完了への状態遷移） |
| [commands/case-revise.md](commands/case-revise.md) | accepted | `/agentdev/case-revise`（再合意済み Definition 変更の既存 Case 反映、主フロー例外経路） |
| [commands/case-run.md](commands/case-run.md) | accepted | `/agentdev/case-run` |
| [commands/case-close.md](commands/case-close.md) | accepted | `/agentdev/case-close` |
| [commands/case-auto.md](commands/case-auto.md) | accepted | `/agentdev/case-auto` |
| [commands/intake-capture.md](commands/intake-capture.md) | accepted | `/agentdev/intake-capture` |
| [commands/intake-from-github.md](commands/intake-from-github.md) | accepted | `/agentdev/intake-from-github` |
| [commands/intake-promote.md](commands/intake-promote.md) | accepted | `/agentdev/intake-promote` |
| [commands/learning-promote.md](commands/learning-promote.md) | accepted | `/agentdev/learning-promote` |
| [commands/backlog-review.md](commands/backlog-review.md) | accepted | `/agentdev/backlog-review` |
| [commands/inspect-docs.md](commands/inspect-docs.md) | accepted | `/agentdev/inspect-docs` |
| [commands/inspect-skills.md](commands/inspect-skills.md) | accepted | `/agentdev/inspect-skills` |
| [commands/inspect-promote.md](commands/inspect-promote.md) | accepted | `/agentdev/inspect-promote` |
| [commands/backlog-auto.md](commands/backlog-auto.md) | accepted | `/agentdev/backlog-auto` |
| [commands/issue.md](commands/issue.md) | accepted | `/agentdev/issue` |
| [commands/third-party-sync.md](commands/third-party-sync.md) | accepted | `/agentdev/third-party-sync`（third-party Skill 取得入口、Custom Tool 委譲） |

`/repo/docs-check` は repo-local、配布対象外のため対象外。

### skill Design 一覧（`designs/skills/`）

| Design | status | 分類 | 責務 |
|------|--------|------|------|
| [skills/_template.md](skills/_template.md) | accepted | template | skill Design テンプレート |
| [skills/agentdev-req-analysis.md](skills/agentdev-req-analysis.md) | accepted | 中核 | 要件分析 |
| [skills/agentdev-req-file-manager.md](skills/agentdev-req-file-manager.md) | accepted | 中核 | REQ ファイル管理 |
| [skills/agentdev-req-structure-diagnostics.md](skills/agentdev-req-structure-diagnostics.md) | accepted | 中核 | REQ 構造診断 |
| [skills/agentdev-traceability.md](skills/agentdev-traceability.md) | accepted | 中核 | トレーサビリティ標準配布スキル（coverage、impact、check、対応宣言の解析、正規成果物の直接走査）（REQ-012、DEC-037） |
| [skills/agentdev-decision-file-manager.md](skills/agentdev-decision-file-manager.md) | accepted | 中核 | Decision ファイル管理 |
| [skills/agentdev-decision-guidelines.md](skills/agentdev-decision-guidelines.md) | accepted | 中核 | Decision 要否判定 |
| [skills/agentdev-architecture-advisory.md](skills/agentdev-architecture-advisory.md) | accepted | 中核 | アーキテクチャ助言 |
| [skills/agentdev-workflow-orchestration.md](skills/agentdev-workflow-orchestration.md) | accepted | 中核 | ワークフロー orchestration |
| [skills/agentdev-workflow-routing.md](skills/agentdev-workflow-routing.md) | accepted | 中核 | ワークフロー routing |
| [skills/agentdev-workflow-lifecycle.md](skills/agentdev-workflow-lifecycle.md) | accepted | 中核 | ワークフロー lifecycle |
| [skills/agentdev-workflow-templates.md](skills/agentdev-workflow-templates.md) | accepted | 中核 | ワークフロー templates |
| [skills/agentdev-design-file-manager.md](skills/agentdev-design-file-manager.md) | accepted | 中核 | Design ファイル管理（作成、更新、配置判断、target_area、Design 固有整合性、Design 固有 script 呼出契約） |
| [skills/agentdev-doc-diagnostics.md](skills/agentdev-doc-diagnostics.md) | accepted | 中核 | docs 横断診断カテゴリ、共通証拠構造、finding 出力契約、文書種別別診断へのルーティング。観点レジストリの正規実体は references/perspective-registry.md |
| [skills/agentdev-artifact-validation.md](skills/agentdev-artifact-validation.md) | accepted | 中核 | 文書種別横断の決定的検証 script と共有 lib の所有、公開検証契約、JSON 結果契約 |
| [skills/agentdev-case-run-execution-adapter.md](skills/agentdev-case-run-execution-adapter.md) | accepted | 補助 | case-run 外部実行 adapter |
| [skills/agentdev-issue-management.md](skills/agentdev-issue-management.md) | accepted | 補助 | Issue 管理 |
| [skills/agentdev-epic-tracker.md](skills/agentdev-epic-tracker.md) | accepted | 補助 | Epic 進捗追跡 |
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
| [skills/agentdev-adversarial-review.md](skills/agentdev-adversarial-review.md) | accepted | 補助 | 対論型レビュー（adversarial review）の振る舞い契約、レビュー手続き、責務構造。3論理役割、動的レビュー戦略、対称的相互反証、戦略メタ反証、合意候補再検証、read-only 境界を所有 |
| [skills/agentdev-git-worktree-test-fallback.md](skills/agentdev-git-worktree-test-fallback.md) | accepted | 補助 | worktree 構造系テスト fallback 契約（junction 未設定時の src/opencode/ fallback、構造的制約の明示） |
| [skills/agentdev-workflow-backlog-auto.md](skills/agentdev-workflow-backlog-auto.md) | accepted | 中核 | backlog-auto workflow 実装本体（orchestration stage 構成、直列化契約、fan-in 判定、resume 契約） |
| [skills/agentdev-issue-tracking.md](skills/agentdev-issue-tracking.md) | accepted | 中核 | 追跡Issue論理スキーマの一元管理（role/kind/状態遷移、物理マッピング表、本文標準構造、反映追跡） |

`repo-agentdev-integrity` は repo-local、配布対象外のため対象外。

### 横断 Design 一覧（`designs/workflows/`）

| Design | status | タイトル | 責務 |
|------|--------|---------|------|
| [workflows/workflow-skill-model.md](workflows/workflow-skill-model.md) | accepted | Workflow Skill Model | Command / Workflow Skill / Capability Skill の責務、依存方向、1:N分割基準、配置契約。DEC-010 実装詳細 |
| [workflows/v4-delegation-contracts.md](workflows/v4-delegation-contracts.md) | accepted | サブエージェント委譲契約（v4） | 委譲時最小契約、委譲種別 8 種、制約、実行主体分類、adversarial-review 接続、構造化文脈直列化契約。result 4 状態と authority は v4-lifecycle-state-machine / v4-runtime-execution-model 参照（旧 delegation-contracts.md から集約 supersede） |
| [workflows/capture-boundaries.md](workflows/capture-boundaries.md) | accepted | キャプチャ境界 | intake / learning 境界、Split Rule、PR 本文永続チャネル |
| [workflows/references/execution-unit-construction.md](workflows/references/execution-unit-construction.md) | accepted | execution_unit 構成アルゴリズム参照 | v4-standard-lifecycle（語彙）と case-open Design（運用主体）から参照される連結成分アルゴリズム、3軸判断モデルの機械的判定手順 |
| [workflows/v4-standard-lifecycle.md](workflows/v4-standard-lifecycle.md) | accepted | ADF v4 標準ライフサイクル | v4 標準ライフサイクルの定義（work_type/scale/Epic/Wave の語彙直交性、公開 UX 2入口収斂と内部 lifecycle への回収、req-define 入口の入力意味、継続コラボレーションループ） |
| [workflows/v4-lifecycle-state-machine.md](workflows/v4-lifecycle-state-machine.md) | accepted | ADF v4 ライフサイクル状態機械（二層状態モデル・階層合成・内部 lifecycle 対応） | v4 ライフサイクル状態機械の定義（durable state enum と runtime 実行状態の二層モデル、階層合成〔子=実状態、上位=導出投影〕、deterministic/semantic gate 分離、v3 command と内部状態遷移の対応表、v3 状態関連 Design の planned supersede 記録） |
| [workflows/v4-collaboration-loop.md](workflows/v4-collaboration-loop.md) | accepted | ADF v4 継続コラボレーションループ | 循環の各段責務（Observe・Integrate 定義、実現手段対応表）、Learning 評価結果 7 系統、昇格ガード、.agentdev/ 状態領域の整合、v3 backlog-artifact-lifecycle Design からの吸収 |

### 基盤 Design 一覧（6 ドメイン配下）

基盤 Design は agent-dev-flow リポジトリの内部構造に従い、以下の6つのドメインディレクトリに分類、体系化する（REQ-001、charter 原則）。
各基盤Design の status は後述の status 列で追跡する。
各ドメインの責務と配置対象の詳細は [document-model.md](foundations/document-model.md)「docs/designs/ 直下のドメイン別体系化」を参照。

#### foundations/（基盤モデル）

主要 Design と `references/` サブディレクトリで構成する。
`references/` には親 Design から参照される詳細・抽象化事項を配置する（Wave 3 再構築）。

| Design | status | タイトル | 責務 |
|------|--------|---------|------|
| foundations/numbering-policy.md | accepted | 採番管理 Design | REQ/Decision/IR の識別子採番規則、欠番維持、決定的採番スクリプトとの協調 |
| foundations/system.md | accepted | システム仕様 | コマンドシステムの構成定義、運用モデル |
| foundations/document-model.md | accepted | 文書モデル | REQ/Decision/Design/guides の責務マトリックス、ドメイン別体系化規範 |
| foundations/decision-lifecycle.md | accepted | Decision Lifecycle | Decision 関係モデル（relates-to / supersedes / reaffirms）、粒度管理規則、健全性評価モデル。document-model.md「Decision ライフサイクル詳細」から参照される詳細を正規所有 |
| foundations/patterns.md | accepted | 文書フォーマット規約 | frontmatter、ID 体系、命名規則、URL 参照形式、共通フォーマット規約 |
| foundations/design-principles.md | accepted | 設計原則 | アーキテクチャ設計原則 |
| foundations/project-extensions.md | accepted | Project Extensions | 実行時プロジェクト固有追加・拡張機構（`.agentdev/extensions/**`）、extension schema、実行時読み込み契約、project-local skill 委譲、配布物具体参照禁止（REQ-002） |
| foundations/harness-separation-model.md | accepted | harness 分離モデル | 配布物と harness 実行制御の責務分離モデル。配布物の大多数を harness 非依存とし、依存具体を references/ へ集約 |
| foundations/references/concrete-abstraction.md | accepted | 配布物具体参照の抽象化参照 | 配布物から harness 固有・実装固有の具体を抽象化する手順の参照。harness-separation-model.md、responsibility-boundary-purification.md から参照される |
| foundations/v4-operating-model.md | accepted | ADF v4 Operating Model | v4 の目的・適用範囲・標準語彙・プロセス/実装分離原則、三層責務モデル（ADF Runtime / Standard Operating Model / Project Model）、Project Contract の論理ビュー、8 情報寿命モデル、中核文書モデル（REQ/Decision/Design/Implementation/Evidence）の定義 |
| foundations/v4-responsibility-boundaries.md | accepted | ADF v4 実装責務境界 | semantic Skill / deterministic code / Harness adapter / Project Extensions の実装責務境界（semantic 6 項目・deterministic 11 項目の分類基準、OpenCode first-class reference harness、semantic extension point）の定義 |
| foundations/v4-traceability-model.md | accepted | ADF v4 Traceability モデル | Change / Evidence 中心の Traceability モデル（4 問いへの回答能力、永続情報と導出可能情報の分離、global completeness の位置づけ）の定義 |
| foundations/v3-v4-crosswalk.md | accepted | v3 -> v4 Concept / Artifact Crosswalk | v3 成果物の v4 での処遇の正規記録先（3 列 schema〔意味処遇・帰属・実行段階〕、処遇実行原則〔living tracking〕、段階割当規則、集約サマリ）。処遇の完全一覧は references/crosswalk-inventory.md が所有する（references/ は親 Design 行の備考欄で言及）。実際の置換・廃止は後続 v4 Implementation Sequence で実行 |
| foundations/v4-migration-and-release.md | accepted | ADF v4 Migration と Release の標準境界 | 標準 migration pattern（非破壊移行原則）、RC tag 運用と cutover sequence、pilot migration と v4.0.0 final 条件、v3-baseline と rollback anchor、後続 v4 Implementation Sequence の定義 |
| foundations/v4-durable-state-and-recovery.md | accepted | ADF v4 durable state と再構成・恢復（配置表・権威移行・部分失敗調整） | durable state の 5 分類と配置表、状態と証跡の分離、導出可能情報の判定基準、再構成優先順位の全実行単位への一般化、権威移行点、部分失敗の調整の定義 |
| foundations/v4-runtime-execution-model.md | accepted | ADF v4 Runtime 実行モデル（authority 格子・直列化単位・冪等経路・runtime 制御ループ） | 副作用 4 分類と authority 格子、直列化単位 5 種、冪等経路、直列化違反・競合検出時の意味論、runtime 制御ループ、fail-closed 適用範囲の定義 |

#### responsibilities/（文書種別、成果物責務）

| Design | status | タイトル | 責務 |
|------|--------|---------|------|
| responsibilities/document-type-responsibilities.md | accepted | 文書種別責務、配置基準 | 文書品質ゲート原本仕様、文書種別責務 |
| responsibilities/artifact-responsibilities.md | accepted | 成果物責任表 | 各成果物種別の正規所有者と責務 |
| responsibilities/artifact-contracts.md | accepted | アーティファクト契約 | Command/Skill/Template/Script の入出力、依存方向 |
| responsibilities/req-impact-map.md | accepted | REQ 影響マップ | REQ → 影響するルール/アーティファクト の対応表。`integrity/rule-ownership.md`（ルールドメイン → canonical REQ/Design）と逆方向。同期更新が必要なケースあり。配置の正本は req-impact-map.md 冒頭の配置記述であり、`responsibilities/` 残置を現行配置として確定済み（本行は参照導線） |
| responsibilities/responsibility-boundary-purification.md | accepted | 責務境界浄化: 所有/非所有リスト詳細 | 配布物と harness 実行制御の責務境界（所有/非所有リスト）。原則は harness-separation-model.md を SSoT とし、各工程（case-auto/case-run/adapter/extensions/タイムスタンプ）の詳細を集約。抽象化手順は `foundations/references/concrete-abstraction.md` を参照 |
| responsibilities/artifact-quality-control-routing.md | accepted | Artifact Quality Control Routing Design | artifact type から必須品質能力を導出する合成規則、能力キー定義、QG-2 投影契約。REQ-017 execution contract の設計記録 |
| responsibilities/custom-tool-contracts.md | accepted | Custom Tool 操作契約 | Custom Tool の操作契約（入力、出力、保証、失敗時）、ローカル版実装差し替え、迂回防止（REQ-052） |

#### quality/（品質、メトリクス）

| Design | status | タイトル | 責務 |
|------|--------|---------|------|
| quality/quality-specs.md | accepted | 品質仕様 | 品質基準、検証ルール |
| quality/req-health-metrics.md | accepted | REQ 健全性メトリクス | REQ 肥大化、関心ズレ検出の定量閾値 |
| quality/design-health-metrics.md | accepted | Design 健全性メトリクス | Design 肥大化、放置、ドメイン分類適合の定量閾値 |
| quality/textlint-quality-runtime.md | accepted | textlint 品質基盤 | 文章表層品質の共通実行基盤（プロジェクト解決、設定読込み、対象解決、規則構成、文章検査、結果整形）。書込み前検査と最終検査の共通化、Plugin と単独実行入口の2入口 |
| quality/v4-quality-gate-model.md | accepted | ADF v4 Quality / Verification / Evidence / Gate モデル | Quality Policy / Verification Obligation / Verifier / Evidence / Gate の 5 概念分解、Gate = 状態遷移 predicate 契約、v4 standard lifecycle からの Gate 再導出手順、Verifier 分類の定義 |

#### integrity/（整合性契約、ルール）

主要 Design、`references/` サブディレクトリ（実装固有詳細）、`rules/` サブディレクトリ（IR-NNN 個別ルール）で構成する。

| Design | status | タイトル | 責務 |
|------|--------|---------|------|
| integrity/index-auto-generation.md | accepted | 索引類自動生成 Design | README 群、索引類の件数・一覧を実ファイル frontmatter から再生成する機構 |
| integrity/integrity-contracts.md | accepted | 整合性契約 | strict/heuristic/observation 分類と検査カテゴリ |
| integrity/integrity-rule-catalog.md | accepted | 整合性ルールカタログ | スキーマ定義とルールインデックス（詳細は rules/ へ分離） |
| integrity/rules/ | accepted | 整合性ルール詳細 | IR-NNN 個別ルールの15フィールド詳細（局所物理分離） |
| integrity/rule-ownership.md | accepted | ルール所有権マトリックス | ルールドメイン → canonical REQ/Design の対応表。`responsibilities/req-impact-map.md`（REQ → 影響するルール/アーティファクト）と逆方向 |
| integrity/docs-spec-rebuild-integrity.md | accepted | 配布物整合性検査ルール | 配布物 ID 除去後の品質保持 |
| integrity/distribution-boundary.md | accepted | 配布依存境界 | REQ-029 が宣言する意味境界の検証モデル、分類値、検出パイプライン、projection 契約、事前 gate と最終 gate の契約、archive 公開前検査、安定実装契約（モジュールパス、plugin パス、tool.execute.before フック種別、archive 検査呼び出し点）。DEC-014 多層 enforcement の正規参照先 |
| integrity/backticks-identifier-threshold.md | accepted | backticks 識別子/一般名詞 判定閾値 | backticks 必須と任意の機械判定閾値 |
| integrity/validator-split-criteria.md | accepted | validator 分割基準 | check_changed_docs.ts の validator 分割基準（責務境界、ファイルサイズ上限、関心分離ルール）。内部 validator 構成は `references/validator-internal-config.md` へ分離 |
| integrity/targeted-docs-guard-implementation.md | accepted | Targeted Docs Guard 実装詳細 | check_changed_docs.ts 変更文書限定検査契約（CLI 引数、workflow 別検査項目、判定条件、false-clean 予防）。Phase 1-6 実装計画、report フィールド一覧、完了済み移行作業は `references/targeted-docs-guard-implementation-details.md` へ分離 |
| integrity/autogen-freshness-gate.md | accepted | AUTOGEN ブロック鮮度検出 gate | AUTOGEN ブロック（design-health-metrics.md 等）の鮮度検出、rename/status 変更時の再生成必要性判定、不合格時の処置 |
| integrity/test-impact-detection-gate.md | accepted | テスト影響範囲検出 gate | リファクタリング PR で Design 変更に連動する周辺テストの陳腐化検出。変更 Design を参照し同一 PR で未更新のテストを陳腐化候補として報告、不合格時の処置契約（REQ-019） |
| integrity/checker-execution-contracts.md | accepted | checker 実行契約と検出基盤規則 | checker 共通実行契約、検出対象除外規定、宣言的データ YAML の schema 原則、detector 命名規約 |
| integrity/content-corruption-checker.md | accepted | 決定的破損検査クラス | 配布 command・skill 全体の決定的破損検査（Markdown 構造破損、制御文字混入、不正な Unicode 文字、意図しない異言語文字、既知形式の参照残骸）の検査クラス契約、検出シグナル、検出平面、許容例列挙（REQ-010-071、REQ-053-012） |
| integrity/prose-quality-sentinel-checks.md | accepted | 既知不備センチネル検査 | 配布 command・skill の既知不備 14 項目のセンチネル検査カタログ、確定一致/列挙後確認の 2 段検出方式、対象集合、合格条件、REQ-053-012 と決定的破損検査クラスとの関係（REQ-053-022） |

#### local/（ローカル版 Design）

| Design | status | タイトル | 責務 |
|------|--------|---------|------|
| local/runtime-package-boundary.md | accepted | 実行時パッケージ境界 | リポジトリ種別別 .opencode/ 定義、命名規約、link mode 導入フロー、更新運用 |
| local/local-case-file.md | accepted | ローカルIssue共通スキーマ | ローカルIssueの共通メタデータ、role 条件付きスキーマ、状態遷移 |
| local/install-script-usability.md | accepted | 導入スクリプトの使いやすさ詳細 | install/check/sync-self の使いやすさ詳細（対話ウィザード、cwd 安全化、ヘルプ、上級者向けオプション） |
| local/third-party-skill-management.md | accepted | third-party Skill 管理 | third-party Skill の宣言（skills.yaml）と取得機構の正規仕様（source 形式判定、取得プロファイル、非破壊性、個別特例統合、参照点集約） |

#### authoring/（執筆規約）

| Design | status | タイトル | 責務 |
|------|--------|---------|------|
| authoring/command-file-format.md | accepted | コマンドファイルフォーマット規約 | command 定義ファイルの Markdown 構成標準。本文構造・見出し構成・Step 表現・記述形式を扱い、`foundations/patterns.md`（共通文書モデル規約）と責務分離。authoring/ は REQ/Design/SKILL/guide 執筆規約の集約先として将来拡張余地あり（即時統合・authoring/ 削除は行わない） |
| authoring/vocabulary-registry.md | accepted | 語彙レジストリ | 語彙対照表の配置基準、連携契約、IR-045 文意品質検出対象語の移管状態、IR-050/IR-051/IR-044 協調契約（ACT-DESIGN-007、retired REQ-028-007（後継は DEC-006/REQ-036 系）、DEC-013 適用） |

> 上記分類は段階的に適用する。
> 既存直下Designの移送は inspect/backlog 経由で個別に行い、一括移送しない。
> 移送完了まで旧パスと新パスが混在する期間がある。

## 文書間関係（REQ-001）

```
REQ (requirements/REQ-*.md)    -- 要件定義（満たすべき成果）
  |
  v
Decision (decisions/DEC-*.md) -- 意思決定記録（判断根拠）
  |
  v
Design (designs/**/*.md)           -- 現在設計（現在採用している内部構造・規則等のHOW）。commands/skills/workflows の3層と基盤6ドメイン（foundations/responsibilities/quality/integrity/local/authoring）で構成
  |
  v
Guides (guides/*.md)           -- 人間向けナビゲーション（規範的権限なし）
```

- **REQ** ファイルは要件を定義する。システムが満たすべき成果の信頼できる情報源である。
- **Decision** ファイルは意思決定記録とその判断根拠を記録する。
- **Design** ファイルは、REQ を満たすために現在採用している内部構造、内部動作、責務分担、データ構造、処理方式、規則、パラメータを記述する。3 層構造（commands / skills / workflows）と基盤 6 ドメイン（foundations / responsibilities / quality / integrity / local / authoring）を持つ。3 層は個別 command/skill と共通契約を扱い、基盤 6 ドメインはシステム全体の構成・フォーマット・整合性検査等を扱う（両系統を混同しない）。横断 Design は個別 Design の代替ではない。
- **Guides** は人間向けナビゲーション層である。規範的権限を持たない。

