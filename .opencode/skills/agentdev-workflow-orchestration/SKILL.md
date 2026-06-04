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
| 有効Issue 2〜5件 | 多重Issueモード。入力上限 = 5件/case-run呼出 |

### フェーズ構成

| フェーズ | Steps | 再開条件 |
|----------|-------|----------|
| 準備フェーズ | 1-5 | worktree+ブランチが存在しない |
| 実装フェーズ | 6-7 | work planが未完了 または チェックボックス未完了 |
| 提出フェーズ | 8-12 | PRが未作成 |

## 参照先

詳細は以下の reference files を参照:

| トピック | 参照先 |
|----------|--------|
| Self-Healing・CI Loop・エラー | `references/self-healing-and-errors.md` — 自律修正ループ・CI対応・エラー回復マップ |

## See Also

- **case-run コマンド**: `.opencode/commands/agentdev/case-run.md`
- **agentdev-workflow-lifecycle**: work_type 判定基準・フェーズ定義
- **agentdev-spec-compliance**: 乖離検出
- **ADR-0002**: Orchestration skill作成基準
- **ADR-0006**: Epic Issue 本文を実行順序 SSoT とする設計
- **agentdev-epic-tracker**: Epic ステータス追跡プロトコル
