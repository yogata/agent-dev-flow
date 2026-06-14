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

- lifecycle 判定
- workflow phase 判定（マクロ/マイクロ）
- work_type classification（bugfix/feature/maintenance/docs_chore）
- scale 判定（standard/large）
- upstream handoff 判定・停止条件（`references/upstream-handoff.md`）
- SSoT 遷移に関する共通判断
- ラベル体系

## DO NOT USE FOR

- Issue本文生成
- Issue作成
- Epic/child Issue生成
- RU削除後処理
- intake pipeline（期間解釈・データ取得・構造検出・LLM解析・item生成）
- docs-review診断（REQ参照ID整合性・第一参照導線・active/retired境界・6観点診断・未処理artifact確認）
- backlog-review統合手順（Artifact読込分析・統合分割判定・矛盾検出・RU生成）
- command固有Step番号・command固有実行順序・command固有Phase名
- 特定コマンドの実行ロジック・手順記述
- 要件分析手法や壁打ちメソドロジー（`agentdev-req-analysis`参照）
- 仕様適合性検出・ループバック判定（`agentdev-spec-compliance`参照）
- ADR/REQファイルの具体的作成・更新操作（`agentdev-adr-file-manager`/`agentdev-req-file-manager`参照）
- レビューNG時の対応フロー（`agentdev-workflow-routing`参照）
- 完了報告フォーマット・チェックボックス更新

## 対象コマンド

全 agentdev コマンドの一覧・入出力リファレンスは command README（`commands/agentdev/README.md`）を参照。本 skill は全 agentdev コマンドからフェーズ定義・work_type 判定基準の参照元として使用される。

## See Also

- **agentdev-issue-management**: Issue作成・更新・リンク・確認の安全手順（操作用Skill）
- **agentdev-intake-pipeline**: intake抽出・promote review/分類/整形/振り分け基準
- **agentdev-backlog-integration**: backlog-review統合・分割判定・矛盾検出・RU生成
- **agentdev-req-structure-diagnostics**: docs-review / REQ構造診断基準
- **agentdev-workflow-routing**: レビューNG時の対応フロー・次コマンド推論
- **agentdev-workflow-orchestration**: case-run状態機械・Wave scheduling
