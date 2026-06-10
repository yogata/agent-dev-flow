---
name: agentdev-workflow-orchestration
description: case-run の状態機械・Wave scheduling・サブエージェント protocol・self-healing loop・CI 対応 loop・Epic Orchestrator モードの知識ベース。USE FOR: case-run の多重Issue依存関係分析、Wave構成、再開ポイント判定、自律修正ループ判定、集約完了報告、Epic検出・Wave解析・subagent起動・障害伝播。DO NOT USE FOR: 単一Issue の基本的な Step 実行手順（case-run コマンド定義を参照）、work_type 判定（agentdev-workflow-lifecycle を参照）、乖離検出（agentdev-spec-compliance を参照）
---

# case-run Orchestration Knowledge Base

case-run コマンドのオーケストレーション知識ベース。状態機械・依存関係分析・Wave scheduling・サブエージェント protocol・self-healing loop・CI loop・エラー回復・集約完了報告の判定基準と詳細構造を提供する。

## 状態機械

case-run は3つの実行モードを持つ:

| 条件 | モード |
|------|--------|
| 有効Issue = 1件、Epic 非検出 | 単一Issueパス（Steps 1-12 を順次実行） |
| 有効Issue = 1件、Epic 検出（`epic` ラベル OR `## 実行順序` + Wave テーブル） | Epic Orchestrator モード |
| 有効Issue 2〜5件 | 多重Issueモード。入力上限 = 5件（case-run 呼出あたり） |

### フェーズ構成

| フェーズ | Steps | 再開条件 |
|----------|-------|----------|
| 準備フェーズ | 1-4 | worktree+ブランチが存在しない |
| 実装フェーズ | 5-6 | work planが未完了 または チェックボックス未完了 |
| 提出フェーズ | 7-11 | PRが未作成 |

## Wave Scheduling

Epic Orchestrator モードでの Wave 構成・依存関係・並列実行の管理。

### ファイル変更範囲の非重複チェック

Wave 構成時に、各 Wave 内の Issue のファイル変更範囲が重複しないことを確認する。

1. **重複検出**: 各 Issue の work plan から対象ファイル一覧を抽出し、同一 Wave 内で重複がないか検証
2. **重複時の対応**: 重複ファイルが検出された場合、該当 Issue を別 Wave に移動する
3. **Wave 間の重複**: 異なる Wave 間のファイル重複は依存関係による順次実行で解決可能だが、同一 Wave 内の並列実行時は重複を許容しない
4. **確認タイミング**: Wave 構成の確定時（Epic Issue の「実行順序」セクションの作成時）

## 参照先

詳細は以下の reference files を参照:

| トピック | 参照先 |
|----------|--------|
| Capture 境界定義 | `references/capture-boundaries.md` — intake/learning 境界・Split Rule・コマンド責務境界 |
| Self-Healing・CI Loop・エラー | `references/self-healing-and-errors.md` — 自律修正ループ・CI対応・エラー回復マップ |
| サブエージェント Edit 安全手順 | `references/subagent-protocol.md` — oldString最小化・Read検証・大規模ファイル分割・AST-grep推奨 |

## See Also

- **case-run コマンド（runtime projection）**: `.opencode/commands/agentdev/case-run.md` — consumer repository に投影される実行時パス。command 本文内での参照はこちらを使用
- **agentdev-workflow-lifecycle**: work_type 判定基準・フェーズ定義
- **agentdev-spec-compliance**: 乖離検出
- **Orchestration skill作成基準**: Orchestration skill の抽出判断基準
- **Epic Issue SSoT 設計**: Epic Issue 本文を実行順序 SSoT とする設計
- **agentdev-epic-tracker**: Epic ステータス追跡プロトコル
