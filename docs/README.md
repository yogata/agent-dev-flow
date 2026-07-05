# ドキュメント入口

## 要件

現行要件の第一参照先は REQ-0101 から REQ-0160 までの 51 件（現行 REQ、REQ-0111, REQ-0115, REQ-0116, REQ-0117, REQ-0118, REQ-0120, REQ-0121, REQ-0122 は廃止）である。廃止済み REQ（REQ-0001〜REQ-0050, REQ-0111, REQ-0115, REQ-0116, REQ-0117, REQ-0118, REQ-0120, REQ-0121, REQ-0122）は削除せず [requirements/retired/](requirements/retired/) に移動し、履歴参照に限定する。REQ-0134 と REQ-0108 は ADR-0105 に基づく source/projection 分離要件を含む。REQ-0160 は project-extensions 機構（ADR-0135）の要件を定義する。

| REQ | タイトル |
|---|---|
| [REQ-0101](requirements/REQ-0101.md) | 文書・REQ管理基準 |
| [REQ-0102](requirements/REQ-0102.md) | 要件定義・保存 |
| [REQ-0103](requirements/REQ-0103.md) | Artifact責任分界 |
| [REQ-0104](requirements/REQ-0104.md) | Workflow / Command Protocol |
| [REQ-0105](requirements/REQ-0105.md) | RU lifecycle / Requirement Unit 管理 |
| [REQ-0106](requirements/REQ-0106.md) | Case実行オーケストレーション / Epic・Wave |
| [REQ-0107](requirements/REQ-0107.md) | Reporting / Writing Quality |
| [REQ-0108](requirements/REQ-0108.md) | docs-check / Validation / Tests |
| [REQ-0109](requirements/REQ-0109.md) | inspect-docs / REQ再構成運用 |
| [REQ-0110](requirements/REQ-0110.md) | Git worktree cleanup 信頼性 |
| [REQ-0112](requirements/REQ-0112.md) | ADRライフサイクル標準化・文書体系正規化・実行時独立性 |
| [REQ-0113](requirements/REQ-0113.md) | Skill References SPEC分離基準 |
| [REQ-0114](requirements/REQ-0114.md) | /agentdev/case-auto 最大自走モード |
| [REQ-0119](requirements/REQ-0119.md) | コマンド・スキル・サブエージェント責務分界の再基準化 |
| [REQ-0123](requirements/REQ-0123.md) | workflow-lifecycle 宣言的純化とコマンド固有手順の目的別スキル移管 |
| [REQ-0124](requirements/REQ-0124.md) | AgentDevFlow inspect-* 検出コマンド群と inspect lifecycle |
| [REQ-0125](requirements/REQ-0125.md) | inspect-skills / Command/Skill参照妥当性検出 |
| [REQ-0126](requirements/REQ-0126.md) | inspect-promote / 検出finding分類・昇格 |
| [REQ-0127](requirements/REQ-0127.md) | Intake command群 (capture / from-github / promote) |
| [REQ-0128](requirements/REQ-0128.md) | Learning-promote |
| [REQ-0129](requirements/REQ-0129.md) | Backlog-review |
| [REQ-0130](requirements/REQ-0130.md) | case-run / 実装パイプライン |
| [REQ-0131](requirements/REQ-0131.md) | case-close / 完了処理 |
| [REQ-0132](requirements/REQ-0132.md) | case-open / Issue作成 |
| [REQ-0133](requirements/REQ-0133.md) | case-update / Issue更新 |
| [REQ-0134](requirements/REQ-0134.md) | 配布基盤: source/projection・sync・repo type・consumer install |
| [REQ-0135](requirements/REQ-0135.md) | Drafts配置・Draft Type Registry |
| [REQ-0136](requirements/REQ-0136.md) | REQ/SPEC 責務分離の徹底と新ワークフロー（spec-save 新設・req-define 強化） |
| [REQ-0137](requirements/REQ-0137.md) | 並列実行安全 git 操作規律（共有作業ツリーでの case-auto 並行実行支援） |
| [REQ-0138](requirements/REQ-0138.md) | 構造化req_draft契約 |
| [REQ-0139](requirements/REQ-0139.md) | 外部エージェント統合契約 |
| [REQ-0140](requirements/REQ-0140.md) | 文書品質ゲート |
| [REQ-0141](requirements/REQ-0141.md) | ローカル版 OpenCode 導入方式とローカルCaseファイル運用 |
| [REQ-0142](requirements/REQ-0142.md) | 配布物ID除去後の文意保持・構文健全性・責務整合 |
| [REQ-0143](requirements/REQ-0143.md) | Command 定義ファイルフォーマット標準化 |
| [REQ-0144](requirements/REQ-0144.md) | docs-check/integrity 運用是正 |
| [REQ-0145](requirements/REQ-0145.md) | docs-check/integrity 検出設計改善 |
| [REQ-0146](requirements/REQ-0146.md) | 実行契約・委譲・プロセス設計 |
| [REQ-0147](requirements/REQ-0147.md) | 文書化規律・HITL境界 |
| [REQ-0148](requirements/REQ-0148.md) | RU群バッチ処理と複数 execution_unit 並列実行 |
| [REQ-0149](requirements/REQ-0149.md) | agentdev-gh-cli 手続き委譲基盤 |
| [REQ-0150](requirements/REQ-0150.md) | ローカル版 agentdev-gh-cli 実装 |
| [REQ-0151](requirements/REQ-0151.md) | コンフリクト解消モデルと実行時間観測 |
| [REQ-0152](requirements/REQ-0152.md) | gh 直接記述機械検出（IR-053） |
| [REQ-0153](requirements/REQ-0153.md) | 機械横断是正の完了証明 |
| [REQ-0154](requirements/REQ-0154.md) | SPEC status 追跡と draft 放置検出 |
| [REQ-0155](requirements/REQ-0155.md) | 文書粒度モデル |
| [REQ-0156](requirements/REQ-0156.md) | docs/specs 基盤SPECドメイン別体系化 |
| [REQ-0158](requirements/REQ-0158.md) | Targeted Docs Integrity Guard |
| [REQ-0159](requirements/REQ-0159.md) | 配布物依存スキルの src 昇格方針と未トラックスキル検出 |
| [REQ-0160](requirements/REQ-0160.md) | Project Extensions 機構と配布物参照境界 |

- [要件インデックス](requirements/README.md)
- [移行表](requirements/mapping-table.md)
- [廃止済み要件](requirements/retired/)

## 仕様（SPEC）

SPEC は 3 層構造を持つ（commands / skills / workflows）。詳細は [SPEC インデックス](specs/README.md) 参照。

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

基盤 SPEC は REQ-0156 に基づき6ドメインへ整理済み。各ドメインの責務は [document-model.md](specs/foundations/document-model.md)「docs/specs/ 直下のドメイン別体系化」参照。

- [システム仕様](specs/foundations/system.md)
- [文書フォーマット規約](specs/foundations/patterns.md)
- [設計原則](specs/foundations/design-principles.md)
- [品質仕様](specs/quality/quality-specs.md)
- [品質ゲート](specs/quality/quality-gates.md)
- [文書モデル](specs/foundations/document-model.md)
- [文書種別責務・配置基準](specs/responsibilities/document-type-responsibilities.md)
- [アーティファクト契約](specs/responsibilities/artifact-contracts.md)
- [成果物責任表](specs/responsibilities/artifact-responsibilities.md)
- [整合性契約](specs/integrity/integrity-contracts.md)
- [整合性ルールカタログ](specs/integrity/integrity-rule-catalog.md)
- [ワークフロー契約（旧版・縮小済み）](specs/foundations/workflow-contracts.md)：旧版互換索引（縮小済み参照ファイル）。正規の横断ワークフロー契約は [workflows/](specs/workflows/) 配下を参照
- [実行時パッケージ境界](specs/local/runtime-package-boundary.md)
- [ローカル Case ファイル](specs/local/local-case-file.md)
- [ローカル版 OpenCode 生成](specs/local/local-generation.md)
- [ルール所有権マトリックス](specs/integrity/rule-ownership.md)
- [REQ 影響マップ](specs/responsibilities/req-impact-map.md)
- [REQ 健全性メトリクス](specs/quality/req-health-metrics.md)

## ADR

- [ADR インデックス](adr/README.md)

## ガイド

- [ガイド入口](guides/README.md)
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

## DOC-MAP

- [DOC-MAP](DOC-MAP.md)
