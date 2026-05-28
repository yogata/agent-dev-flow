# DOC-MAP

> **参照用文書**: DOC-MAP は文書探索・参照経路の入口であり、要件の基準ではない（REQ-0035 / ADR-0008）。
> 基準は各 `REQ-{NNNN}.md`、`ADR-{NNNN}.md`、`specs/*.md` ファイルである。

## 基準境界

| 文書種別 | 基準 | 役割 |
|----------|------|------|
| REQ | `requirements/REQ-{NNNN}.md` | 要件定義の永続基準 |
| ADR | `adr/ADR-{NNNN}.md` | アーキテクチャ決定記録の基準 |
| SPEC | `specs/*.md` | 現在アーキテクチャの基準（REQ-0035-006） |
| DOC-MAP | このファイル | 文書探索入口（参照用・分類索引） |

## ドキュメント管理・構造

| REQ | タイトル | 概要 |
|-----|---------|------|
| [REQ-0004](requirements/REQ-0004.md) | 要件・ADRドキュメントシステム | REQ/ADR管理規則 |
| [REQ-0009](requirements/REQ-0009.md) | テンプレートシステム | テンプレート管理 |
| [REQ-0016](requirements/REQ-0016.md) | Command/Skill/Template/Script責任分界とtips要件ソース化 | 責務分界定義 |
| [REQ-0028](requirements/REQ-0028.md) | Documentation granularity and responsibility restructuring | ドキュメント粒度・責務再構築 |

## ワークフロー・実行基盤

| REQ | タイトル | 概要 |
|-----|---------|------|
| [REQ-0001](requirements/REQ-0001.md) | AgentDevFlow ワークフローアーキテクチャ | ワークフロー全体のアーキテクチャ定義 |
| [REQ-0003](requirements/REQ-0003.md) | Case 並列実行 | 複数Issueの並列実行基盤 |
| [REQ-0006](requirements/REQ-0006.md) | Sisyphus プラン基盤 | プラン管理・実行基盤 |
| [REQ-0014](requirements/REQ-0014.md) | case-run 自律修正ループと責務分離の明確化 | Self-healing loop とCI/CD検証 |
| [REQ-0015](requirements/REQ-0015.md) | 関連ドキュメントの要件達成対象化 | ドキュメント更新の要件管理 |
| [REQ-0020](requirements/REQ-0020.md) | Epic Issue 実行順序 SSoT と case-run Epic Orchestrator 化 | Epic Orchestration設計 |
| [REQ-0034](requirements/REQ-0034.md) | req-define 関連ドキュメント更新候補抽出と後続工程への伝播 | 要件変更に伴う関連ドキュメント更新候補の検出・伝播 |

## コマンドプロトコル・品質

| REQ | タイトル | 概要 |
|-----|---------|------|
| [REQ-0002](requirements/REQ-0002.md) | AgentDevFlow コマンドプロトコル | コマンド定義・操作モデル |
| [REQ-0010](requirements/REQ-0010.md) | AgentDevFlow Command実装改善：安全性・品質・状態管理 | コマンド安全性・品質基盤 |
| [REQ-0013](requirements/REQ-0013.md) | intake 承認フロー分割と解消済み確認機能 | intake承認フロー改善 |
| [REQ-0024](requirements/REQ-0024.md) | 全 agentdev コマンドの完了報告フォーマット統一 | 完了報告フォーマット標準化 |
| [REQ-0029](requirements/REQ-0029.md) | intake-open promoted artifact 一括処理 | intake一括処理機能 |

## 品質・整合性

| REQ | タイトル | 概要 |
|-----|---------|------|
| [REQ-0008](requirements/REQ-0008.md) | スキル品質フレームワーク | スキル品質基準 |
| [REQ-0011](requirements/REQ-0011.md) | Issue/PR書き込み後の内容品質自動検証 | 書き込み検証自動化 |
| [REQ-0021](requirements/REQ-0021.md) | AgentDevFlow ガードレールのスクリプト化と skill-local scripts 配置方針 | ガードレールスクリプト化 |
| [REQ-0030](requirements/REQ-0030.md) | agentdev コマンド群の体系的テスト実装 | テスト体系実装 |
| [REQ-0031](requirements/REQ-0031.md) | GitHub本文内リポジトリ参照リンクの正規化 | リンク正規化 |
| [REQ-0036](requirements/REQ-0036.md) | agentdev-no-ai-slop-writing Skill 追加 | 自然言語成果物の文章品質ゲート |

## ナレッジパイプライン

| REQ | タイトル | 概要 |
|-----|---------|------|
| [REQ-0007](requirements/REQ-0007.md) | ナレッジパイプライン高度化 | 学びの3層パイプライン |
| [REQ-0023](requirements/REQ-0023.md) | learning staging stub の消費追跡と消費後アーカイブ | staging stub管理 |
| [REQ-0027](requirements/REQ-0027.md) | learning artifact lifecycle の責任範囲明確化 | artifact lifecycle定義 |

## Intake系

| REQ | タイトル | 概要 |
|-----|---------|------|
| [REQ-0019](requirements/REQ-0019.md) | intake / learning の責任境界明確化と workflow 組み込み | intake/learning境界定義 |
| [REQ-0025](requirements/REQ-0025.md) | intake 系コマンドの .agentdev/intake 更新後の git 永続化 | intake git永続化 |
| [REQ-0026](requirements/REQ-0026.md) | intake lifecycle の queue/archive 再定義 | intake lifecycle再設計 |

## 設定・名前空間・基盤

| REQ | タイトル | 概要 |
|-----|---------|------|
| [REQ-0005](requirements/REQ-0005.md) | Epic Issue 管理 | Epic管理基盤 |
| [REQ-0012](requirements/REQ-0012.md) | 自然言語ポリシー | 日本語表記規約 |
| [REQ-0017](requirements/REQ-0017.md) | AgentDevFlow plugin namespace 統一と learning / intake / integrity の正式化 | namespace統一 |
| [REQ-0018](requirements/REQ-0018.md) | agentdev-req-analysis 未決分岐解消メソドロジー | 未決分岐解消手法 |
| [REQ-0022](requirements/REQ-0022.md) | .agentdev domain state 更新後の git 永続化 | domain state永続化 |
