# Worktree 作成・削除・ブランチ操作の詳細手順

## 作成手順

### 1. ベースブランチの自動検出

```bash
git remote show origin | grep 'HEAD branch' | sed 's/.*: //'
```

検出結果を `origin/{base_branch}` として使用。デフォルトは `main`。ローカルのベースブランチは古くなっている可能性があるため、常にリモートの最新状態を起点とする。

### 2. worktree作成コマンド

```bash
git worktree add ".worktrees/{N}-{type}" -b "{type}/issue-{N}" origin/{base_branch}
```

### 3. 重要事項

- **worktreeプレフィクス必須**: ファイルパスには `.worktrees/{N}-{type}/` を含めること
  - 正: `C:/path/to/repo/.worktrees/516-fix/src/components/App.tsx`
  - 正: `.worktrees/516-fix/src/components/App.tsx`
  - 誤: `src/components/App.tsx`（メインリポジトリのファイルを誤編集リスク）
- Windows環境: パスにスペースが含まれる可能性があるためダブルクォート必須
- 作成後: `git worktree list` で正しく追加されたことを検証

### 4. 既存worktree衝突時の対応

| 状況 | 対応 |
|------|------|
| 同名worktree既存 | 既存worktreeを再利用（作成コマンド実行しない） |
| ブランチのみ既存 | `git worktree add ".worktrees/{N}-{type}" "{type}/issue-{N}"` |
| ダーティなworktree | 削除禁止。未コミット変更時はエラー停止 |

## 削除手順

### 1. .sisyphus/ クリーンアップ

worktree 内の `.sisyphus/` 未追跡ファイルが `git worktree remove` エラーの原因になるため削除:

**Windows**: `if (Test-Path ".worktrees/{N}-{type}/.sisyphus/") { Remove-Item -Recurse -Force ".worktrees/{N}-{type}/.sisyphus/" }`
**POSIX**: `rm -rf ".worktrees/{N}-{type}/.sisyphus/"`

`.sisyphus/` が存在しない場合はエラーにせず続行。

### 2. worktreeの削除

```bash
git worktree remove ".worktrees/{N}-{type}"
```

**Permission denied 時のリトライ**: ファイルハンドル解放待ちのため短い待機を挟んでリトライ。最大2回。リトライ条件は "Permission denied" を含む場合のみ。上限到達時は警告表示して停止。

### 3. クリーンアップ

```bash
git worktree prune
```

### 4. ローカルブランチの削除

```bash
git branch -d "{type}/issue-{N}"
```

**squash merge 後の条件付き `-D` 許可**（REQ-0106）:
1. PR が `state: MERGED` と確認できること
2. 呼び出し元が squash merge 済みを明示的に判定していること
3. 条件を満たさない場合は `-D` 実行せず警告表示して停止

### 5. リモートブランチの削除

```bash
git push origin --delete "{type}/issue-{N}"
```

- リモートにブランチが存在しない場合はエラーを無視して続行
- 削除失敗時は警告表示して停止

## ツール実行規約

- worktree 内で作業する場合、`workdir` パラメータに worktree パスを指定する
- `cd` によるディレクトリ移動は行わない
- Edit/Write ツールでもパスに `.worktrees/{N}-{type}/` を含める
