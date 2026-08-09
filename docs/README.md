# ドキュメント入口

AgentDevFlow の基本原則と管理方式は [ADR-001](adr/ADR-001.md) と [憲章](guides/charter.md) を参照。
現行の REQ/ADR は `REQ-001〜`、`ADR-001〜` の3桁IDを使用し、過去版は tag `v2.11.0` と `v2:` プレフィックスで区別する。

## 要件

<!-- AUTOGEN:BEGIN:id=readme-req-summary-count -->
現行 REQ: 20件、廃止済み: 0件
<!-- AUTOGEN:END -->

現行要件は REQ-001 から REQ-020 の20件である。各 REQ の詳細は各 REQ ファイル本文を参照。

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
| [REQ-010](requirements/REQ-010.md) | 自己監査と診断・是正候補抽出 |
| [REQ-011](requirements/REQ-011.md) | I/O境界と外部連携手段 |
| [REQ-012](requirements/REQ-012.md) | Artifact Graph 標準化 |
| [REQ-013](requirements/REQ-013.md) | DOC-MAP 依存除去 |
| [REQ-014](requirements/REQ-014.md) | adversarial-review caller integration 共通契約 |
| [REQ-015](requirements/REQ-015.md) | adversarial-review caller integration 7経路+case-auto |
| [REQ-016](requirements/REQ-016.md) | adversarial-review caller integration 横断整合 |
| [REQ-017](requirements/REQ-017.md) | Issue Execution Contract |
| [REQ-018](requirements/REQ-018.md) | worktree 構造的制約とテスト fallback |
| [REQ-019](requirements/REQ-019.md) | テスト影響範囲検出 gate |
| [REQ-020](requirements/REQ-020.md) | Artifact Graph 解析品質と検証 |

- [要件インデックス](requirements/README.md)

## ADR

現行 ADR は ADR-001 から ADR-007 の7件である。詳細は [ADR インデックス](adr/README.md) 参照。

| ADR | タイトル |
|---|---|
| [ADR-001](adr/ADR-001.md) | AgentDevFlow 憲章 |
| [ADR-002](adr/ADR-002.md) | OpenCode ソース・プロジェクション分離 |
| [ADR-003](adr/ADR-003.md) | req_draft ソフトコントラクト原則 |
| [ADR-004](adr/ADR-004.md) | 差し替え可能な I/O 境界 |
| [ADR-005](adr/ADR-005.md) | Project Extensions Architecture（superseded by ADR-006） |
| [ADR-006](adr/ADR-006.md) | inspect 3-command 構成への正規化 |
| [ADR-007](adr/ADR-007.md) | Artifact Graph 標準化と配布スキル昇格 |

## 仕様（SPEC）

SPEC は 3 層構造（commands / skills / workflows）と基盤 6 ドメイン（foundations / responsibilities / quality / integrity / local / authoring）を持つ。詳細は [SPEC インデックス](specs/README.md) 参照。

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

基盤 SPEC は 6 ドメインへ整理済み。各ドメイン直下に主要 SPEC を置き、詳細・実装固有事項は `references/` サブディレクトリへ分離する（Wave 3 再構築）。

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
- [ローカル版 OpenCode 生成](specs/local/runtime-package-boundary.md)
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
