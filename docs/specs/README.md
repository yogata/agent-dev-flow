# SPEC インデックス

SPEC ファイルは現行アーキテクチャの正規文書である（REQ-0101）。
システムが現在「どうなっているか」を記述し、満たすべき成果を定義する REQ ファイルとは対比される。

> **リポジトリ内部設計文書**: SPEC ファイルは agent-dev-flow リポジトリのリポジトリ内部設計文書である。
> 実行時配布対象ではなく、実行時コマンドは本ファイル群に依存しない（ADR-0103, ADR-0104）。

## SPEC status 追跡情報源（REQ-0154-001, REQ-0154-003）

本ファイルが SPEC の `status`（draft / accepted、ADR-0123 定義）を視認する単一の追跡情報源である（REQ-0154-001）。
後述の各 SPEC 一覧表の `status` 列で全 SPEC のライフサイクル状態を集約表示する。
基盤SPEC（REQ-0156 の6ドメイン配下）の status を含め、全 SPEC の status を追跡対象とする（REQ-0154-003）。

- **情報源**: 本ファイル（`docs/specs/README.md`）のみ。`docs/DOC-MAP.md` は SPEC の status を重複管理しない（探索経路の案内のみ）
- **status 値**: ADR-0123 で定義される `draft` / `accepted` のみ。値の追加、変更は本ファイルの対象外（REQ-0154 対象外）
- **更新タイミング**: spec-save（draft 保存）、case-close（draft から accepted への昇格）の各工程で本ファイルの status 列を更新する。基盤SPEC も同一工程に従う（REQ-0154-003）
- **欠落扱い**: `status` frontmatter を持たない SPEC は表中で `-` で示す。`-` の SPEC は status 付与を要する（対象 SPEC は spec-save / case-close で順次 status を付与する）

draft status の SPEC が一定期間更新されず放置されることを検出するルール（IR-054）は [integrity-rule-catalog.md](integrity/integrity-rule-catalog.md) 参照（REQ-0154-002）。
基盤SPEC も IR-054 の検出対象に含む。

### 基盤SPEC 一覧表の status 列追加（REQ-0154-003）

基盤SPEC 一覧表（foundations/、responsibilities/、quality/、integrity/、local/、authoring/ の6表）は command/skill/workflow SPEC 一覧表と同じ `status` 列を持つこと。各基盤SPEC の初期 status は以下に従う:

- 既に ADR-0123 lifecycle に沿って draft→accepted 昇格が確認済みの SPEC（例: quality/spec-health-metrics.md）は `accepted`
- 上記以外は現状の frontmatter `status` 値（`draft` または欠落時は `-`）

初期 status 値の確定は spec-save 工程で行い、本一覧表へ反映する。

### 新規 SPEC 追加時の index 登録手順（REQ-0154-004）

新規 SPEC ファイルを `docs/specs/` 配下に作成した場合（spec-save 完了後）、本ファイルの該当一覧表へ当該 SPEC の行を登録する。登録漏れを docs-check で検出する（REQ-0154-003 準拠）。

**タイミング**: spec-save が新規 SPEC を作成した直後。既存 SPEC への追記（UPDATE）では行を追加せず、status 列のみ更新する。

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

**docs-check 検出仕組み**: docs-check は `docs/specs/**/*.md` の実ファイルと本ファイルの一覧表エントリを突き合わせし、一覧表に未登録の SPEC ファイルを検出する（REQ-0154-003 準拠）。`_template.md` はテンプレートのため検出対象外とする。SPEC ファイルのドメイン間移送が発生した場合は旧ドメイン表から行を削除し、新ドメイン表へ登録する（REQ-0156-006 準拠）。

## 3 層構造（AG-007, AG-008）

SPEC は commands / skills / workflows の 3 層ディレクトリ構造を持つ。
横断 SPEC（`workflows/`）は共通契約のみを扱い、個別 command / skill の現在動作は代替しない。

| 層 | 配置先 | 役割 |
|---|---|---|
| commands/ | `specs/commands/<command-name>.md` | 各 `/agentdev/*` コマンド専用 SPEC |
| skills/ | `specs/skills/<skill-name>.md` | 各 `agentdev-*` スキル専用 SPEC |
| workflows/ | `specs/workflows/<topic>.md` | 複数コマンド、スキルにまたがる共通契約 |
| 基盤（6 ドメイン） | `specs/{foundations,responsibilities,quality,integrity,local,authoring}/*.md` | システム全体の構成、フォーマット、整合性検査など基盤 SPEC（REQ-0156-001）。commands/skills/workflows の 3 層とは別系統の基盤 6 ドメイン分類 |

### command SPEC 一覧（`specs/commands/`）

| SPEC | status | 責務 |
|------|--------|------|
| [commands/_template.md](commands/_template.md) | accepted | command SPEC テンプレート |
| [commands/req-define.md](commands/req-define.md) | draft | `/agentdev/req-define` |
| [commands/req-save.md](commands/req-save.md) | draft | `/agentdev/req-save` |
| [commands/spec-save.md](commands/spec-save.md) | draft | `/agentdev/spec-save` |
| [commands/case-open.md](commands/case-open.md) | draft | `/agentdev/case-open` |
| [commands/case-run.md](commands/case-run.md) | draft | `/agentdev/case-run` |
| [commands/case-close.md](commands/case-close.md) | draft | `/agentdev/case-close` |
| [commands/case-auto.md](commands/case-auto.md) | draft | `/agentdev/case-auto` |
| [commands/case-update.md](commands/case-update.md) | draft | `/agentdev/case-update` |
| [commands/intake-capture.md](commands/intake-capture.md) | draft | `/agentdev/intake-capture` |
| [commands/intake-from-github.md](commands/intake-from-github.md) | draft | `/agentdev/intake-from-github` |
| [commands/intake-promote.md](commands/intake-promote.md) | draft | `/agentdev/intake-promote` |
| [commands/learning-promote.md](commands/learning-promote.md) | draft | `/agentdev/learning-promote` |
| [commands/backlog-review.md](commands/backlog-review.md) | draft | `/agentdev/backlog-review` |
| [commands/inspect-docs.md](commands/inspect-docs.md) | draft | `/agentdev/inspect-docs` |
| [commands/inspect-skills.md](commands/inspect-skills.md) | draft | `/agentdev/inspect-skills` |
| [commands/inspect-promote.md](commands/inspect-promote.md) | draft | `/agentdev/inspect-promote` |
| [commands/inspect-extensions.md](commands/inspect-extensions.md) | draft | `/agentdev/inspect-extensions`（project extensions 機構の整合性診断、読み取り専用。旧 inspect-doc-inputs から統合・改名） |

`/repo/docs-check` は repo-local、配布対象外のため対象外。

### skill SPEC 一覧（`specs/skills/`）

| SPEC | status | 分類 | 責務 |
|------|--------|------|------|
| [skills/_template.md](skills/_template.md) | accepted | template | skill SPEC テンプレート |
| [skills/agentdev-doc-writing.md](skills/agentdev-doc-writing.md) | draft | 中核 | 文書品質ゲート |
| [skills/agentdev-req-analysis.md](skills/agentdev-req-analysis.md) | draft | 中核 | 要件分析 |
| [skills/agentdev-req-file-manager.md](skills/agentdev-req-file-manager.md) | draft | 中核 | REQ ファイル管理 |
| [skills/agentdev-req-structure-diagnostics.md](skills/agentdev-req-structure-diagnostics.md) | draft | 中核 | REQ 構造診断 |
| [skills/agentdev-doc-map.md](skills/agentdev-doc-map.md) | draft | 中核 | DOC-MAP 管理 |
| [skills/agentdev-adr-file-manager.md](skills/agentdev-adr-file-manager.md) | draft | 中核 | ADR ファイル管理 |
| [skills/agentdev-adr-guidelines.md](skills/agentdev-adr-guidelines.md) | draft | 中核 | ADR 要否判定 |
| [skills/agentdev-architecture-advisory.md](skills/agentdev-architecture-advisory.md) | draft | 中核 | アーキテクチャ助言 |
| [skills/agentdev-workflow-orchestration.md](skills/agentdev-workflow-orchestration.md) | draft | 中核 | ワークフロー orchestration |
| [skills/agentdev-workflow-routing.md](skills/agentdev-workflow-routing.md) | draft | 中核 | ワークフロー routing |
| [skills/agentdev-workflow-lifecycle.md](skills/agentdev-workflow-lifecycle.md) | draft | 中核 | ワークフロー lifecycle |
| [skills/agentdev-workflow-templates.md](skills/agentdev-workflow-templates.md) | draft | 中核 | ワークフロー templates |
| [skills/agentdev-case-run-execution-adapter.md](skills/agentdev-case-run-execution-adapter.md) | draft | 補助 | case-run 外部実行 adapter |
| [skills/agentdev-issue-management.md](skills/agentdev-issue-management.md) | draft | 補助 | Issue 管理 |
| [skills/agentdev-epic-tracker.md](skills/agentdev-epic-tracker.md) | draft | 補助 | Epic 進捗追跡 |
| [skills/agentdev-gh-cli.md](skills/agentdev-gh-cli.md) | accepted | 補助 | gh CLI 手続き委譲 |
| [skills/agentdev-git-worktree.md](skills/agentdev-git-worktree.md) | draft | 補助 | git worktree 操作 |
| [skills/agentdev-intake-pipeline.md](skills/agentdev-intake-pipeline.md) | draft | 補助 | intake pipeline |
| [skills/agentdev-learning-capture.md](skills/agentdev-learning-capture.md) | draft | 補助 | learning capture |
| [skills/agentdev-learning-pipeline.md](skills/agentdev-learning-pipeline.md) | draft | 補助 | learning pipeline |
| [skills/agentdev-quality-gates.md](skills/agentdev-quality-gates.md) | draft | 補助 | quality gates |
| [skills/agentdev-inspect-skills.md](skills/agentdev-inspect-skills.md) | draft | 補助 | inspect-skills |
| [skills/agentdev-command-authoring.md](skills/agentdev-command-authoring.md) | draft | 補助 | command authoring |
| [skills/agentdev-command-creator.md](skills/agentdev-command-creator.md) | draft | 補助 | command creator |
| [skills/agentdev-conventional-commits.md](skills/agentdev-conventional-commits.md) | draft | 補助 | conventional commits |
| [skills/agentdev-skill-authoring.md](skills/agentdev-skill-authoring.md) | draft | 補助 | skill authoring |
| [skills/agentdev-backlog-integration.md](skills/agentdev-backlog-integration.md) | draft | 補助 | backlog integration |
| [skills/agentdev-project-extensions.md](skills/agentdev-project-extensions.md) | draft | 補助 | project extensions 読み込み |

`repo-agentdev-integrity` は repo-local、配布対象外のため対象外。

### 横断 SPEC 一覧（`specs/workflows/`）

| SPEC | status | タイトル | 責務 |
|------|--------|---------|------|
| [workflows/workflow-contracts.md](workflows/workflow-contracts.md) | accepted | ワークフロー契約（横断） | パイプライン概要、共通フェーズ、SSoT 遷移、実装分類 |
| [workflows/delegation-contracts.md](workflows/delegation-contracts.md) | accepted | サブエージェント委譲契約 | 委譲時最小契約、委譲種別、制約、manager-orchestrator 分離 |
| [workflows/capture-boundaries.md](workflows/capture-boundaries.md) | accepted | キャプチャ境界 | intake / learning 境界、Split Rule、PR 本文永続チャネル |
| [workflows/epic-wave-model.md](workflows/epic-wave-model.md) | accepted | Epic / Wave / Issue 実行モデル | OU 階層、子Issue 状態 enum、Wave スケジューリング、execution_unit 定義、連結成分アルゴリズム、3軸判断モデル、per-Epic 単一書き手 |
| [workflows/backlog-artifact-lifecycle.md](workflows/backlog-artifact-lifecycle.md) | accepted | RU / 採用済み成果物 / draft lifecycle | artifact lifecycle、検出事項プロトコル、artifact_actions 工程分岐 |

### 基盤 SPEC 一覧（6 ドメイン配下）

基盤 SPEC は agent-dev-flow リポジトリの内部構造に従い、以下の6つのドメインディレクトリに分類、体系化する（REQ-0156-001, REQ-0156-003）。
各基盤SPEC の status は REQ-0154-003 に基づき後述の status 列で追跡する。
各ドメインの責務と配置対象の詳細は [document-model.md](foundations/document-model.md)「docs/specs/ 直下のドメイン別体系化」を参照。

#### foundations/（基盤モデル）

| SPEC | status | タイトル | 責務 |
|------|--------|---------|------|
| foundations/system.md | accepted | システム仕様 | コマンドシステムの構成定義、運用モデル |
| foundations/document-model.md | accepted | 文書モデル | REQ/ADR/SPEC/guides/DOC-MAP の責務マトリックス、ドメイン別体系化規範 |
| foundations/patterns.md | accepted | 文書フォーマット規約 | frontmatter、ID 体系、命名規則、URL 参照形式、共通フォーマット規約（本文構造・執筆規約寄り内容は authoring/ への移管候補、実移管は case-run で判断） |
| foundations/design-principles.md | accepted | 設計原則 | アーキテクチャ設計原則 |
| foundations/workflow-contracts.md | accepted | ワークフロー契約（旧版、縮小済み） | 旧版互換索引。正規の横断ワークフロー契約は `workflows/` 配下を参照 |
| foundations/project-extensions.md | draft | Project Extensions | 実行時プロジェクト固有追加・拡張機構（.agentdev/extensions/**）、extension schema、実行時読み込み契約、project-local skill 委譲、配布物具体参照禁止（ADR-0135、REQ-0160） |

#### responsibilities/（文書種別、成果物責務）

| SPEC | status | タイトル | 責務 |
|------|--------|---------|------|
| responsibilities/document-type-responsibilities.md | accepted | 文書種別責務、配置基準 | 文書品質ゲート原本仕様、文書種別責務 |
| responsibilities/artifact-responsibilities.md | accepted | 成果物責任表 | 各成果物種別の正規所有者と責務 |
| responsibilities/artifact-contracts.md | accepted | アーティファクト契約 | Command/Skill/Template/Script の入出力、依存方向 |
| responsibilities/req-impact-map.md | accepted | REQ 影響マップ | REQ → 影響するルール/アーティファクト の対応表。`integrity/rule-ownership.md`（ルールドメイン → canonical REQ/SPEC）と逆方向。同期更新が必要なケースあり。配置は responsibilities/ 残置（移動は別途判断） |

#### quality/（品質、メトリクス）

| SPEC | status | タイトル | 責務 |
|------|--------|---------|------|
| quality/quality-specs.md | accepted | 品質仕様 | 品質基準、検証ルール |
| quality/quality-gates.md | accepted | 品質ゲート | QG-1〜QG-4 定義、機械化境界 |
| quality/req-health-metrics.md | accepted | REQ 健全性メトリクス | REQ 肥大化、関心ズレ検出の定量閾値 |
| quality/spec-health-metrics.md | accepted | SPEC 健全性メトリクス | SPEC 肥大化、放置、ドメイン分類適合の定量閾値（REQ-0156-007 新設） |

#### integrity/（整合性契約、ルール）

| SPEC | status | タイトル | 責務 |
|------|--------|---------|------|
| integrity/integrity-contracts.md | accepted | 整合性契約 | strict/heuristic/observation 分類と検査カテゴリ |
| integrity/integrity-rule-catalog.md | accepted | 整合性ルールカタログ | スキーマ定義とルールインデックス（詳細は rules/ へ分離） |
| integrity/rules/ | accepted | 整合性ルール詳細 | IR-NNN 個別ルールの15フィールド詳細（局所物理分離: REQ-0155-007） |
| integrity/rule-ownership.md | accepted | ルール所有権マトリックス | ルールドメイン → canonical REQ/SPEC の対応表。`responsibilities/req-impact-map.md`（REQ → 影響するルール/アーティファクト）と逆方向 |
| integrity/docs-spec-rebuild-integrity.md | draft | 配布物整合性検査ルール | 配布物 ID 除去後の品質保持 |
| integrity/backticks-identifier-threshold.md | accepted | backticks 識別子/一般名詞 判定閾値 | backticks 必須と任意の機械判定閾値 |

#### local/（ローカル版 SPEC）

| SPEC | status | タイトル | 責務 |
|------|--------|---------|------|
| local/runtime-package-boundary.md | accepted | 実行時パッケージ境界 | リポジトリ種別別 .opencode/ 定義、命名規約 |
| local/local-case-file.md | draft | ローカル Case ファイル | ローカル版 Case ファイルスキーマ、状態遷移 |
| local/local-generation.md | draft | ローカル版 OpenCode 生成 | link mode 導入フロー、更新運用、残存 GitHub 固有参照の違反判定基準、link mode 移行に伴う廃止経緯（REQ-0141-028/029、ADR-0131。local-transform.md から一元化、当該ファイルは case-run で削除済み） |

#### authoring/（執筆規約）

| SPEC | status | タイトル | 責務 |
|------|--------|---------|------|
| authoring/command-file-format.md | accepted | コマンドファイルフォーマット規約 | command 定義ファイルの Markdown 構成標準。本文構造・見出し構成・Step 表現・記述形式を扱い、`foundations/patterns.md`（共通文書モデル規約）と責務分離。authoring/ は REQ/SPEC/SKILL/guide 執筆規約の集約先として将来拡張余地あり（即時統合・authoring/ 削除は行わない） |

> 上記分類は段階的に適用する。
> 既存直下SPECの移送は inspect/backlog 経由で個別に行い、一括移送しない（REQ-0156-005）。
> 移送完了まで旧パスと新パスが混在する期間がある。

## 文書間関係（REQ-0101）

```
REQ (requirements/REQ-*.md)    -- 要件定義（満たすべき成果）
  |
  v
ADR (adr/ADR-*.md)            -- アーキテクチャ決定記録（判断根拠）
  |
  v
SPEC (specs/**/*.md)           -- 現行アーキテクチャ基準（現在どうなっているか）。commands/skills/workflows の3層と基盤6ドメイン（foundations/responsibilities/quality/integrity/local/authoring）で構成
  |
  v
DOC-MAP (DOC-MAP.md)           -- 文書探索入口（参照用・分類索引）
```

- **REQ** ファイルは要件を定義する。システムが満たすべき成果の信頼できる情報源である。
- **ADR** ファイルはアーキテクチャ決定とその判断根拠を記録する。
- **SPEC** ファイルは実装された現行アーキテクチャを記述する。「現在どう動作しているか」の基準となる。3 層構造（commands / skills / workflows）と基盤 6 ドメイン（foundations / responsibilities / quality / integrity / local / authoring）を持つ。3 層は個別 command/skill と共通契約を扱い、基盤 6 ドメインはシステム全体の構成・フォーマット・整合性検査等を扱う（両系統を混同しない）。横断 SPEC は個別 SPEC の代替ではない。
- **DOC-MAP** は非正規のナビゲーション索引である。REQ、ADR、SPEC のいずれも代替しない。
