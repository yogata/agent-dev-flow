# Documentation Hub

## Requirements

要件定義書の一覧とインデックス。

- [Requirements Index](requirements/README.md)
  - [REQ-0001: AgentDevFlow ワークフローアーキテクチャ](requirements/REQ-0001.md)
  - [REQ-0002: AgentDevFlow コマンドプロトコル](requirements/REQ-0002.md)
  - [REQ-0003: Case 並列実行](requirements/REQ-0003.md)
  - [REQ-0004: 要件・ADRドキュメントシステム](requirements/REQ-0004.md)
  - [REQ-0005: Epic Issue 管理](requirements/REQ-0005.md)
  - [REQ-0006: Sisyphus プラン基盤](requirements/REQ-0006.md)
  - [REQ-0007: ナレッジパイプライン高度化](requirements/REQ-0007.md)
  - [REQ-0008: スキル品質フレームワーク](requirements/REQ-0008.md)
  - [REQ-0009: テンプレートシステム](requirements/REQ-0009.md)
  - [REQ-0010: AgentDevFlow Command実装改善：安全性・品質・状態管理](requirements/REQ-0010.md)
  - [REQ-0011: Issue/PR書き込み後の内容品質自動検証](requirements/REQ-0011.md)
  - [REQ-0012: 自然言語ポリシー](requirements/REQ-0012.md)
  - [REQ-0013: intake 承認フロー分割と解消済み確認機能](requirements/REQ-0013.md)
  - [REQ-0014: case-run 自律修正ループと責務分離の明確化](requirements/REQ-0014.md)
  - [REQ-0015: 関連ドキュメントの要件達成対象化](requirements/REQ-0015.md)
  - [REQ-0016: Command/Skill/Template/Script責任分界とtips要件ソース化](requirements/REQ-0016.md)
  - [REQ-0017: AgentDevFlow plugin namespace 統一と learning / intake / integrity の正式化](requirements/REQ-0017.md)
  - [REQ-0018: agentdev-req-analysis 未決分岐解消メソドロジー](requirements/REQ-0018.md)
  - [REQ-0019: intake / learning の責任境界明確化と workflow 組み込み](requirements/REQ-0019.md)
  - [REQ-0020: Epic Issue 実行順序 SSoT と case-run Epic Orchestrator 化](requirements/REQ-0020.md)
  - [REQ-0021: AgentDevFlow ガードレールのスクリプト化と skill-local scripts 配置方針](requirements/REQ-0021.md)
  - [REQ-0022: .agentdev domain state 更新後の git 永続化](requirements/REQ-0022.md)
  - [REQ-0023: learning staging stub の消費追跡と消費後アーカイブ](requirements/REQ-0023.md)
  - [REQ-0024: 全 agentdev コマンドの完了報告フォーマット統一](requirements/REQ-0024.md)
  - [REQ-0025: intake 系コマンドの .agentdev/intake 更新後の git 永続化](requirements/REQ-0025.md)
  - [REQ-0026: intake lifecycle の queue/archive 再定義](requirements/REQ-0026.md)
  - [REQ-0027: learning artifact lifecycle の責任範囲明確化](requirements/REQ-0027.md)
  - [REQ-0028: Documentation granularity and responsibility restructuring](requirements/REQ-0028.md)
  - [REQ-0029: intake-open promoted artifact 一括処理](requirements/REQ-0029.md)
  - [REQ-0030: agentdev コマンド群の体系的テスト実装](requirements/REQ-0030.md)
  - [REQ-0031: GitHub本文内リポジトリ参照リンクの正規化](requirements/REQ-0031.md)
  - [REQ-0032: case-close 未チェック項目達成判定](requirements/REQ-0032.md)
  - [REQ-0033: AgentDevFlow command / skill 定義の二次整合性是正](requirements/REQ-0033.md)
  - [REQ-0034: req-define 関連ドキュメント更新候補抽出と後続工程への伝播](requirements/REQ-0034.md)

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
   - [ADR-0007: REQ/ADR正本構造と分類ビュー運用の再定義](adr/ADR-0007.md)

## Learning

学び・ナレッジの蓄積と昇華。

- [Domain State Lifecycle](guides/domain-state-lifecycle.md) — Learning・Intake・Integrity の状態遷移

## Intake

気づき・課題の収集・レビュー・促進。

- [Domain State Lifecycle](guides/domain-state-lifecycle.md) — Intake パイプラインの状態遷移

## Integrity

ドキュメント・スキル・コマンドの横断的整合性検証。

- [Domain State Lifecycle](guides/domain-state-lifecycle.md) — Integrity パイプラインの状態遷移

## Quality Specs

品質仕様。

- [Quality Specifications](specs/quality-specs.md) — 品質基準・検証ルール
