# DOC-MAP

> DOC-MAP は文書探索・参照経路の入口であり、要件の基準ではない。基準は active REQ、ADR、SPEC の各ファイルである。

## 基準境界

| 文書種別 | 基準 | 役割 |
|---|---|---|
| active REQ | `requirements/REQ-{NNNN}.md` | 現行要件の永続基準 |
| retired REQ | `requirements/retired/REQ-{NNNN}.md` | 履歴参照。現行要件判断には使わない |
| ADR | `adr/ADR-{NNNN}.md` | アーキテクチャ決定記録 |
| SPEC | `specs/*.md` | repo-internal 設計文書（現在仕様）。runtime 配布物の依存先ではない（ADR-0017, ADR-0018） |
| Guides | `guides/*.md` | 人間向け navigation 層。規範的権限を持たない（ADR-0017） |
| DOC-MAP | このファイル | 文書探索入口 |

## Active REQ

| REQ | タイトル | 概要 |
|---|---|---|
| [REQ-0101](requirements/REQ-0101.md) | 文書・REQ管理基準 | REQ/retired REQ/ADR/SPEC/DOC-MAP/guides の基準境界 |
| [REQ-0102](requirements/REQ-0102.md) | 要件定義・保存 | req-define / req-save / Requirement Source / 分類ゲート |
| [REQ-0103](requirements/REQ-0103.md) | Artifact責任分界 | command / skill / template / script / namespace / frontmatter 規約 / runtime-only 配布制約 / source-projection分離 / sync・migration / namespace予約 / SSOT化 / registry化 / consumer導入モデル |
| [REQ-0104](requirements/REQ-0104.md) | Workflow / Command Protocol | ワークフロー、work_type + scale 分類、workflow_route、SSoT、case-open/run/close |
| [REQ-0105](requirements/REQ-0105.md) | Intake / Learning / Backlog | intake、learning、backlog-review、backlog-save、RU lifecycle、session-sourced RU |
| [REQ-0106](requirements/REQ-0106.md) | Case実行・完了 | case-run、case-close、Epic/Wave、完了ゲート |
| [REQ-0107](requirements/REQ-0107.md) | Reporting / Writing Quality | 完了報告、GitHub本文品質、リンク、AI-slop抑止 |
| [REQ-0108](requirements/REQ-0108.md) | Integrity / Validation / Tests | 整合性検査、finding分類・route、レポート出力、ガードレール、体系的テスト、frontmatter 規約検査、artifact collection registry、source/projection scan分離、baseline管理、rule catalog、REQ impact map、3層gate、meta-integrity |
| [REQ-0109](requirements/REQ-0109.md) | REQ再構成運用 | retired archive、移行表、REQ再構成intake |
| [REQ-0110](requirements/REQ-0110.md) | Git worktree 削除リトライ | git-worktree、リトライ、信頼性 |
| [REQ-0111](requirements/REQ-0111.md) | Command authoring 後方互換性維持原則 | command-authoring、後方互換性、設計原則 |
| [REQ-0112](requirements/REQ-0112.md) | ADRライフサイクル・文書責務・runtime独立性・状態モデル統合是正 | ADR status正規化、RU-ID排除、work_type固定、Pattern退場、integrity検査追加 |
| [REQ-0113](requirements/REQ-0113.md) | Skill References SPEC分離基準 | skill references 内 SPEC 相当記述の分離、runtime 自己完束制約 |
| [REQ-0114](requirements/REQ-0114.md) | /agentdev/case-auto 最大自走モード | case-auto orchestration、入力解決、work_type分岐、自走対象/対象外、停止条件 |

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
| [診断・メンテナンス](guides/diagnostics-and-maintenance.md) | integrity-check / req-restructure-review |
| [成果物・状態モデル](guides/artifacts-and-state.md) | 成果物の種別・配置・ライフサイクル |
| [プロジェクトドキュメントと SPEC](guides/project-docs-and-specs.md) | REQ / ADR / SPEC / DOC-MAP の関係 |
| [トラブルシューティング](guides/troubleshooting.md) | よくある問題と対処法 |
| [用語集](guides/glossary.md) | AgentDevFlow の用語定義 |
