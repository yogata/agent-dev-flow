# DOC-MAP

> DOC-MAP は文書探索・参照経路の入口であり、要件の基準ではない。基準は active REQ、ADR、SPEC の各ファイルである。

## 基準境界

| 文書種別 | 基準 | 役割 |
|---|---|---|
| active REQ | `requirements/REQ-{NNNN}.md` | 現行要件の永続基準 |
| retired REQ | `requirements/retired/REQ-{NNNN}.md` | 履歴参照。現行要件判断には使わない |
| ADR | `adr/ADR-{NNNN}.md` | アーキテクチャ決定記録 |
| retired ADR | `adr/retired/ADR-00XX.md` | 再編前ADRの履歴番号帯。現行根拠として引用しない（REQ-0112-047/048） |
| SPEC | `specs/*.md` | repo-internal 設計文書（現在仕様）。runtime 配布物の依存先ではない（ADR-0103, ADR-0104） |
| Guides | `guides/*.md` | 人間向け navigation 層。規範的権限を持たない（ADR-0103） |
| DOC-MAP | このファイル | 文書探索入口 |

## Active REQ

| REQ | タイトル | 概要 |
|---|---|---|
| [REQ-0101](requirements/REQ-0101.md) | 文書・REQ管理基準 | REQ/retired REQ/ADR/SPEC/DOC-MAP/guides の基準境界 |
| [REQ-0102](requirements/REQ-0102.md) | 要件定義・保存 | req-define / req-save / Requirement Source / 分類ゲート / operation unit / execution_groups |
| [REQ-0103](requirements/REQ-0103.md) | Artifact責任分界 | command / skill / template / script / namespace / frontmatter 規約 / runtime-only 配布制約 / source-projection分離 / sync・migration / namespace予約 / SSOT化 / registry化 / consumer導入モデル / consumer plugin checkout・install script分離 |
| [REQ-0104](requirements/REQ-0104.md) | Workflow / Command Protocol | ワークフロー、work_type + scale 分類、workflow_route、SSoT、case-open/run/close、upstream handoff protocol、OU処理モード、Epic候補グループ |
| [REQ-0105](requirements/REQ-0105.md) | Intake / Learning / Backlog | intake-promote（review統合）、learning-promote（refine統合）、backlog-review、RU lifecycle |
| [REQ-0106](requirements/REQ-0106.md) | Case実行・完了 | case-run、case-close、Epic/Wave、完了ゲート |
| [REQ-0107](requirements/REQ-0107.md) | Reporting / Writing Quality | 完了報告、GitHub本文品質、リンク、AI-slop抑止 |
| [REQ-0108](requirements/REQ-0108.md) | docs-check / Validation / Tests | 整合性検査、finding分類・route、レポート出力、ガードレール、体系的テスト、frontmatter 規約検査、artifact collection registry、source/projection scan分離、baseline管理、rule catalog、REQ impact map、3層gate、meta-integrity、repo-local自己監査（/repo/docs-check）・配布対象外 |
| [REQ-0109](requirements/REQ-0109.md) | REQ再構成運用 | retired archive、移行表、REQ再構成intake |
| [REQ-0110](requirements/REQ-0110.md) | Git worktree 削除リトライ | git-worktree、リトライ、信頼性 |
| [REQ-0112](requirements/REQ-0112.md) | ADRライフサイクル標準化・文書体系正規化・runtime独立性 | ADR status正規化、RU-ID排除、work_type固定、Pattern退場、integrity検査追加、ADR全面改定例外・01XX baseline・retired移動 |
| [REQ-0113](requirements/REQ-0113.md) | Skill References SPEC分離基準 | skill references 内 SPEC 相当記述の分離、runtime 自己完束制約 |
| [REQ-0114](requirements/REQ-0114.md) | /agentdev/case-auto 最大自走モード | case-auto orchestration、入力解決、work_type分岐、自走対象/対象外、停止条件、OU queue処理 |
| [REQ-0115](requirements/REQ-0115.md) | docs-* command suite 定義 | /repo/docs-check 改名、/agentdev/docs-review 新設、docs-review 統合、是正ルーティング |
| [REQ-0116](requirements/REQ-0116.md) | 文書分類ポリシー定義 | REQ/ADR/SPEC/Guide/Report/DOC-MAP/Retired 分類ルール・Document Authority Model・Report分類 |
| [REQ-0117](requirements/REQ-0117.md) | Git worktree junction 削除フォールバック手順 | git-worktree、junction、Windows、フォールバック手順 |
| [REQ-0118](requirements/REQ-0118.md) | Subagent edit safety ガイドライン | subagent、edit safety、command-authoring、skill-authoring、パス参照 |
| [REQ-0119](requirements/REQ-0119.md) | コマンド・スキル・サブエージェント責務分界の再基準化 | command 薄型化 / skill 詳細移管 / sub-agent 委譲境界 / Step 整数化 / verbatim 条件付き / delegation_type SPEC降格 / ADR-0112 accepted化 |
| [REQ-0120](requirements/REQ-0120.md) | Runtime Command 非必須参照除去 | command / token 最適化 / 非必須参照節削除 / 高頻度 command 優先 |
| [REQ-0121](requirements/REQ-0121.md) | Runtime Command 規範語見直し + Integrity 検査再定義 | command / token 最適化 / 規範語 / 自然文置換 / integrity 検査再定義 / 語彙ポリシー整合 |
| [REQ-0122](requirements/REQ-0122.md) | 規範語ルールおよび記載の完全削除 | active REQ / SPEC / ADR / integrity / runtime / 語彙ポリシー |

## Retired REQ

旧REQ 50件は [requirements/retired/](requirements/retired/) に移動した。旧REQから新active REQへの移行有無は [mapping-table.md](requirements/mapping-table.md) を参照する。

## Specifications

| SPEC | 内容 |
|---|---|
| [system.md](specs/system.md) | コマンドシステムの構成 |
| [patterns.md](specs/patterns.md) | 実装パターンと文書フォーマット |
| [design-principles.md](specs/design-principles.md) | 設計原則 |
| [quality-specs.md](specs/quality-specs.md) | 品質基準・検証ルール |
| [document-model.md](specs/document-model.md) | 文書種別の責務マトリックス |
| [artifact-contracts.md](specs/artifact-contracts.md) | アーティファクト間契約 |
| [integrity-contracts.md](specs/integrity-contracts.md) | 整合性検査分類フレームワーク |
| [workflow-contracts.md](specs/workflow-contracts.md) | ワークフロー契約の雛形 |
| [runtime-package-boundary.md](specs/runtime-package-boundary.md) | runtime 配布物の境界と依存制約 |
| [integrity-rule-catalog.md](specs/integrity-rule-catalog.md) | 整合性検査ルールのカタログ |
| [artifact-responsibilities.md](specs/artifact-responsibilities.md) | アーティファクト責務マトリックス |
| [req-impact-map.md](specs/req-impact-map.md) | REQ 影響マッピング |
| [rule-ownership.md](specs/rule-ownership.md) | ルール所有権マトリックス |

## ADR

| Index | 内容 |
|---|---|
| [ADR Index](adr/README.md) | ADR一覧、Status View、Topic View |

## Guides

| Guide | 内容 |
|---|---|
| [ガイド入口](guides/README.md) | ガイド一覧・案内 |
| [クイックスタート](guides/quickstart.md) | 5コマンドで機能追加を完了する最小フロー |
| [コマンド選択](guides/command-selection.md) | 現在の状態から次のコマンドを選ぶ入口表 |
| [要件定義 → Case実行フロー](guides/req-case-flow.md) | req-define から case-close までの流れ |
| [Intake / Learning / Backlog フロー](guides/intake-learning-backlog-flow.md) | 作業候補・学びの収集から RU 生成まで |
| [診断・メンテナンス](guides/diagnostics-and-maintenance.md) | docs-check（/repo/docs-check: self-hosting repo専用自己監査） / docs-review |
| [成果物・状態モデル](guides/artifacts-and-state.md) | 成果物の種別・配置・ライフサイクル |
| [プロジェクトドキュメントと SPEC](guides/project-docs-and-specs.md) | REQ / ADR / SPEC / DOC-MAP の関係 |
| [Consumer Project 導入](guides/consumer-project-setup.md) | 外部プロジェクトへの AgentDevFlow 導入手順 |
| [トラブルシューティング](guides/troubleshooting.md) | よくある問題と対処法 |
| [用語集](guides/glossary.md) | AgentDevFlow の用語定義 |
