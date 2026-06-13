---
name: agentdev-git-worktree
description: Manages git worktree creation, switching, and cleanup based on Issue numbers. USE FOR: creating worktrees, switching between branches, or cleaning up completed worktrees. DO NOT USE FOR: basic git operations like commit/push/pull, branch management without worktrees, or merge conflict resolution. Exception: branch cleanup as part of worktree lifecycle (removing worktree → deleting associated branch) is expected behavior.
---

# agentdev-git-worktree

GitHub Issue 番号に基づいて、安全かつ一貫性のある方法で git worktree を作成・管理・削除する。

## 命名規則

| 項目 | 命名パターン | 例 |
|------|-------------|-----|
| worktreeディレクトリ | `.worktrees/{N}-{type}` | `.worktrees/516-fix` |
| ブランチ名 | `{type}/issue-{N}` | `fix/issue-516` |

### `{type}` の定義

| 値 | 使用条件 |
|----|----------|
| `feature` | 機能追加・enhancement |
| `fix` | バグ修正・bug |
| `refactor` | リファクタリング・保守作業 |
| `chore` | ドキュメント・雑務 |

work_type判定は `agentdev-workflow-lifecycle` を参照。

## 参照先

| トピック | 参照先 |
|----------|--------|
| 作成・削除・ブランチ操作の詳細 | `references/worktree-operations.md` |
| git pull/push/hash検証の共通手順 | `references/git-common-procedures.md` |

## 禁止事項

- worktreeプレフィクスを含まないパスでのファイル操作禁止
- `--force` によるダーティworktreeの強制削除禁止
- メインリポジトリ内でのファイル編集禁止（case-run中）
- worktree ライフサイクルに伴うブランチクリーンアップは禁止事項の対象外
