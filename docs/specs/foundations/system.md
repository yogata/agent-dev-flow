---
updated: 2026-06-21
status: accepted
---

# システム仕様

> **縮小済み**: 本 SPEC は AG-012 文書体系再構築により縮小した。
> コマンドシステム概要のみを残し、個別動作（Epic フロー、自律修正ループ、達成判定プロトコル、Capture、ID 体系、REQ 基準構造、分類ゲート）は各 SPEC へ移管した。

## コマンドシステム

### AgentDevFlow コマンド群

AgentDevFlow（`/agentdev/*` コマンド体系）は 3 つのパイプラインで構成され、開発ワークフローを提供する。
コマンドごとに適切な agent を frontmatter に指定する。
対話系コマンド（req-define）は prometheus、ファイル操作系コマンドは sisyphus。

#### req/case パイプライン

| コマンド | 役割 | エージェント | 詳細 |
|---|---|---|---|
| `/agentdev/req-define` | 要件定義（壁打ち） | prometheus | [commands/req-define.md](../commands/req-define.md) |
| `/agentdev/req-save` | 要件定義の保存 | sisyphus | [commands/req-save.md](../commands/req-save.md) |
| `/agentdev/spec-save` | SPEC 候補の保存、確定 | sisyphus | [commands/spec-save.md](../commands/spec-save.md) |
| `/agentdev/case-open` | Issue 登録（連結成分ベース複数 Standard/Epic 構成生成、3軸判断） | sisyphus | [commands/case-open.md](../commands/case-open.md) |
| `/agentdev/case-run` | 実装パイプライン（3 フェーズ構成） | sisyphus | [commands/case-run.md](../commands/case-run.md) |
| `/agentdev/case-update` | Issue 更新 | sisyphus | [commands/case-update.md](../commands/case-update.md) |
| `/agentdev/case-close` | 完了処理（達成判定プロトコル付き完了ゲート） | sisyphus | [commands/case-close.md](../commands/case-close.md) |
| `/agentdev/case-auto` | 最大自走モード（複数 execution_unit 並列 orchestration、blocked 部分停止） | sisyphus | [commands/case-auto.md](../commands/case-auto.md) |

#### learning パイプライン

| コマンド/スキル | 役割 | 層 | 詳細 |
|---|---|---|---|
| `agentdev-learning-capture`（スキル） | エージェント主体で学びを検知、抽出、自律蓄積 | キャプチャ層 | [skills/agentdev-learning-capture.md](../skills/agentdev-learning-capture.md) |
| `/agentdev/learning-promote` | learning entry を分析、分類、昇華判定 | 昇華層 | [commands/learning-promote.md](../commands/learning-promote.md) |
| `/agentdev/backlog-review` | 採用済み成果物を分析、統合し RU を生成 | backlog 層 | [commands/backlog-review.md](../commands/backlog-review.md) |

#### intake ワークフロー

| コマンド | 役割 | 詳細 |
|---|---|---|
| `/agentdev/intake-capture` | 手動で気づき、課題を inbox に記録 | [commands/intake-capture.md](../commands/intake-capture.md) |
| `/agentdev/intake-from-github` | GitHub Issue/PR/コメントから改善候補を自動抽出 | [commands/intake-from-github.md](../commands/intake-from-github.md) |
| `/agentdev/intake-promote` | inbox item を採用済み成果物に整形 | [commands/intake-promote.md](../commands/intake-promote.md) |

#### integrity ワークフロー

docs-check は `/repo/*` コマンド体系の配布対象リポジトリ内コマンドである（ADR-0106、REQ-0108-156）。
AgentDevFlow の配布コマンドではなく、AgentDevFlow 本体リポジトリの自己監査コマンドである。

| コマンド | 役割 | エージェント |
|---|---|---|
| `/repo/docs-check` | AgentDevFlow 本体リポジトリの自己監査（配布対象外） | sisyphus |

#### inspect ワークフロー

| コマンド | 役割 | エージェント | 詳細 |
|---|---|---|---|
| `/agentdev/inspect-docs` | docs 全体の意味整合レビューと REQ 再構成診断 | prometheus | [commands/inspect-docs.md](../commands/inspect-docs.md) |
| `/agentdev/inspect-skills` | Command/Skill 参照妥当性、構造の検出 | prometheus | [commands/inspect-skills.md](../commands/inspect-skills.md) |
| `/agentdev/inspect-doc-inputs` | project doc-inputs 機構の整合性検出 | prometheus | [commands/inspect-doc-inputs.md](../commands/inspect-doc-inputs.md) |
| `/agentdev/inspect-promote` | 検出事項（finding）の分類、昇格 | prometheus | [commands/inspect-promote.md](../commands/inspect-promote.md) |

### 品質ゲート

品質ゲート（QG-1〜QG-4）は [quality-gates.md](../quality/quality-gates.md) で定義する。
case-run が QG-1〜QG-3（ローカル検証、CI 検証、乖離検出）、case-close が QG-4（最終完了判定ゲート）を担う。
詳細は同 SPEC および [skills/agentdev-quality-gates.md](../skills/agentdev-quality-gates.md) を参照。

### 移管済みセクション（参照先）

以下のセクションは個別 SPEC へ移管済み。
本ファイルでは概要のみを残す。

| 旧セクション | 移行先 |
|---|---|
| Epic（大規模 Issue 分割フロー）、Epic 自動クローズ、Epic ステータス追跡 | [workflows/epic-wave-model.md](../workflows/epic-wave-model.md) |
| 自律修正ループ（Self-Healing Loop） | [commands/case-run.md](../commands/case-run.md) |
| case-close 達成判定プロトコル | [commands/case-close.md](../commands/case-close.md) |
| Post-Run Capture（実行後キャプチャ） | [workflows/capture-boundaries.md](../workflows/capture-boundaries.md) |
| 関連ドキュメントの要件達成対象化 | [commands/case-run.md](../commands/case-run.md), [commands/case-close.md](../commands/case-close.md) |
| ID 体系（REQ/ADR/IR 桁数） | [patterns.md](patterns.md), [integrity-rule-catalog.md](../integrity/integrity-rule-catalog.md) |
| REQ 体系基準構造 | [req-health-metrics.md](../quality/req-health-metrics.md), [document-model.md](document-model.md) |
| REQ 分類ゲート | [commands/req-define.md](../commands/req-define.md), [commands/req-save.md](../commands/req-save.md) |
| Issue テンプレート完了条件セクション | [skills/agentdev-workflow-templates.md](../skills/agentdev-workflow-templates.md), [commands/case-open.md](../commands/case-open.md) |
| .opencode/ ディレクトリ責務、スクリプト配置方針、テスト配布方針 | [runtime-package-boundary.md](../local/runtime-package-boundary.md) |
| 安全性スキル（gh-cli） | [skills/agentdev-gh-cli.md](../skills/agentdev-gh-cli.md) |
| 整合性検査スキル（repo-`agentdev-integrity`） | (repo-local、配布対象外、SPEC 対象外) |

## 適用範囲宣言

`docs/specs/` は agent-dev-flow リポジトリ専用のリポジトリ内部設計文書である（ADR-0103）。
他プロジェクトへの適用を意図しない。
実行時コマンドは SPEC ファイルに依存しない（ADR-0104）。

## See Also

- [README.md](../README.md)（SPEC インデックス（3 層構造））
- [workflows/](../workflows/)（横断ワークフロー契約）
- [commands/](../commands/)（command SPEC）
- [skills/](../skills/)（skill SPEC）
