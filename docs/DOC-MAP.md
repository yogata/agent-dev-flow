# DOC-MAP

> DOC-MAP は文書探索・参照経路の入口であり、要件の基準ではない。基準は現行 REQ、ADR、SPEC の各ファイルである。

## 基準境界

| 文書種別 | 基準 | 役割 |
|---|---|---|
| 現行 REQ | `requirements/REQ-{NNNN}.md` | 現行要件の永続基準 |
| 廃止済み REQ | `requirements/retired/REQ-{NNNN}.md` | 履歴参照。現行要件判断には使わない |
| ADR | `adr/ADR-{NNNN}.md` | アーキテクチャ決定記録 |
| 廃止済み ADR | `adr/retired/ADR-00XX.md` | 再編前 ADR の履歴番号帯。現行根拠として引用しない（REQ-0112-047/048） |
| SPEC | `specs/*.md` | リポジトリ内部の設計文書（現在仕様）。実行時配布物の依存先ではない（ADR-0103, ADR-0104） |
| Guides | `guides/*.md` | 人間向けの案内層。規範的権限を持たない（ADR-0103） |
| DOC-MAP | このファイル | 文書探索入口 |

## 現行 REQ

| REQ | タイトル | 概要 |
|---|---|---|
| [REQ-0101](requirements/REQ-0101.md) | 文書・REQ管理基準 | REQ/廃止済み REQ/ADR/SPEC/DOC-MAP/guides の基準境界 |
| [REQ-0102](requirements/REQ-0102.md) | 要件定義・保存 | req-define / req-save / 分類ゲート / operation unit / execution_groups / SPEC候補分離（draft-meta.spec-candidates） / SPLIT予兆検知（draft-meta.split-forecast） |
| [REQ-0103](requirements/REQ-0103.md) | Artifact責任分界 | command / skill / template / script / namespace / frontmatter 規約 / 実行時専用配布制約 / source-projection分離 / sync・migration / namespace予約 / SSOT化 / registry化 / consumer導入モデル / consumer plugin checkout・install script分離 |
| [REQ-0104](requirements/REQ-0104.md) | Workflow / Command Protocol | ワークフロー、work_type + scale 分類、workflow_route、SSoT、case-open/run/close、前工程からの引き継ぎプロトコル、OU処理モード、Epic候補グループ |
| [REQ-0105](requirements/REQ-0105.md) | RU lifecycle / Requirement Unit 管理 | intake-promote（review統合）、learning-promote（refine統合）、backlog-review、RU lifecycle |
| [REQ-0106](requirements/REQ-0106.md) | Case実行オーケストレーション / Epic・Wave | case-run、case-close、Epic/Wave、完了ゲート |
| [REQ-0107](requirements/REQ-0107.md) | Reporting / Writing Quality | 完了報告、GitHub本文品質、リンク、AI-slop抑止 |
| [REQ-0108](requirements/REQ-0108.md) | docs-check / Validation / Tests | 整合性検査、検出事項の分類・振り分け先、レポート出力、ガードレール、体系的テスト、frontmatter 規約検査、artifact collection registry、source/projection scan分離、基準管理、rule catalog、REQ impact map、3層gate、meta-integrity、配布対象外自己監査（/repo/docs-check） |
| [REQ-0109](requirements/REQ-0109.md) | inspect-docs / REQ体系整合性 | 廃止済みアーカイブ、移行表、REQ再構成intake |
| [REQ-0110](requirements/REQ-0110.md) | Git worktree cleanup 信頼性 | git-worktree、リトライ、信頼性 |
| [REQ-0112](requirements/REQ-0112.md) | ADRライフサイクル・文書体系基盤・実行時独立性 | ADR status正規化、RU-ID排除、work_type固定、Pattern退場、integrity検査追加、ADR全面改定例外・01XX 基準・廃止済みへの移動 |
| [REQ-0113](requirements/REQ-0113.md) | Skill References SPEC分離 | skill references 内 SPEC 相当記述の分離、実行時の自己完束制約 |
| [REQ-0114](requirements/REQ-0114.md) | /agentdev/case-auto 最大自走モード | case-auto orchestration、入力解決、work_type分岐、自走対象/対象外、停止条件、OU queue処理 |
| [REQ-0119](requirements/REQ-0119.md) | コマンド・スキル・サブエージェント責務分界 | command 薄型化 / skill 詳細移管 / sub-agent 委譲境界 / Step 整数化 / verbatim 条件付き / delegation_type SPEC降格 / ADR-0112 承認済み化 |
| [REQ-0123](requirements/REQ-0123.md) | workflow-lifecycle 宣言的定義責務とコマンド固有手順のスキル分担 | workflow-lifecycle 責務限定実装 / 4新規スキル移管 / Skill粒度基準 / DO NOT USE FOR整合 |
| [REQ-0124](requirements/REQ-0124.md) | AgentDevFlow inspect-* 検出コマンド群と inspect lifecycle | docs-review/skill-review/diagnostics-* 廃止・inspect-* 統一・draft type 廃止 |
| [REQ-0125](requirements/REQ-0125.md) | inspect-skills / Command/Skill参照妥当性検出 | inspect-skills 検出コマンド定義 |
| [REQ-0126](requirements/REQ-0126.md) | inspect-promote / 検出事項の分類・昇格 | inspect-promote 昇格コマンド定義 |
| [REQ-0127](requirements/REQ-0127.md) | Intake command群 (capture / from-github / promote) | intake-capture / intake-from-github / intake-promote 定義 |
| [REQ-0128](requirements/REQ-0128.md) | Learning-promote | learning-promote コマンド定義 |
| [REQ-0129](requirements/REQ-0129.md) | Backlog-review | backlog-review コマンド定義 |
| [REQ-0130](requirements/REQ-0130.md) | case-run / 実装パイプライン | case-run 3フェーズ構成・自律修正ループ |
| [REQ-0131](requirements/REQ-0131.md) | case-close / 完了処理 | case-close 完了ゲート・QG-4・達成判定 |
| [REQ-0132](requirements/REQ-0132.md) | case-open / Issue作成 | case-open Epic・子Issue作成 |
| [REQ-0133](requirements/REQ-0133.md) | case-update / Issue更新 | case-update Issue本文更新・コメント追加 |
| [REQ-0134](requirements/REQ-0134.md) | 配布基盤: source/projection・sync・repo type・consumer install | source/projection layout、sync/migration script、repo type、consumer install |
| [REQ-0135](requirements/REQ-0135.md) | Drafts配置・Draft Type Registry | `.agentdev/drafts/` 配置ルール、draft type registry、`.sisyphus/` 除外 |
| [REQ-0136](requirements/REQ-0136.md) | REQ/SPEC 責務分離の徹底と新ワークフロー（spec-save 新設・req-define 強化） | spec-save 新設、req-define SPEC分離強化、case-* SPEC確定フロー、inspect-promote 自動promote、REQ健全性メトリクス、SPEC lifecycle（draft/accepted） |

## 廃止済み REQ

旧REQ 50件は [requirements/retired/](requirements/retired/) に移動した。旧REQから新たな現行 REQ への移行有無は [mapping-table.md](requirements/mapping-table.md) を参照する。

## 仕様（SPEC）

| SPEC | 内容 |
|---|---|
| [system.md](specs/system.md) | コマンドシステムの構成 |
| [patterns.md](specs/patterns.md) | 実装パターンと文書フォーマット |
| [design-principles.md](specs/design-principles.md) | 設計原則 |
| [quality-specs.md](specs/quality-specs.md) | 品質基準・検証ルール |
| [quality-gates.md](specs/quality-gates.md) | QG-1〜QG-4 品質ゲート定義 |
| [document-model.md](specs/document-model.md) | 文書種別の責務マトリックス |
| [writing-style.md](specs/writing-style.md) | 文書執筆スタイルガイドライン |
| [artifact-contracts.md](specs/artifact-contracts.md) | アーティファクト間契約 |
| [integrity-contracts.md](specs/integrity-contracts.md) | 整合性検査分類フレームワーク |
| [workflow-contracts.md](specs/workflow-contracts.md) | ワークフロー契約の雛形・Local backend 差分 |
| [runtime-package-boundary.md](specs/runtime-package-boundary.md) | 実行時配布物の境界と依存制約 |
| [local-case-file.md](specs/local-case-file.md) | ローカル版 OpenCode の Case ファイルスキーマ・状態遷移・採番・見出し |
| [local-generation.md](specs/local-generation.md) | ローカル版 OpenCode 生成フロー・`generated_by` 識別子・ジャンクション検出安全ゲート |
| [local-transform.md](specs/local-transform.md) | ローカル版 OpenCode 変換プロンプト・レビュープロンプトの要件 |
| [integrity-rule-catalog.md](specs/integrity-rule-catalog.md) | 整合性検査ルールのカタログ |
| [artifact-responsibilities.md](specs/artifact-responsibilities.md) | アーティファクト責務マトリックス |
| [req-impact-map.md](specs/req-impact-map.md) | REQ 影響マッピング |
| [req-health-metrics.md](specs/req-health-metrics.md) | REQ 健全性メトリクス（肥大化・関心ズレ閾値） |
| [rule-ownership.md](specs/rule-ownership.md) | ルール所有権マトリックス |

## ADR

| Index | 内容 |
|---|---|
| [ADR インデックス](adr/README.md) | ADR 一覧、Status View、Topic View |

## ガイド

| Guide | 内容 |
|---|---|
| [ガイド入口](guides/README.md) | ガイド一覧・案内 |
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
