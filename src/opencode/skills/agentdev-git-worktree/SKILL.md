---
name: agentdev-git-worktree
description: Manages git worktree creation, switching, and cleanup based on Issue numbers. USE FOR: creating worktrees, switching between branches, cleaning up completed worktrees (branch cleanup included). DO NOT USE FOR: basic git operations like commit/push/pull, branch management without worktrees, merge conflict resolution.
---

# `agentdev-git-worktree`

GitHub Issue 番号に基づいて、安全かつ一貫性のある方法で git worktree を作成、管理、削除する。

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

## 統合先基準の worktree 操作

worktree の作成元は当該 Case の統合先（通常Caseは既定 main、実証Caseは対象評価ブランチ）を参照する。
worktree の作成元、PR の base、rebase・同期基準、鮮度確認、squash merge 先、Epic 後続 Wave の作業起点は同一の統合先を参照する。
通常Case（評価を利用しない Standard / Epic Case）の worktree 作成元は従来どおり main（既定）を維持する。
統合先の解決と評価ブランチの作成・削除の手順は `references/worktree-operations.md` 参照。

- **評価ブランチの再利用手順**: 評価ブランチの作成・削除には既存の Git/worktree 能力を再利用し、評価ブランチ専用の公開 Git コマンド体系は追加しない。評価ブランチは正規成果物ではなく一時的・非正規の成果物として扱う
- **評価ブランチの命名**: 本スキルは評価ブランチの命名形式を固定しない。命名規則は実装設計で決定した形式に従う

## 統合先の鮮度確認

並列 Wave 実行時、PR merge 後再開時は、worktree 作成前に `git fetch origin` を実行し統合先の鮮度を確認する。
これは古い commit 基準の worktree による DIRTY/CONFLICTING を防止するためである。
確認対象は当該 Case の統合先（通常Caseは `origin/main`、実証Caseは対象評価ブランチの remote ref）であり、worktree 作成元と同一の統合先を参照する。

- **Wave 2 以降**: Wave 1 の PR merge 後に `git fetch origin` → 統合先の最新 commit を確認してから worktree 作成
- **case-run 再開時**: 前回ケースの PR merge 後に再開する場合も同様
- **確認手順**: `git fetch origin` 後、`git log --oneline origin/{base_branch} -1` で最新 commit hash を確認。`git rev-parse HEAD` と比較し、差分がある場合は worktree を最新の統合先から再作成（既存 worktree がある場合は削除して再作成）

## stash 運用（worktree 検証時の一時退避）

worktree 検証での一時退避に `git stash` を使わない。
detached worktree による baseline 比較を標準手順とする。
やむ得ない stash 利用時の規則（`@{}` 引数の引用符必須、`-u` 使用時の除外 pathspec）と複数 worktree 環境での stash 往復前確認は `references/worktree-operations.md`「git stash 運用手順（一時退避）」を参照。

## 参照先

| トピック | 参照先 |
|----------|--------|
| 作成、削除、ブランチ操作の詳細 | `references/worktree-operations.md` |
| 統合先の解決、評価ブランチの作成・削除 | `references/worktree-operations.md` |
| worktree 検証時の一時退避（stash 運用） | `references/worktree-operations.md` |
| bun test 実行の環境前提（worktree 構造的制約、node_modules 未伝播） | `references/worktree-operations.md` |
| git pull/push/hash検証の共通手順 | `references/git-common-procedures.md` |

## 禁止事項

- worktreeプレフィクスを含まないパスでのファイル操作禁止
- `--force` によるダーティworktreeの強制削除禁止
- メインリポジトリ内でのファイル編集禁止（case-run中）
- worktree ライフサイクルに伴うブランチクリーンアップは禁止事項の対象外
