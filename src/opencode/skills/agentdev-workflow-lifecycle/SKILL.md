---
name: agentdev-workflow-lifecycle
description: Provides development workflow phase definitions, SSoT transitions, work_type classification (bugfix/feature/maintenance/docs_chore), scale assessment, command mappings, and docs structure for the agentdev command pipeline. USE FOR: determining workflow phases, work_type classification and scale assessment, resolving command dependencies, or understanding docs/ directory layout. DO NOT USE FOR: specific command execution logic, requirement analysis, or compliance checking.
---

# AgentDevFlow Lifecycle スキル

agentdev系コマンドのフェーズ定義・SSoT遷移・work_type 判定基準・コマンド関連を提供する。

- **知識ベース**: フェーズ定義、SSoT遷移、work_type 判定基準、コマンド関連
- **参照先**: agentdevコマンドから参照される
- **特性**: 宣言的定義のみを提供。手順・手続きは含まない
- **自明な質問の禁止**: エージェントが自律的に判断できることをユーザーに確認しない

---

## USE FOR

- ワークフローフェーズ（マクロ/マイクロ）の判定
- work_type 分類（bugfix/feature/maintenance/docs_chore）と規模判定（feature のみ）
- SSoT遷移ルールとdraftライフサイクルの確認
- 各コマンドの入出力SSoT・データフローの理解
- 並列実行パターンの依存関係レベル判定
- docs/ディレクトリ構造とアーティファクト責務境界の把握
- AgentDevFlow upstream handoff の判定・停止条件の確認（`references/upstream-handoff.md`）

## DO NOT USE FOR

- 特定コマンドの実行ロジック・手順記述
- 要件分析手法や壁打ちメソドロジー（`agentdev-req-analysis`参照）
- 仕様適合性検出・ループバック判定（`agentdev-spec-compliance`参照）
- ADR/REQファイルの具体的作成・更新操作（`agentdev-adr-file-manager`/`agentdev-req-file-manager`参照）
- レビューNG時の対応フロー（`agentdev-workflow-routing`参照）
- 完了報告フォーマット・チェックボックス更新

## 対象コマンド

| コマンド | 用途 |
|----------|------|
| req-define | 要件壁打ち・分析 |
| req-save | 要件をREQ/ADRファイルとして保存 |
| case-open | REQファイルからGitHub Issue作成 |
| case-run | 計画立案から実装・コミット・PR作成まで一括実行 |
| case-update | Issue本文更新・コメント追加・REQファイル更新 |
| case-close | PRマージ・記録追記・Issueクローズ・ブランチ削除 |
| intake-capture | 未分類の変更候補を手動入力から intake item として保存 |
| intake-from-github | クローズ済みissue/PRから残課題抽出・分類・draft保存 |
| intake-promote | inbox 内の intake item をレビュー・採用・却下・保留判定し、promoted artifact に整形 |
| backlog-review | promoted artifact（intake/learning）の分析・HITL・review draft保存 |
| backlog-save | review draft から RU（Requirement Unit）を生成・git永続化 |
| learning-promote | inbox.md と archive/active.md をセマンティック分析・evaluation-report 出力・昇華判定し Requirement Source stub 生成 |
| integrity-check | AgentDevFlow artifact 整合性検査 |
| req-restructure-review | REQ体系の健全性を診断し、再構成の推奨アクションを提示 |

## See Also

- **agentdev-workflow-routing**: レビューNG時の対応フロー
- **agentdev-adr-file-manager**: ADRファイル管理
- **agentdev-adr-guidelines**: ADR閾値判定
- **agentdev-req-file-manager**: REQファイル管理
- **agentdev-req-analysis**: 要件分析手法
- **agentdev-spec-compliance**: 仕様適合性検出
