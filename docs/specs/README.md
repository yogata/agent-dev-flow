# SPEC インデックス

SPEC ファイルは現行アーキテクチャの正規文書である（REQ-0101）。システムが現在「どうなっているか」を記述し、満たすべき成果を定義する REQ ファイルとは対比される。

> **リポジトリ内部設計文書**: SPEC ファイルは agent-dev-flow リポジトリのリポジトリ内部設計文書である。実行時配布対象ではなく、実行時コマンドは本ファイル群に依存しない（ADR-0103, ADR-0104）。

## 3 層構造（AG-007, AG-008）

SPEC は commands / skills / workflows の 3 層ディレクトリ構造を持つ。横断 SPEC（`workflows/`）は共通契約のみを扱い、個別 command / skill の現在動作は代替しない。

| 層 | 配置先 | 役割 |
|---|---|---|
| commands/ | `specs/commands/<command-name>.md` | 各 `/agentdev/*` コマンド専用 SPEC |
| skills/ | `specs/skills/<skill-name>.md` | 各 `agentdev-*` スキル専用 SPEC |
| workflows/ | `specs/workflows/<topic>.md` | 複数コマンド・スキルにまたがる共通契約 |
| (直下) | `specs/*.md` | システム全体の構成・フォーマット・整合性検査など基盤 SPEC |

### command SPEC 一覧（`specs/commands/`）

- [_template.md](commands/_template.md) — command SPEC テンプレート
- [req-define.md](commands/req-define.md) / [req-save.md](commands/req-save.md) / [spec-save.md](commands/spec-save.md)
- [case-open.md](commands/case-open.md) / [case-run.md](commands/case-run.md) / [case-close.md](commands/case-close.md) / [case-auto.md](commands/case-auto.md) / [case-update.md](commands/case-update.md)
- [intake-capture.md](commands/intake-capture.md) / [intake-from-github.md](commands/intake-from-github.md) / [intake-promote.md](commands/intake-promote.md)
- [learning-promote.md](commands/learning-promote.md) / [backlog-review.md](commands/backlog-review.md)
- [inspect-docs.md](commands/inspect-docs.md) / [inspect-skills.md](commands/inspect-skills.md) / [inspect-promote.md](commands/inspect-promote.md)

`/repo/docs-check` は repo-local・配布対象外のため対象外。

### skill SPEC 一覧（`specs/skills/`）

- [_template.md](skills/_template.md) — skill SPEC テンプレート
- 中核スキル（docs/req/adr/workflow 系・12件）: agentdev-doc-writing, agentdev-req-analysis, agentdev-req-file-manager, agentdev-req-structure-diagnostics, agentdev-doc-map, agentdev-adr-file-manager, agentdev-adr-guidelines, agentdev-architecture-advisory, agentdev-workflow-orchestration, agentdev-workflow-routing, agentdev-workflow-lifecycle, agentdev-workflow-templates
- 補助スキル（case/intake/learning/検査/作成系・15件）: agentdev-case-run-execution-adapter, agentdev-issue-management, agentdev-epic-tracker, agentdev-gh-cli, agentdev-git-worktree, agentdev-intake-pipeline, agentdev-learning-capture, agentdev-learning-pipeline, agentdev-quality-gates, agentdev-inspect-skills, agentdev-command-authoring, agentdev-command-creator, agentdev-conventional-commits, agentdev-skill-authoring, agentdev-backlog-integration

`repo-agentdev-integrity` は repo-local・配布対象外のため対象外。

### 横断 SPEC 一覧（`specs/workflows/`）

| SPEC | タイトル | 責務 |
|------|---------|------|
| [workflows/workflow-contracts.md](workflows/workflow-contracts.md) | ワークフロー契約（横断） | パイプライン概要・共通フェーズ・SSoT 遷移・実装分類 |
| [workflows/delegation-contracts.md](workflows/delegation-contracts.md) | サブエージェント委譲契約 | 委譲時最小契約・委譲種別・制約・manager-orchestrator 分離 |
| [workflows/capture-boundaries.md](workflows/capture-boundaries.md) | キャプチャ境界 | intake / learning 境界・Split Rule・PR 本文永続チャネル |
| [workflows/epic-wave-model.md](workflows/epic-wave-model.md) | Epic / Wave / Issue 実行モデル | OU 階層・子Issue 状態 enum・Wave スケジューリング |
| [workflows/backlog-artifact-lifecycle.md](workflows/backlog-artifact-lifecycle.md) | RU / 採用済み成果物 / draft lifecycle | artifact lifecycle・検出事項プロトコル・artifact_actions 工程分岐 |

### 基盤 SPEC 一覧（`specs/` 直下）

| SPEC | タイトル | 責務 |
|------|---------|------|
| [system.md](system.md) | システム仕様 | コマンドシステムの構成定義・運用モデル |
| [patterns.md](patterns.md) | 文書フォーマット規約 | frontmatter 規約、REQ/SPEC/guides の記述形式、テンプレート命名規則、リポジトリ参照リンク規約 |
| [design-principles.md](design-principles.md) | 設計原則 | アーキテクチャ設計原則 |
| [quality-specs.md](quality-specs.md) | 品質仕様 | 品質基準・検証ルール |
| [quality-gates.md](quality-gates.md) | 品質ゲート | QG-1〜QG-4 定義・機械化境界・実装マッピング |
| [document-model.md](document-model.md) | 文書モデル | REQ/ADR/SPEC/guides/DOC-MAP の責務マトリックス |
| [writing-style.md](writing-style.md) | 文書執筆スタイルガイドライン | 文書品質ゲート原本仕様・REQ-0140 参照先・文書種別責務・要件行の書き方・要件性・粒度・移送判断・AI-slop検出基準 |
| [artifact-contracts.md](artifact-contracts.md) | アーティファクト契約 | Command/Skill/Template/Script の入出力・依存方向 |
| [artifact-responsibilities.md](artifact-responsibilities.md) | 成果物責任表 | 各成果物種別の正規所有者（canonical owner）と責務（REQ-0103-057） |
| [integrity-contracts.md](integrity-contracts.md) | 整合性契約 | strict/heuristic/observation 分類と検査カテゴリ |
| [integrity-rule-catalog.md](integrity-rule-catalog.md) | 整合性ルールカタログ | 整合性検査の全ルール定義（REQ-0108-150, 151） |
| [workflow-contracts.md](workflow-contracts.md) | ワークフロー契約（旧版・縮小済み） | 個別動作は各 command / skill SPEC および `workflows/` へ移管済み |
| [runtime-package-boundary.md](runtime-package-boundary.md) | 実行時パッケージ境界 | リポジトリ種別別 `.opencode/` 定義・命名規約・導入方式・同期範囲 |
| [local-case-file.md](local-case-file.md) | ローカル Case ファイル | ローカル版 OpenCode の Case ファイルスキーマ・状態遷移・採番・見出し（REQ-0141） |
| [local-generation.md](local-generation.md) | ローカル版 OpenCode 生成 | ローカル版生成フロー・`generated_by` 識別子・ジャンクション検出安全ゲート・ガードレール（REQ-0141, ADR-0126） |
| [local-transform.md](local-transform.md) | ローカル版 OpenCode 変換プロンプト | 変換用プロンプト・レビュー用プロンプト・変換仕様の要件（REQ-0141） |
| [rule-ownership.md](rule-ownership.md) | ルール所有権マトリックス | ルールドメインと責任 REQ/SPEC の対応（REQ-0103-058） |
| [req-impact-map.md](req-impact-map.md) | REQ 影響マップ | 各現行 REQ が影響する整合性ルールとアーティファクト（REQ-0108-152） |
| [req-health-metrics.md](req-health-metrics.md) | REQ 健全性メトリクス | REQ 肥大化・関心ズレ検出の定量閾値（要件行数・関心分類数・アーティファクト種別数）（REQ-0136-040） |
| [docs-spec-rebuild-integrity.md](docs-spec-rebuild-integrity.md) | 配布物整合性検査ルール | 配布物 ID 除去後の構文健全性・文意保持・責務整合の検査パターンと NG 分類（REQ-0142-006/007） |
| [command-file-format.md](command-file-format.md) | コマンドファイルフォーマット規約 | command 定義ファイルの Markdown 構成標準（Step 形式・ガードレール番号・禁止形式・機械検査対象） |

## 文書間関係（REQ-0101）

```
REQ (requirements/REQ-*.md)    -- 要件定義（満たすべき成果）
  |
  v
ADR (adr/ADR-*.md)            -- アーキテクチャ決定記録（判断根拠）
  |
  v
SPEC (specs/*.md)              -- 現行アーキテクチャ基準（現在どうなっているか）
  |
  v
DOC-MAP (DOC-MAP.md)           -- 文書探索入口（参照用・分類索引）
```

- **REQ** ファイルは要件を定義する。システムが満たすべき成果の信頼できる情報源である。
- **ADR** ファイルはアーキテクチャ決定とその判断根拠を記録する。
- **SPEC** ファイルは実装された現行アーキテクチャを記述する。「現在どう動作しているか」の基準となる。3 層構造（commands / skills / workflows）を持ち、横断 SPEC は個別 SPEC の代替ではない。
- **DOC-MAP** は非正規のナビゲーション索引である。REQ・ADR・SPEC のいずれも代替しない。
