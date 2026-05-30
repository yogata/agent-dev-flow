# Documentation Hub

## Requirements

要件定義書の一覧とインデックス。

### 新基準REQ群（現行基準）

REQ体系再基準化（REQ-0041 / ADR-0009）により整理統合された8件。現在の仕様参照は以下を第一参照先とすること。

- [REQ-0042: REQ/ADR/SPEC/DOC-MAP 基準構造](requirements/REQ-0042.md)
- [REQ-0043: req-define / req-save / REQ分類ゲート](requirements/REQ-0043.md)
- [REQ-0044: Command / Skill / Template / Script 責任分界](requirements/REQ-0044.md)
- [REQ-0045: AgentDevFlow command protocol](requirements/REQ-0045.md)
- [REQ-0046: intake / learning / req-backlog / RU lifecycle](requirements/REQ-0046.md)
- [REQ-0047: case-run / case-close / post-run capture](requirements/REQ-0047.md)
- [REQ-0048: reporting / GitHub body / link / writing quality](requirements/REQ-0048.md)
- [REQ-0049: integrity / validation / tests](requirements/REQ-0049.md)

### Retained（現行有効な旧REQ）

- [REQ-0001: AgentDevFlow ワークフローアーキテクチャ](requirements/REQ-0001.md)
- [REQ-0003: Case 並列実行](requirements/REQ-0003.md)
- [REQ-0005: Epic Issue 管理](requirements/REQ-0005.md)
- [REQ-0006: Sisyphus プラン基盤](requirements/REQ-0006.md)
- [REQ-0008: スキル品質フレームワーク](requirements/REQ-0008.md)
- [REQ-0012: AI-slop 執筆品質基準](requirements/REQ-0012.md)
- [REQ-0018: agentdev-req-analysis 未決分岐解消メソドロジー](requirements/REQ-0018.md)
- [REQ-0020: Epic Issue 実行順序 SSoT と case-run Epic Orchestrator 化](requirements/REQ-0020.md)
- [REQ-0021: AgentDevFlow ガードレールのスクリプト化と skill-local scripts 配置方針](requirements/REQ-0021.md)
- [REQ-0030: agentdev コマンド群の体系的テスト実装](requirements/REQ-0030.md)
- [REQ-0031: GitHub本文内リポジトリ参照リンクの正規化](requirements/REQ-0031.md)
- [REQ-0032: case-close 未チェック項目達成判定](requirements/REQ-0032.md)
- [REQ-0034: req-define 関連ドキュメント更新候補抽出と後続工程への伝播](requirements/REQ-0034.md)
- [REQ-0035: DOC-MAP導入と requirements/views 廃止による文書探索・維持管理再設計](requirements/REQ-0035.md)
- [REQ-0038: case実行信頼性向上（チェックボックス確認・pull前チェック・docs整合性grep）](requirements/REQ-0038.md)

### Partially Superseded（一部後継REQに移行済み）

- [REQ-0002: AgentDevFlow コマンドプロトコル](requirements/REQ-0002.md) → REQ-0045
- [REQ-0004: 要件・ADRドキュメントシステム](requirements/REQ-0004.md) → REQ-0042
- [REQ-0007: ナレッジパイプライン高度化](requirements/REQ-0007.md) → REQ-0046
- [REQ-0009: テンプレートシステム](requirements/REQ-0009.md) → REQ-0044
- [REQ-0010: AgentDevFlow Command実装改善：安全性・品質・状態管理](requirements/REQ-0010.md) → REQ-0045
- [REQ-0011: Issue/PR書き込み後の内容品質自動検証](requirements/REQ-0011.md) → REQ-0048
- [REQ-0014: case-run 自律修正ループと責務分離の明確化](requirements/REQ-0014.md) → REQ-0047
- [REQ-0015: 関連ドキュメントの要件達成対象化](requirements/REQ-0015.md) → REQ-0047
- [REQ-0016: Command/Skill/Template/Script責任分界とtips要件ソース化](requirements/REQ-0016.md) → REQ-0044
- [REQ-0017: AgentDevFlow plugin namespace 統一と learning / intake / integrity の正式化](requirements/REQ-0017.md) → REQ-0044
- [REQ-0019: intake / learning の責任境界明確化と workflow 組み込み](requirements/REQ-0019.md) → REQ-0046
- [REQ-0022: .agentdev domain state 更新後の git 永続化](requirements/REQ-0022.md) → REQ-0049
- [REQ-0024: 全 agentdev コマンドの完了報告フォーマット統一](requirements/REQ-0024.md) → REQ-0048
- [REQ-0025: intake 系コマンドの .agentdev/intake 更新後の git 永続化](requirements/REQ-0025.md) → REQ-0049
- [REQ-0026: intake lifecycle の queue/archive 再定義](requirements/REQ-0026.md) → REQ-0046
- [REQ-0027: learning artifact lifecycle の責任範囲明確化](requirements/REQ-0027.md) → REQ-0046
- [REQ-0036: agentdev-no-ai-slop-writing Skill 追加](requirements/REQ-0036.md) → REQ-0048
- [REQ-0037: worktree 削除時の残存ファイル対策強化](requirements/REQ-0037.md) → REQ-0047
- [REQ-0039: req-backlog コマンドと Requirement Unit パイプライン](requirements/REQ-0039.md) → REQ-0046
- [REQ-0040: 子Issue PRに Findings / Intake候補を永続化し、case-closeで回収する](requirements/REQ-0040.md) → REQ-0047

### Superseded（全面置き換え済み）

- ~~[REQ-0013: intake 承認フロー分割と解消済み確認機能](requirements/REQ-0013.md)~~ → REQ-0046
- ~~[REQ-0023: learning staging stub の取り込み追跡と取り込み後アーカイブ](requirements/REQ-0023.md)~~ → REQ-0046
- ~~[REQ-0028: Documentation granularity and responsibility restructuring](requirements/REQ-0028.md)~~ → REQ-0042
- ~~[REQ-0029: intake-open promoted artifact 一括処理](requirements/REQ-0029.md)~~ → REQ-0046
- ~~[REQ-0033: AgentDevFlow command / skill 定義の二次整合性是正](requirements/REQ-0033.md)~~ → REQ-0049

### 管理REQ

- [REQ-0041: REQ体系再基準化 — 旧REQ分類・新基準REQ群・分類ゲート](requirements/REQ-0041.md)
- [対応表（mapping-table.md）](requirements/mapping-table.md)

### インデックス

- [Requirements Index（README.md）](requirements/README.md)

## Specifications

システム仕様と実装パターン。

- [System Specification](specs/system.md) — コマンドシステムの構成
- [Implementation Patterns](specs/patterns.md) — コード規約と実装パターン
- [Design Principles](specs/design-principles.md) — 設計原則

## ADR

アーキテクチャ決定記録。

- [ADR Index](adr/README.md) — 設計判断の記録一覧
  - [ADR-0001: Command/Skill/Template/Script責任分界の正式定義](adr/ADR-0001.md)
  - [ADR-0002: Orchestration skill作成基準の導入](adr/ADR-0002.md)
  - [ADR-0003: req-define入力の抽象化](adr/ADR-0003.md)
  - [ADR-0004: 要件管理構造のarea-based移行方針](adr/ADR-0004.md)
  - [ADR-0005: AgentDevFlow plugin namespace 統一](adr/ADR-0005.md)
  - [ADR-0006: Epic Issue 本文を実行順序 SSoT とする設計](adr/ADR-0006.md)
  - [ADR-0007: REQ/ADR基準構造と分類ビュー運用の再定義](adr/ADR-0007.md)
  - [ADR-0008: DOC-MAP導入と requirements/views 廃止](adr/ADR-0008.md)
  - [ADR-0009: REQ体系再基準化 — 旧REQ分類モデル・対応表・分類ゲート導入](adr/ADR-0009.md)

## Learning

学び・ナレッジの蓄積と昇華。

- [Domain State Lifecycle](guides/domain-state-lifecycle.md) — Learning・Intake・Integrity の状態遷移

## Intake

気づき・課題の収集・レビュー・促進。

- [Domain State Lifecycle](guides/domain-state-lifecycle.md) — Intake パイプラインの状態遷移

## Integrity

ドキュメント・スキル・コマンドの横断的整合性検証。

- [Domain State Lifecycle](guides/domain-state-lifecycle.md) — Integrity パイプラインの状態遷移

## Guides

利用者向けの参照用読み物（基準文書の内容を代替しない）。

- [ワークフロー概要](guides/workflow-overview.md) — コマンドパイプライン・フェーズ体系・Pattern分類
- [成果物モデル](guides/artifact-model.md) — 文書種別・コマンド・スキル・成果物ライフサイクル
- [ドメイン状態ライフサイクル](guides/domain-state-lifecycle.md) — 状態遷移の全体像

## Quality Specs

品質仕様。

- [Quality Specifications](specs/quality-specs.md) — 品質基準・検証ルール
