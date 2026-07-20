---
name: agentdev-git-worktree
description: Manages git worktree creation, switching, and cleanup based on Issue numbers. USE FOR: creating worktrees, switching between branches, or cleaning up completed worktrees. DO NOT USE FOR: basic git operations like commit/push/pull, branch management without worktrees, or merge conflict resolution. Exception: branch cleanup as part of worktree lifecycle (removing worktree → deleting associated branch) is expected behavior.
---

# `agentdev-git-worktree`

GitHub Issue 番号に基づいて、安全かつ一貫性のある方法で git worktree を作成、管理、削除する。

## 原本（SSoT）

本スキルの原本仕様は [`agentdev-git-worktree` SPEC](../../../../docs/specs/skills/agentdev-git-worktree.md) である。
本 SKILL.md は実行入口であり、SPEC を SSoT として DERIVE する。機能節の記述は SPEC と整合し、SKILL.md 固有の運用ビュー、参照資料、トリガーを補完する。SPEC と重複する場合、SPEC を正とする。
extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## 命名規則

| 項目 | 命名パターン | 例 |
|------|-------------|-----|
| worktreeディレクトリ | `.worktrees/{N}-{type}` | `.worktrees/516-fix` |
| ブランチ名 | `{type}/issue-{N}` | `fix/issue-516` |

### `{type}` の定義

| 値 | 使用条件 |
|----|----------|
| `feature` | 機能追加、enhancement |
| `fix` | バグ修正、bug |
| `refactor` | リファクタリング、保守作業 |
| `chore` | ドキュメント、雑務 |

work_type判定は `agentdev-workflow-lifecycle` を参照。

## origin/main 鮮度確認

並列 Wave 実行時、PR merge 後再開時は、worktree 作成前に `git fetch origin` を実行し origin/main の鮮度を確認する。
古い commit 基準の worktree による DIRTY/CONFLICTING を防止するため。

- **Wave 2 以降**: Wave 1 の PR merge 後に `git fetch origin` → `origin/main` の最新 commit を確認してから worktree 作成
- **case-run 再開時**: 前回ケースの PR merge 後に再開する場合も同様
- **確認手順**: `git fetch origin` 後、`git log --oneline origin/main -1` で最新 commit hash を確認。`git rev-parse HEAD` と比較し、差分がある場合は worktree を最新 origin/main から再作成（既存 worktree がある場合は削除して再作成）

## 参照先

| トピック | 参照先 |
|----------|--------|
| 作成、削除、ブランチ操作の詳細 | `references/worktree-operations.md` |
| git pull/push/hash検証の共通手順 | `references/git-common-procedures.md` |

## 禁止事項

- worktreeプレフィクスを含まないパスでのファイル操作禁止
- `--force` によるダーティworktreeの強制削除禁止
- メインリポジトリ内でのファイル編集禁止（case-run中）
- worktree ライフサイクルに伴うブランチクリーンアップは禁止事項の対象外

