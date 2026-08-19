# ドキュメント入口

AgentDevFlow の基本原則と管理方式は [DEC-001](decisions/DEC-001.md) と [憲章](guides/charter.md) を参照。
現行の REQ/Decision は `REQ-001〜`、`DEC-NNN`（3桁ゼロ埋め）のIDを使用し、過去版は tag `v2.11.0` と `v2:` プレフィックスで区別する。

## 要件

<!-- AUTOGEN:BEGIN:id=readme-req-summary-count -->
現行 REQ: 34件、廃止済み: 7件
<!-- AUTOGEN:END -->

現行要件は34件である（REQ-013 は後継 REQ-012 への移行として、REQ-022〜REQ-024 は達成済みとして、REQ-025・REQ-026・REQ-028 は移管完了に伴う恒常行移行済みとして retired/ へ移行、REQ-036〜REQ-041 を追加。番号には欠番が存在する）。
REQ-022 の規範内容は、後継の [agentdev-artifact-graph SPEC](specs/skills/agentdev-artifact-graph.md)「augmentation 配置先」節が正規所有する。
REQ-024 の抽出規則と warning 分類は、後継の [agentdev-artifact-graph SPEC](specs/skills/agentdev-artifact-graph.md)「check_graph.ts 抽出規則と warning 分類」節と `scripts/lib/checker.ts` が正規所有する。
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
| [REQ-012](requirements/REQ-012.md) | Artifact Graph 標準化 |
| [REQ-014](requirements/REQ-014.md) | adversarial-review caller integration 共通契約 |
| [REQ-015](requirements/REQ-015.md) | adversarial-review caller integration 7経路+case-auto |
| [REQ-016](requirements/REQ-016.md) | adversarial-review caller integration 横断整合 |
| [REQ-017](requirements/REQ-017.md) | Issue Execution Contract |
| [REQ-018](requirements/REQ-018.md) | worktree 構造的制約とテスト fallback |
| [REQ-019](requirements/REQ-019.md) | テスト影響範囲検出 gate |
| [REQ-020](requirements/REQ-020.md) | Artifact Graph 解析品質と検証 |
| [REQ-021](requirements/REQ-021.md) | Artifact Graph ワークフロー統合 |
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
| [REQ-040](requirements/REQ-040.md) | トレーサビリティ高位問い合わせ（Trace Query） |
| [REQ-041](requirements/REQ-041.md) | backlog 一括整理コマンド（backlog-auto）実行契約 |

- [要件インデックス](requirements/README.md)

## Decision

現行 Decision は DEC-001 から DEC-017 の17件である（DEC-016、DEC-017 は proposed、DEC-005 は superseded）。
詳細は [Decision インデックス](decisions/README.md) 参照。

| Decision | タイトル |
|---|---|
| [DEC-001](decisions/DEC-001.md) | AgentDevFlow 憲章 |
| [DEC-002](decisions/DEC-002.md) | OpenCode ソース・プロジェクション分離 |
| [DEC-003](decisions/DEC-003.md) | req_draft ソフトコントラクト原則 |
| [DEC-004](decisions/DEC-004.md) | 差し替え可能な I/O 境界 |
| [DEC-005](decisions/DEC-005.md) | Project Extensions Architecture（superseded by DEC-006） |
| [DEC-006](decisions/DEC-006.md) | inspect 3-command 構成への正規化 |
| [DEC-007](decisions/DEC-007.md) | Artifact Graph 標準化と配布スキル昇格 |
| [DEC-008](decisions/DEC-008.md) | case-auto の限定的親判断解決（bounded parent decision resolution） |
| [DEC-009](decisions/DEC-009.md) | ADR から Decision への正規成果物モデル移行 |
| [DEC-010](decisions/DEC-010.md) | Command / Workflow Skill / Capability Skill 責務3層分化と1:N分割原則 |
| [DEC-011](decisions/DEC-011.md) | STEP resume point と会話記憶非依存 |
| [DEC-012](decisions/DEC-012.md) | Extension を file-kind から workflow/capability responsibility へ再編 |
| [DEC-013](decisions/DEC-013.md) | IR 登録モデルの簡素化 — 現存 IR を実行可能な恒久統制に限定 |
| [DEC-014](decisions/DEC-014.md) | 配布依存境界の多層 enforcement |
| [DEC-015](decisions/DEC-015.md) | ADF決定論的実行中核と実行基盤実行機構の責務分界 |
| [DEC-016](decisions/DEC-016.md) | 導入系スクリプトの副作用ゼロ原則（proposed） |
| [DEC-017](decisions/DEC-017.md) | TIM 準拠トレーサビリティモデルの採用と4層分離（proposed） |

## 仕様（SPEC）

SPEC は 3 層構造（commands / skills / workflows）と基盤 6 ドメイン（foundations / responsibilities / quality / integrity / local / authoring）を持つ。
詳細は [SPEC インデックス](specs/README.md) 参照。

### 横断 SPEC（`specs/workflows/`）

- [ワークフロー契約（横断）](specs/workflows/workflow-contracts.md)
- [サブエージェント委譲契約](specs/workflows/delegation-contracts.md)
- [キャプチャ境界](specs/workflows/capture-boundaries.md)
- [Epic / Wave / Issue 実行モデル](specs/workflows/epic-wave-model.md)
- [RU / 採用済み成果物 / draft lifecycle](specs/workflows/backlog-artifact-lifecycle.md)

### command SPEC / skill SPEC

- [command SPEC 一覧](specs/commands/)：各 `/agentdev/*` コマンド専用 SPEC（`_template.md` 含む）
- [skill SPEC 一覧](specs/skills/)：各 `agentdev-*` スキル専用 SPEC（`_template.md` 含む）

### 基盤 SPEC（`specs/{foundations,responsibilities,quality,integrity,local,authoring}/`）

基盤 SPEC は 6 ドメインへ整理済み。
各ドメイン直下に主要 SPEC を置き、詳細・実装固有事項は `references/` サブディレクトリへ分離する（Wave 3 再構築）。

- [システム仕様](specs/foundations/system.md)
- [文書フォーマット規約](specs/foundations/patterns.md)
- [設計原則](specs/foundations/design-principles.md)
- [文書モデル](specs/foundations/document-model.md)
- [harness 分離モデル](specs/foundations/harness-separation-model.md)
- [Project Extensions](specs/foundations/project-extensions.md)
- [文書種別責務・配置基準](specs/responsibilities/document-type-responsibilities.md)
- [アーティファクト契約](specs/responsibilities/artifact-contracts.md)
- [成果物責任表](specs/responsibilities/artifact-responsibilities.md)
- [品質仕様](specs/quality/quality-specs.md)
- [品質ゲート](specs/quality/quality-gates.md)
- [REQ 健全性メトリクス](specs/quality/req-health-metrics.md)
- [整合性契約](specs/integrity/integrity-contracts.md)
- [整合性ルールカタログ](specs/integrity/integrity-rule-catalog.md)
- [ルール所有権マトリックス](specs/integrity/rule-ownership.md)
- [実行時パッケージ境界](specs/local/runtime-package-boundary.md)
- [ローカル Case ファイル](specs/local/local-case-file.md)
- [コマンドファイルフォーマット規約](specs/authoring/command-file-format.md)

## ガイド

- [ガイド入口](guides/README.md)
- [憲章](guides/charter.md)
- [クイックスタート](guides/quickstart.md)
- [コマンド選択](guides/command-selection.md)
- [要件定義 → Case実行フロー](guides/req-case-flow.md)
- [Intake / Learning / Backlog フロー](guides/intake-learning-backlog-flow.md)
- [診断・メンテナンス](guides/diagnostics-and-maintenance.md)
- [成果物・状態モデル](guides/artifacts-and-state.md)
- [プロジェクトドキュメントと SPEC](guides/project-docs-and-specs.md)
- [Consumer Project 導入](guides/consumer-project-setup.md)
- [トラブルシューティング](guides/troubleshooting.md)
- [用語集](guides/glossary.md)
