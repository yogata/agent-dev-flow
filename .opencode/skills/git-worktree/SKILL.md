---
name: git-worktree
description: Manages git worktree creation, switching, and cleanup based on Issue numbers. USE FOR: creating worktrees, switching between branches, or cleaning up completed worktrees. DO NOT USE FOR: basic git operations like commit/push/pull, branch management without worktrees, or merge conflict resolution.
---

# git-worktree

## 動作指針

GitHub Issue 番号に基づいて、安全かつ一貫性のある方法で git worktree を作成・管理・削除する。

## 命名規則

worktree とブランチの命名規則を統一する。

| 項目             | 命名パターン            | 例                          |
| ---------------- | ----------------------- | --------------------------- |
| worktreeディレクトリ | `.worktrees/{N}-{type}` | `.worktrees/516-fix`        |
| ブランチ名         | `{type}/issue-{N}`      | `fix/issue-516`             |

### `{type}` の定義

| 値         | 使用条件                   |
| ---------- | -------------------------- |
| `feature`  | 機能追加・enhancement      |
| `fix`      | バグ修正・bug              |
| `refactor` | リファクタリング・Pattern C |
| `chore`    | ドキュメント・雑務・Pattern D |
- Pattern分岐の判定基準と固有ルールは `issue-lifecycle` → Pattern Registry を参照

### `{N}` の定義

- GitHub Issue 番号（数値）

## worktree作成手順

### 1. ベースブランチの特定

`main` または `master` ブランチを自動検出し、ベースとして使用する。

### 2. worktree作成コマンド

`origin/main` を明示的に指定してブランチを作成する。ローカルの `main` は他のworktree作業等で古くなっている可能性があるため、常にリモートの最新状態を起点とする。

```bash
git worktree add ".worktrees/{N}-{type}" -b "{type}/issue-{N}" origin/main
```

### 3. 重要事項

- **worktreeプレフィクス必須**: ファイルパスには `.worktrees/{N}-{type}/` を含めること。絶対パス・相対パスどちらも許容されるが、worktreeディレクトリを経由する必要がある
  - 正しいパス例:
    - 絶対パス: `C:/path/to/repo/.worktrees/516-fix/src/components/App.tsx`
    - 相対パス: `.worktrees/516-fix/src/components/App.tsx`
  - 誤ったパス例（worktreeプレフィクスなし）:
    - `src/components/App.tsx` （メインリポジトリのファイルを誤編集するリスクあり）
    - `./src/components/App.tsx` （同上）
- Windows環境: パスにスペースが含まれる可能性があるためダブルクォート必須
- 作成後の確認: `git worktree list` で正しく追加されたことを検証する

### 4. 作成例

```bash
# issue-516 を fix パターンで処理（origin/main を明示的に指定）
git worktree add ".worktrees/516-fix" -b "fix/issue-516" origin/main

# 確認
git worktree list
```

## 既存worktree衝突時の対応

### 1. 同名worktreeが既に存在する場合

```bash
# 既存worktreeを確認
git worktree list

# 既存worktreeを再利用（作成コマンドは実行しない）
```

### 2. ブランチのみ既存でworktreeがない場合

```bash
# 既存ブランチをworktreeとしてcheckout
git worktree add ".worktrees/{N}-{type}" "{type}/issue-{N}"
```

### 3. ダーティなworktreeの扱い

- ダーティなworktreeの削除は禁止
- 未コミット変更がある場合はエラー停止し、ユーザーに判断を委ねる

## worktree削除手順

### 1. worktreeの削除

```bash
git worktree remove ".worktrees/{N}-{type}"
```

### 2. クリーンアップ

```bash
# 手動削除されたディレクトリの残存参照を消去
git worktree prune
```

### 3. ローカルブランチの削除

```bash
# マージ済みの場合のみ削除
git branch -d "{type}/issue-{N}"
```

**注意**: 未マージブランチの強制削除（`-D`）は禁止。未マージの場合はエラー停止し、ユーザーに判断を委ねる。

### 4. リモートブランチの削除

```bash
git push origin --delete "{type}/issue-{N}"
```

- リモートにブランチが存在しない場合（既に削除済み等）はエラーを無視して続行
- **削除成否の確認必須**: リモートにブランチが存在した場合、削除が成功したことを確認すること。失敗した場合は警告表示して停止

## 禁止事項

- worktreeプレフィクスを含まないパスでのファイル操作禁止（`.worktrees/{N}-{type}/` がパスに含まれていること）
- `--force` によるダーティworktreeの強制削除禁止
- メインリポジトリ（非worktree）内でのファイル編集禁止（issue-work中）

## 重要: git worktreeコマンドの実行方法

- worktree 内で作業する場合、`workdir` パラメータに worktree のパスを指定して Bash ツールを実行する（絶対パス・相対パスどちらも可、ただし `.worktrees/{N}-{type}/` を含めること）
- 絶対に `cd` によるディレクトリ移動は行わない

```bash
# 正しい例（絶対パス）
bash(command="git status", workdir="C:/path/to/repo/.worktrees/516-fix")

# 正しい例（相対パス）
bash(command="git status", workdir=".worktrees/516-fix")

# 禁止例
bash(command="cd .worktrees/516-fix && git status")
```

### Edit/Write ツールでのファイルパス指定

Edit・Write ツールでworktree内のファイルを操作する場合も、パスに `.worktrees/{N}-{type}/` を含めること。

```text
# Edit ツールの例（絶対パス）
edit(filePath="C:/path/to/repo/.worktrees/516-fix/src/components/App.tsx", oldString="...", newString="...")

# Edit ツールの例（相対パス・プロジェクトルートから）
edit(filePath=".worktrees/516-fix/src/components/App.tsx", oldString="...", newString="...")

# Write ツールの例（絶対パス）
write(filePath="C:/path/to/repo/.worktrees/516-fix/src/components/App.tsx", content="...")

# 禁止例（worktreeプレフィクスなし）
edit(filePath="src/components/App.tsx", oldString="...", newString="...")  # メインリポジトリのファイルを誤編集
```
