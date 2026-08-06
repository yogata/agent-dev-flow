# DOC-MAP

> DOC-MAP は文書探索・参照経路の入口であり、要件の基準ではない。基準は現行 REQ、ADR、SPEC の各ファイルである。

## 基準境界

| 文書種別 | 基準 | 役割 |
|---|---|---|
| 現行 REQ | `requirements/REQ-{NNN}.md` | 現行要件の永続基準（REQ-001〜011） |
| ADR | `adr/ADR-{NNN}.md` | アーキテクチャ決定記録（ADR-001〜006） |
| SPEC | `specs/**/*.md` | リポジトリ内部の設計文書（現在仕様）。commands/skills/workflows の3層と基盤6ドメイン（foundations/responsibilities/quality/integrity/local/authoring）で構成。実行時配布物の依存先ではない（charter 原則、ADR-001） |
| Guides | `guides/*.md` | 人間向けの案内層。規範的権限を持たない |
| DOC-MAP | このファイル | 文書探索入口 |

> 現行の REQ/ADR は `REQ-001〜`、`ADR-001〜` の3桁IDを使用する。
> 過去版の `REQ-01XX`、`ADR-01XX` 番号帯は tag `v2.11.0` を参照し、`v2:` プレフィックスで区別する。

## インデックス統計（自動生成）

<!-- AUTOGEN:BEGIN:id=docmap-inventory -->
- 現行 REQ: 11件（`docs/requirements/REQ-*.md`）
- ADR: 6件（`docs/adr/ADR-*.md`）
- SPEC: 150件（`docs/specs/**/*.md`）
<!-- AUTOGEN:END -->

## 現行 REQ

| REQ | タイトル | 概要 |
|---|---|---|
| [REQ-001](requirements/REQ-001.md) | 文書体系と持続可能な基準構造 | 文書種別責務、配置基準、ライフサイクル、探索経路 |
| [REQ-002](requirements/REQ-002.md) | 配布成果物の責務境界 | command/skill/template/script の責務、配布境界、ID・パス除外、Project Extensions との境界 |
| [REQ-003](requirements/REQ-003.md) | 委譲時の判断・承認・副作用境界 | 委譲時の判断・承認・副作用境界、許容・禁止・承認の境界定義 |
| [REQ-004](requirements/REQ-004.md) | 要求の形成と合意 | 要求の形成、合意、仕様候補の分離、構造化 req_draft |
| [REQ-005](requirements/REQ-005.md) | ワークフロープロトコルと工程接続 | work_type、workflow_route、SSoT、case-open/run/close 工程接続 |
| [REQ-006](requirements/REQ-006.md) | Case実行オーケストレーション | case-run、case-close、Epic/Wave、完了ゲート |
| [REQ-007](requirements/REQ-007.md) | 完了報告と成果物品質ゲート | 完了報告、GitHub本文品質、自然言語成果物品質 |
| [REQ-008](requirements/REQ-008.md) | 一時成果物ライフサイクル | intake / learning / backlog / inspect のライフサイクル、RU 管理 |
| [REQ-009](requirements/REQ-009.md) | 配布基盤と導入モデル | source/projection 分離、同期、リポジトリ種別、導入モデル |
| [REQ-010](requirements/REQ-010.md) | 自己監査と診断・是正候補抽出 | docs-check、検出事項の分類、是正候補抽出 |
| [REQ-011](requirements/REQ-011.md) | I/O境界と外部連携手段 | I/O 境界（agentdev-gh-cli）、外部エージェント統合 |

## ADR

| ADR | タイトル | 概要 |
|---|---|---|
| [ADR-001](adr/ADR-001.md) | AgentDevFlow 憲章 | 目的、責務境界、hard governance の限定、新規統制追加原則 |
| [ADR-002](adr/ADR-002.md) | OpenCode ソース・プロジェクション分離 | source/projection 分離モデル |
| [ADR-003](adr/ADR-003.md) | req_draft ソフトコントラクト原則 | req_draft soft-contract、LLM推論消費、厳格スキーマなし |
| [ADR-004](adr/ADR-004.md) | 差し替え可能な I/O 境界 | agentdev-gh-cli を差し替え可能な I/O 境界として確立 |
| [ADR-005](adr/ADR-005.md) | Project Extensions Architecture | `.agentdev/extensions/**` によるプロジェクト固有追加・拡張機構（ADR-006 により superseded） |
| [ADR-006](adr/ADR-006.md) | inspect 3-command 構成への正規化 | inspect-extensions 廃止と extension 検査の3層責務分離（deterministic check、semantic diagnosis、finding disposition） |

詳細は [ADR インデックス](adr/README.md) 参照。

## 仕様（SPEC）

SPEC は 3 層構造（commands / skills / workflows）と基盤 6 ドメイン（foundations / responsibilities / quality / integrity / local / authoring）を持つ。
横断 SPEC（`specs/workflows/`）は共通契約のみを扱い、個別 command / skill の動作は代替しない。

> **SPEC status 追跡**: SPEC の status（draft / accepted / superseded）は [specs/README.md](specs/README.md) が単一の追跡情報源である。本 DOC-MAP の SPEC 表には status 列を設けず、重複管理しない。draft SPEC 放置検出（IR-054）は [specs/integrity/integrity-rule-catalog.md](specs/integrity/integrity-rule-catalog.md) 参照。

### 横断 SPEC（`specs/workflows/`）

共通契約・共通状態・artifact lifecycle 等、複数コマンド・スキルにまたがる契約。個別 command / skill の現在動作は各 SPEC を参照のこと。

| SPEC | 内容 |
|---|---|
| [workflows/workflow-contracts.md](specs/workflows/workflow-contracts.md) | ワークフロー全体像・共通フェーズ・共通状態・artifact lifecycle・実装分類 |
| [workflows/delegation-contracts.md](specs/workflows/delegation-contracts.md) | サブエージェント委譲契約（委譲時最小契約・委譲種別・制約・manager-orchestrator 分離） |
| [workflows/capture-boundaries.md](specs/workflows/capture-boundaries.md) | キャプチャ境界（intake / learning 境界・Split Rule・PR 本文永続チャネル・REQ 再構成 intake） |
| [workflows/epic-wave-model.md](specs/workflows/epic-wave-model.md) | Epic / Wave / Issue 実行モデル（OU 階層・子Issue 状態 enum・Wave スケジューリング・execution_unit 定義・連結成分アルゴリズム・3軸判断モデル・per-Epic 単一書き手） |
| [workflows/backlog-artifact-lifecycle.md](specs/workflows/backlog-artifact-lifecycle.md) | RU / 採用済み成果物 / draft ライフサイクル・検出事項プロトコル・artifact_actions 工程分岐 |

詳細アルゴリズム参照として [workflows/references/execution-unit-construction.md](specs/workflows/references/execution-unit-construction.md) を配置する（Wave 3 再構築）。

### command SPEC（`specs/commands/`）

各 `/agentdev/*` 公開コマンドの現在動作。配布物（`src/opencode/commands/`）の動作を docs 内部から参照する用。

- [commands/_template.md](specs/commands/_template.md)：command SPEC テンプレート
- [commands/req-define.md](specs/commands/req-define.md)：`/agentdev/req-define`
- [commands/req-save.md](specs/commands/req-save.md)：`/agentdev/req-save`
- [commands/spec-save.md](specs/commands/spec-save.md)：`/agentdev/spec-save`
- [commands/case-open.md](specs/commands/case-open.md)：`/agentdev/case-open`
- [commands/case-run.md](specs/commands/case-run.md)：`/agentdev/case-run`
- [commands/case-close.md](specs/commands/case-close.md)：`/agentdev/case-close`
- [commands/case-auto.md](specs/commands/case-auto.md)：`/agentdev/case-auto`
- [commands/case-update.md](specs/commands/case-update.md)：`/agentdev/case-update`
- [commands/intake-capture.md](specs/commands/intake-capture.md)：`/agentdev/intake-capture`
- [commands/intake-from-github.md](specs/commands/intake-from-github.md)：`/agentdev/intake-from-github`
- [commands/intake-promote.md](specs/commands/intake-promote.md)：`/agentdev/intake-promote`
- [commands/learning-promote.md](specs/commands/learning-promote.md)：`/agentdev/learning-promote`
- [commands/backlog-review.md](specs/commands/backlog-review.md)：`/agentdev/backlog-review`
- [commands/inspect-docs.md](specs/commands/inspect-docs.md)：`/agentdev/inspect-docs`
- [commands/inspect-skills.md](specs/commands/inspect-skills.md)：`/agentdev/inspect-skills`
- [commands/inspect-promote.md](specs/commands/inspect-promote.md)：`/agentdev/inspect-promote`
- [commands/inspect-extensions.md](specs/commands/inspect-extensions.md)：`/agentdev/inspect-extensions`（ADR-006 により廃止、status: superseded。後継は docs-check / inspect-skills / inspect-promote の3層責務分離）

### skill SPEC（`specs/skills/`）

各 `agentdev-*` 配布スキルの現在動作。配布物（`src/opencode/skills/`）の動作を docs 内部から参照する用。

- [skills/_template.md](specs/skills/_template.md)：skill SPEC テンプレート
- skill SPEC 一覧は `specs/skills/` ディレクトリ配下。`repo-agentdev-integrity` は repo-local・配布対象外のため対象外。

### 基盤 SPEC（`specs/` 配下サブディレクトリ）

システム全体の構成・フォーマット・整合性検査など、複数層にまたがる基盤 SPEC。6 ドメイン（foundations/responsibilities/quality/integrity/local/authoring）へ整理済み。各ドメイン直下に主要 SPEC を配置し、詳細・実装固有事項は `references/` サブディレクトリへ分離する（Wave 3 再構築）。

主要 SPEC の抜粋。全一覧は [specs/README.md](specs/README.md) 参照。

| SPEC | 内容 |
|---|---|
| [system.md](specs/foundations/system.md) | コマンドシステムの構成 |
| [patterns.md](specs/foundations/patterns.md) | 文書フォーマット規約（frontmatter・命名・URL参照形式） |
| [design-principles.md](specs/foundations/design-principles.md) | 設計原則 |
| [document-model.md](specs/foundations/document-model.md) | 文書種別マトリックス・文書分類ポリシー・ドメイン別体系化規範 |
| [harness-separation-model.md](specs/foundations/harness-separation-model.md) | harness 分離モデル。具体抽象化は `references/concrete-abstraction.md` 参照 |
| [project-extensions.md](specs/foundations/project-extensions.md) | project extensions 機構（ADR-005） |
| [quality-specs.md](specs/quality/quality-specs.md) | 品質基準・検証ルール |
| [quality-gates.md](specs/quality/quality-gates.md) | QG-1〜QG-4 品質ゲート定義 |
| [document-type-responsibilities.md](specs/responsibilities/document-type-responsibilities.md) | 文書種別責務・配置基準 |
| [artifact-contracts.md](specs/responsibilities/artifact-contracts.md) | アーティファクト間契約 |
| [artifact-responsibilities.md](specs/responsibilities/artifact-responsibilities.md) | アーティファクト責務マトリックス |
| [req-impact-map.md](specs/responsibilities/req-impact-map.md) | REQ 影響マッピング |
| [responsibility-boundary-purification.md](specs/responsibilities/responsibility-boundary-purification.md) | 責務境界浄化: 所有/非所有リスト詳細 |
| [integrity-contracts.md](specs/integrity/integrity-contracts.md) | 整合性検査分類フレームワーク |
| [integrity-rule-catalog.md](specs/integrity/integrity-rule-catalog.md) | 整合性検査ルールのカタログ（個別ルールは `rules/`） |
| [rule-ownership.md](specs/integrity/rule-ownership.md) | ルール所有権マトリックス |
| [validator-split-criteria.md](specs/integrity/validator-split-criteria.md) | validator 分割基準（実装詳細は `references/validator-internal-config.md`） |
| [targeted-docs-guard-implementation.md](specs/integrity/targeted-docs-guard-implementation.md) | Targeted Docs Guard 実装詳細（移行作業は `references/targeted-docs-guard-implementation-details.md`） |
| [docs-spec-rebuild-integrity.md](specs/integrity/docs-spec-rebuild-integrity.md) | 配布物 ID 除去後の整合性検査ルール |
| [backticks-identifier-threshold.md](specs/integrity/backticks-identifier-threshold.md) | backticks 識別子/一般名詞 判定閾値 |
| [runtime-package-boundary.md](specs/local/runtime-package-boundary.md) | 実行時配布物の境界、link mode 導入フロー、link target 確認、更新運用 |
| [local-case-file.md](specs/local/local-case-file.md) | ローカル版 OpenCode の Case ファイルスキーマ・状態遷移・採番・見出し |
| [artifact-graph.md](specs/local/artifact-graph.md) | 本体リポジトリ固有の成果物間明示関係を検索する派生索引の生成、検査、問い合わせ契約 |
| [command-file-format.md](specs/authoring/command-file-format.md) | command 定義ファイルの Markdown 構成標準 |

## SPEC 探索経路ガイド

1. 個別コマンドの現在動作を知りたい → `specs/commands/<command>.md`
2. 個別スキルの現在動作を知りたい → `specs/skills/<skill-name>.md`
3. 複数コマンド・スキルにまたがる共通契約 → `specs/workflows/*.md`、`specs/workflows/references/*.md`
4. 文書フォーマット・設計原則・整合性検査基盤 → `specs/{foundations,responsibilities,quality,integrity,local,authoring}/*.md`（基盤 6 ドメイン、詳細は各 `references/` と `integrity/rules/`）

> workflows/ と foundations/ の使い分け: 正規の横断ワークフロー契約は `workflows/` 配下を参照。
> DOC-MAP は status の重複管理を行わず、探索導線に留める（status は `docs/specs/README.md` が単一の追跡情報源）。

## ガイド

| Guide | 内容 |
|---|---|
| [ガイド入口](guides/README.md) | ガイド一覧・案内 |
| [憲章](guides/charter.md) | 目的、責務境界、hard governance の限定、新規統制追加原則 |
| [クイックスタート](guides/quickstart.md) | 5コマンドで機能追加を完了する最小フロー |
| [コマンド選択](guides/command-selection.md) | 現在の状態から次のコマンドを選ぶ入口表 |
| [要件定義 → Case実行フロー](guides/req-case-flow.md) | req-define から case-close までの流れ |
| [Intake / Learning / Backlog フロー](guides/intake-learning-backlog-flow.md) | 作業候補・学びの収集から RU 生成まで |
| [診断・メンテナンス](guides/diagnostics-and-maintenance.md) | docs-check（/repo/docs-check: AgentDevFlow 本体リポジトリ専用自己監査） / inspect-docs |
| [成果物・状態モデル](guides/artifacts-and-state.md) | 成果物の種別・配置・ライフサイクル |
| [プロジェクトドキュメントと SPEC](guides/project-docs-and-specs.md) | REQ / ADR / SPEC / DOC-MAP の関係 |
| [Consumer Project 導入](guides/consumer-project-setup.md) | 外部プロジェクトへの AgentDevFlow 導入手順 |
| [トラブルシューティング](guides/troubleshooting.md) | よくある問題と対処法 |
| [用語集](guides/glossary.md) | AgentDevFlow の用語定義 |
