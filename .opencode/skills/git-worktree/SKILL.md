---
name: git-worktree
description: Manages git worktree creation, switching, and cleanup based on Issue numbers. Use when creating worktrees, switching between branches, or cleaning up completed worktrees.
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

| 値        | 使用条件                   |
| --------- | -------------------------- |
| `feature` | 機能追加・enhancement      |
| `fix`     | バグ修正・bug              |
- Pattern分岐の判定基準と固有ルールは `issue-guide-phases` → Pattern Registry を参照

### `{N}` の定義

- GitHub Issue 番号（数値）

## worktree作成手順

### 1. ベースブランチの特定

`main` または `master` ブランチを自動検出し、ベースとして使用する。

### 2. worktree作成コマンド

```bash
git worktree add ".worktrees/{N}-{type}" -b "{type}/issue-{N}"
```

### 3. 重要事項

- **絶対パス指定の義務付け**: `workdir` パラメータには絶対パスを使用すること（相対パスはメインリポジトリの誤編集リスクあり）
- Windows環境: パスにスペースが含まれる可能性があるためダブルクォート必須
- 作成後の確認: `git worktree list` で正しく追加されたことを検証する

### 4. 作成例

```bash
# issue-516 を fix パターンで処理
git worktree add ".worktrees/516-fix" -b "fix/issue-516"

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

### 3. ブランチの削除

```bash
# マージ済みの場合のみ削除
git branch -d "{type}/issue-{N}"
```

**注意**: 未マージブランチの強制削除（`-D`）は禁止。未マージの場合はエラー停止し、ユーザーに判断を委ねる。

## 禁止事項

- 相対パスでのworktreeファイル操作禁止（絶対パス必須）
- `--force` によるダーティworktreeの強制削除禁止
- メインリポジトリ（非worktree）内でのファイル編集禁止（issue-work中）

## 重要: git worktreeコマンドの実行方法

- worktree 内で作業する場合、`workdir` パラメータに worktree の絶対パスを指定して Bash ツールを実行する
- 絶対に `cd` によるディレクトリ移動は行わない

```bash
# 正しい例
bash(command="git status", workdir="C:/path/to/repo/.worktrees/516-fix")

# 禁止例
bash(command="cd .worktrees/516-fix && git status")
```
