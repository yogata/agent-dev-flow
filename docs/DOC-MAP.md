# DOC-MAP

> **参照用文書**: DOC-MAP は文書探索・参照経路の入口であり、要件の基準ではない（REQ-0042 / REQ-0035 / ADR-0008）。
> 基準は各 `REQ-{NNNN}.md`、`ADR-{NNNN}.md`、`specs/*.md` ファイルである。

## 基準境界

| 文書種別 | 基準 | 役割 |
|----------|------|------|
| REQ | `requirements/REQ-{NNNN}.md` | 要件定義の永続基準 |
| ADR | `adr/ADR-{NNNN}.md` | アーキテクチャ決定記録の基準 |
| SPEC | `specs/*.md` | 現在アーキテクチャの基準（REQ-0042 / REQ-0035） |
| DOC-MAP | このファイル | 文書探索入口（参照用・分類索引） |

## 新基準REQ群（現行基準）

REQ体系再基準化（REQ-0041 / ADR-0009）により整理統合された9件。仕様参照の第一参照先。

| REQ | タイトル | 概要 |
|-----|---------|------|
| [REQ-0042](requirements/REQ-0042.md) | REQ/ADR/SPEC/DOC-MAP 基準構造 | 文書種別の責務・基準境界・参照関係・操作モデル |
| [REQ-0043](requirements/REQ-0043.md) | req-define / req-save / REQ分類ゲート | 入出力契約・操作分類・反映作業混入防止 |
| [REQ-0044](requirements/REQ-0044.md) | Command / Skill / Template / Script 責任分界 | 各artifactの責務境界・配置規約・品質基準 |
| [REQ-0045](requirements/REQ-0045.md) | AgentDevFlow command protocol | 入出力契約・実行順序・Pattern体系・SSoT遷移 |
| [REQ-0046](requirements/REQ-0046.md) | intake / learning / req-backlog / RU lifecycle | パイプライン責務境界・成果物lifecycle・状態遷移 |
| [REQ-0047](requirements/REQ-0047.md) | case-run / case-close / post-run capture | 実行プロセス・信頼性・Findings回収・完了ゲート |
| [REQ-0048](requirements/REQ-0048.md) | reporting / GitHub body / link / writing quality | 完了報告・本文品質検証・リンク正規化・AI-slop抑止 |
| [REQ-0049](requirements/REQ-0049.md) | integrity / validation / tests | 横断的整合性検証・バリデーション・テスト体系 |
| [REQ-0050](requirements/REQ-0050.md) | REQ再構成intakeの分離保存と回収導線 | REQ再構成候補の分離保存・回収サイクル・検知観点 |

## Retained（現行有効な旧REQ）

後継REQなし。独立有効な要件。

| REQ | タイトル | 概要 |
|-----|---------|------|
| [REQ-0001](requirements/REQ-0001.md) | AgentDevFlow ワークフローアーキテクチャ | ワークフロー全体のアーキテクチャ定義 |
| [REQ-0003](requirements/REQ-0003.md) | Case 並列実行 | 複数Issueの並列実行基盤 |
| [REQ-0005](requirements/REQ-0005.md) | Epic Issue 管理 | Epic管理基盤 |
| [REQ-0006](requirements/REQ-0006.md) | Sisyphus プラン基盤 | プラン管理・実行基盤 |
| [REQ-0008](requirements/REQ-0008.md) | スキル品質フレームワーク | スキル品質基準 |
| [REQ-0012](requirements/REQ-0012.md) | AI-slop 執筆品質基準 | AI-slop検出基準・出力構造・品質ゲート |
| [REQ-0018](requirements/REQ-0018.md) | agentdev-req-analysis 未決分岐解消メソドロジー | 未決分岐解消手法 |
| [REQ-0020](requirements/REQ-0020.md) | Epic Issue 実行順序 SSoT と case-run Epic Orchestrator 化 | Epic Orchestration設計 |
| [REQ-0021](requirements/REQ-0021.md) | AgentDevFlow ガードレールのスクリプト化と skill-local scripts 配置方針 | ガードレールスクリプト化 |
| [REQ-0030](requirements/REQ-0030.md) | agentdev コマンド群の体系的テスト実装 | テスト体系実装 |
| [REQ-0031](requirements/REQ-0031.md) | GitHub本文内リポジトリ参照リンクの正規化 | リンク正規化 |
| [REQ-0032](requirements/REQ-0032.md) | case-close 未チェック項目達成判定 | 完了ゲート判定 |
| [REQ-0034](requirements/REQ-0034.md) | req-define 関連ドキュメント更新候補抽出と後続工程への伝播 | 要件変更伝播 |
| [REQ-0035](requirements/REQ-0035.md) | DOC-MAP導入と requirements/views 廃止による文書探索・維持管理再設計 | DOC-MAP設計 |
| [REQ-0038](requirements/REQ-0038.md) | case実行信頼性向上（チェックボックス確認・pull前チェック・docs整合性grep） | case実行信頼性 |

## Partially Superseded（一部後継REQに移行済み）

旧REQの一部だけを後継REQへ移行し、残りは限定的基準として残す。

| REQ | タイトル | 後継REQ |
|-----|---------|---------|
| [REQ-0002](requirements/REQ-0002.md) | AgentDevFlow コマンドプロトコル | REQ-0045 |
| [REQ-0004](requirements/REQ-0004.md) | 要件・ADRドキュメントシステム | REQ-0042 |
| [REQ-0007](requirements/REQ-0007.md) | ナレッジパイプライン高度化 | REQ-0046 |
| [REQ-0009](requirements/REQ-0009.md) | テンプレートシステム | REQ-0044 |
| [REQ-0010](requirements/REQ-0010.md) | AgentDevFlow Command実装改善：安全性・品質・状態管理 | REQ-0045 |
| [REQ-0011](requirements/REQ-0011.md) | Issue/PR書き込み後の内容品質自動検証 | REQ-0048 |
| [REQ-0014](requirements/REQ-0014.md) | case-run 自律修正ループと責務分離の明確化 | REQ-0047 |
| [REQ-0015](requirements/REQ-0015.md) | 関連ドキュメントの要件達成対象化 | REQ-0047 |
| [REQ-0016](requirements/REQ-0016.md) | Command/Skill/Template/Script責任分界とtips要件ソース化 | REQ-0044 |
| [REQ-0017](requirements/REQ-0017.md) | AgentDevFlow plugin namespace 統一と learning / intake / integrity の正式化 | REQ-0044 |
| [REQ-0019](requirements/REQ-0019.md) | intake / learning の責任境界明確化と workflow 組み込み | REQ-0046 |
| [REQ-0022](requirements/REQ-0022.md) | .agentdev domain state 更新後の git 永続化 | REQ-0049 |
| [REQ-0024](requirements/REQ-0024.md) | 全 agentdev コマンドの完了報告フォーマット統一 | REQ-0048 |
| [REQ-0025](requirements/REQ-0025.md) | intake 系コマンドの .agentdev/intake 更新後の git 永続化 | REQ-0049 |
| [REQ-0026](requirements/REQ-0026.md) | intake lifecycle の queue/archive 再定義 | REQ-0046 |
| [REQ-0027](requirements/REQ-0027.md) | learning artifact lifecycle の責任範囲明確化 | REQ-0046 |
| [REQ-0036](requirements/REQ-0036.md) | agentdev-no-ai-slop-writing Skill 追加 | REQ-0048 |
| [REQ-0037](requirements/REQ-0037.md) | worktree 削除時の残存ファイル対策強化 | REQ-0047 |
| [REQ-0039](requirements/REQ-0039.md) | req-backlog コマンドと Requirement Unit パイプライン | REQ-0046 |
| [REQ-0040](requirements/REQ-0040.md) | 子Issue PRに Findings / Intake候補を永続化し、case-closeで回収する | REQ-0047 |

## Superseded（全面置き換え済み）

| REQ | タイトル | 後継REQ |
|-----|---------|---------|
| [REQ-0013](requirements/REQ-0013.md) | intake 承認フロー分割と解消済み確認機能 | REQ-0046 |
| [REQ-0023](requirements/REQ-0023.md) | learning staging stub の取り込み追跡と取り込み後アーカイブ | REQ-0046 |
| [REQ-0028](requirements/REQ-0028.md) | Documentation granularity and responsibility restructuring | REQ-0042 |
| [REQ-0029](requirements/REQ-0029.md) | intake-open promoted artifact 一括処理 | REQ-0046 |
| [REQ-0033](requirements/REQ-0033.md) | AgentDevFlow command / skill 定義の二次整合性是正 | REQ-0049 |

## 管理REQ

| REQ | タイトル | 概要 |
|-----|---------|------|
| [REQ-0041](requirements/REQ-0041.md) | REQ体系再基準化 — 旧REQ分類・新基準REQ群・分類ゲート | 分類ゲート・対応表（mapping-table.md） |

## Guides（参照用読み物層）

基準文書の内容を代替しない利用者向けの読み物（REQ-0042-031〜036）。

| ガイド | 内容 |
|--------|------|
| [ワークフロー概要](guides/workflow-overview.md) | コマンドパイプライン・フェーズ体系・Pattern分類の全体像 |
| [成果物モデル](guides/artifact-model.md) | 文書種別・コマンド・スキル・成果物ライフサイクル |
| [ドメイン状態ライフサイクル](guides/domain-state-lifecycle.md) | Learning・Intake・RU・Case・Integrity の状態遷移 |
