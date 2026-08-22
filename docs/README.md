# ドキュメント入口

AgentDevFlow の基本原則と管理方式は [DEC-001](decisions/DEC-001.md) と [憲章](guides/charter.md) を参照。
現行の REQ/Decision は `REQ-001〜`、`DEC-NNN`（3桁ゼロ埋め）のIDを使用し、過去版は tag `v2.11.0` と `v2:` プレフィックスで区別する。

## 要件

<!-- AUTOGEN:BEGIN:id=readme-req-summary-count -->
現行 REQ: 39件、廃止済み: 9件
<!-- AUTOGEN:END -->

現行要件は39件である（REQ-013 は後継 REQ-012 への移行として、REQ-022〜REQ-024 は達成済みとして、REQ-025・REQ-026・REQ-028 は移管完了に伴う恒常行移行済みとして、REQ-020・REQ-040 は最小トレーサビリティモデルへの再設計による後継 REQ-012 統合として retired/ へ移行、REQ-036〜REQ-048 を追加。番号には欠番が存在する）。
REQ-022・REQ-024 の旧規範内容（augmentation 配置先、check_graph.ts 抽出規則と warning 分類）は旧 Artifact Graph とともに廃止された（DEC-017）。履歴は retired REQ ファイルと版管理で参照できる。
各 REQ の詳細は各 REQ ファイル本文を参照。

| REQ | タイトル |
|---|---|
| [REQ-001](requirements/REQ-001.md) | 文書体系と持続可能な基準構造 |
| [REQ-002](requirements/REQ-002.md) | 配布成果物の責務境界 |
| [REQ-003](requirements/REQ-003.md) | 委譲時の判断・承認・副作用境界 |
| [REQ-004](requirements/REQ-004.md) | 要求の形成と合意 |
| [REQ-005](requirements/REQ-005.md) | ワークフロープロトコルと工程接続 |
| [REQ-006](requirements/REQ-006.md) | Case実行オーケストレーション |
| [REQ-007](requirements/REQ-007.md) | 完了報告と成果物品質ゲート |
| [REQ-008](requirements/REQ-008.md) | 一時成果物ライフサイクル |
| [REQ-009](requirements/REQ-009.md) | 配布基盤と導入モデル |
| [REQ-010](requirements/REQ-010.md) | 自己監査コマンド（docs-check） |
| [REQ-011](requirements/REQ-011.md) | I/O境界と外部連携手段 |
| [REQ-012](requirements/REQ-012.md) | 成果物トレーサビリティ |
| [REQ-014](requirements/REQ-014.md) | adversarial-review caller integration 共通契約 |
| [REQ-015](requirements/REQ-015.md) | adversarial-review caller integration 7経路+case-auto |
| [REQ-016](requirements/REQ-016.md) | adversarial-review caller integration 横断整合 |
| [REQ-017](requirements/REQ-017.md) | Issue Execution Contract |
| [REQ-018](requirements/REQ-018.md) | worktree 構造的制約とテスト fallback |
| [REQ-019](requirements/REQ-019.md) | テスト影響範囲検出 gate |
| [REQ-021](requirements/REQ-021.md) | トレーサビリティのワークフロー統合 |
| [REQ-027](requirements/REQ-027.md) | Capability Skill・Soft guard・代表ケース検証 |
| [REQ-029](requirements/REQ-029.md) | 配布依存境界 |
| [REQ-030](requirements/REQ-030.md) | case-open 実行契約（Issue構成生成） |
| [REQ-031](requirements/REQ-031.md) | case-run 実行契約（実装実行と委譲） |
| [REQ-032](requirements/REQ-032.md) | case-close 実行契約（完了判定とマージ） |
| [REQ-033](requirements/REQ-033.md) | case-update 実行契約（Issue・要件更新） |
| [REQ-034](requirements/REQ-034.md) | case-auto 実行契約（自走オーケストレーション） |
| [REQ-035](requirements/REQ-035.md) | Epic と Wave 実行モデル |
| [REQ-036](requirements/REQ-036.md) | 検出と診断コマンド群（inspect 系） |
| [REQ-037](requirements/REQ-037.md) | 取り込みパイプライン（intake） |
| [REQ-038](requirements/REQ-038.md) | 学習パイプライン（learning） |
| [REQ-039](requirements/REQ-039.md) | バックログ統合（backlog-review） |
| [REQ-041](requirements/REQ-041.md) | backlog 一括整理コマンド（backlog-auto）実行契約 |
| [REQ-042](requirements/REQ-042.md) | Case統合先とブランチモデル |
| [REQ-043](requirements/REQ-043.md) | 評価ブランチ実証ワークフロー |
| [REQ-044](requirements/REQ-044.md) | 標準API委譲の状態制約 |
| [REQ-045](requirements/REQ-045.md) | 現行成果物体系の整合性網羅監査 |
| [REQ-046](requirements/REQ-046.md) | 横断正規化後の不変条件 |
| [REQ-047](requirements/REQ-047.md) | 規則所有権の一方向化 |
| [REQ-048](requirements/REQ-048.md) | ADF 実行効率第1次改善（実行観測基盤） |

- [要件インデックス](requirements/README.md)

## Decision

現行 Decision は DEC-001 から DEC-019 の19件である（DEC-018、DEC-019 は proposed、DEC-005、DEC-007 は superseded）。
詳細は [Decision インデックス](decisions/README.md) 参照。

| Decision | タイトル |
|---|---|
| [DEC-001](decisions/DEC-001.md) | AgentDevFlow 憲章 |
| [DEC-002](decisions/DEC-002.md) | OpenCode ソース・プロジェクション分離 |
| [DEC-003](decisions/DEC-003.md) | req_draft ソフトコントラクト原則 |
| [DEC-004](decisions/DEC-004.md) | 差し替え可能な I/O 境界 |
| [DEC-005](decisions/DEC-005.md) | Project Extensions Architecture（superseded by DEC-006） |
| [DEC-006](decisions/DEC-006.md) | inspect 3-command 構成への正規化 |
| [DEC-007](decisions/DEC-007.md) | Artifact Graph 標準化と配布スキル昇格（superseded by DEC-017） |
| [DEC-008](decisions/DEC-008.md) | case-auto の限定的親判断解決（bounded parent decision resolution） |
| [DEC-009](decisions/DEC-009.md) | ADR から Decision への正規成果物モデル移行 |
| [DEC-010](decisions/DEC-010.md) | Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則 |
| [DEC-011](decisions/DEC-011.md) | STEP resume point と会話記憶非依存 |
| [DEC-012](decisions/DEC-012.md) | Extension を file-kind から workflow/capability responsibility へ再編 |
| [DEC-013](decisions/DEC-013.md) | IR 登録モデルの簡素化 — 現存 IR を実行可能な恒久統制に限定 |
| [DEC-014](decisions/DEC-014.md) | 配布依存境界の多層 enforcement |
| [DEC-015](decisions/DEC-015.md) | ADF決定論的実行中核と実行基盤実行機構の責務分界 |
| [DEC-016](decisions/DEC-016.md) | 導入系スクリプトの副作用ゼロ原則（proposed） |
| [DEC-017](decisions/DEC-017.md) | 最小トレーサビリティモデルの採用と Artifact Graph の廃止（proposed） |
| [DEC-018](decisions/DEC-018.md) | 評価ブランチモデルとCase統合先の一般化（proposed） |
| [DEC-019](decisions/DEC-019.md) | 一般処理の標準API委譲とADF固有意味論の所有境界（proposed） |

## 設計（Design）

Design は 3 層構造（commands / skills / workflows）と基盤 6 ドメイン（foundations / responsibilities / quality / integrity / local / authoring）を持つ。
詳細は [Design インデックス](designs/README.md) 参照。

### 横断 Design（`designs/workflows/`）

- [ワークフロー契約（横断）](designs/workflows/workflow-contracts.md)
- [サブエージェント委譲契約](designs/workflows/delegation-contracts.md)
- [キャプチャ境界](designs/workflows/capture-boundaries.md)
- [Epic / Wave / Issue 実行モデル](designs/workflows/epic-wave-model.md)
- [RU / 採用済み成果物 / draft lifecycle](designs/workflows/backlog-artifact-lifecycle.md)

### command Design / skill Design

- [command Design 一覧](designs/commands/)：各 `/agentdev/*` コマンド専用 Design（`_template.md` 含む）
- [skill Design 一覧](designs/skills/)：各 `agentdev-*` スキル専用 Design（`_template.md` 含む）

### 基盤 Design（`designs/{foundations,responsibilities,quality,integrity,local,authoring}/`）

基盤 Design は 6 ドメインへ整理済み。
各ドメイン直下に主要 Design を置き、詳細・実装固有事項は `references/` サブディレクトリへ分離する（Wave 3 再構築）。

- [システム仕様](designs/foundations/system.md)
- [文書フォーマット規約](designs/foundations/patterns.md)
- [設計原則](designs/foundations/design-principles.md)
- [文書モデル](designs/foundations/document-model.md)
- [harness 分離モデル](designs/foundations/harness-separation-model.md)
- [Project Extensions](designs/foundations/project-extensions.md)
- [文書種別責務・配置基準](designs/responsibilities/document-type-responsibilities.md)
- [アーティファクト契約](designs/responsibilities/artifact-contracts.md)
- [成果物責任表](designs/responsibilities/artifact-responsibilities.md)
- [品質仕様](designs/quality/quality-specs.md)
- [品質ゲート](designs/quality/quality-gates.md)
- [REQ 健全性メトリクス](designs/quality/req-health-metrics.md)
- [整合性契約](designs/integrity/integrity-contracts.md)
- [整合性ルールカタログ](designs/integrity/integrity-rule-catalog.md)
- [ルール所有権マトリックス](designs/integrity/rule-ownership.md)
- [実行時パッケージ境界](designs/local/runtime-package-boundary.md)
- [ローカル Case ファイル](designs/local/local-case-file.md)
- [コマンドファイルフォーマット規約](designs/authoring/command-file-format.md)

## Report

監査・評価・観測記録は Report として `docs/reports/` へ分離している。
Report は Design インデックスの管理対象外である（`designs/README.md`「Report の分離」参照）。

## ガイド

- [ガイド入口](guides/README.md)
- [憲章](guides/charter.md)
- [クイックスタート](guides/quickstart.md)
- [コマンド選択](guides/command-selection.md)
- [要件定義 → Case実行フロー](guides/req-case-flow.md)
- [Intake / Learning / Backlog フロー](guides/intake-learning-backlog-flow.md)
- [診断・メンテナンス](guides/diagnostics-and-maintenance.md)
- [成果物・状態モデル](guides/artifacts-and-state.md)
- [プロジェクトドキュメントと Design](guides/project-docs-and-specs.md)
- [Consumer Project 導入](guides/consumer-project-setup.md)
- [トラブルシューティング](guides/troubleshooting.md)
- [用語集](guides/glossary.md)
