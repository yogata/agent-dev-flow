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

**追跡済みファイル削除禁止**: クリーンアップ操作中は追跡済みファイルを削除してはならない。削除対象は未追跡ファイルのみ（`.sisyphus/tmp/`、ビルド成果物等）。

### 1. .sisyphus/ クリーンアップ

worktree 内の `.sisyphus/` 未追跡ファイルが `git worktree remove` エラーの原因になるため削除:

**Windows**: `if (Test-Path ".worktrees/{N}-{type}/.sisyphus/") { git -C ".worktrees/{N}-{type}" clean -fd .sisyphus/ }`
**POSIX**: `git -C ".worktrees/{N}-{type}" clean -fd .sisyphus/`

**重要**: `.sisyphus/` 内の追跡済みファイル（ドメイン状態を含む可能性あり）は削除禁止。未追跡ファイルのみを削除対象とする。`.sisyphus/` が存在しない場合はエラーにせず続行。

### 2. worktreeの削除

```bash
git worktree remove ".worktrees/{N}-{type}"
```

**Permission denied 時のリトライ**: ファイルハンドル解放待ちのため短い待機を挟んでリトライ。最大3回。リトライ条件は "Permission denied" を含む場合のみ。上限到達時は警告表示して停止。

**リトライ前の復元**: リトライ時、worktree 内に変更された追跡済みファイルがある場合は `git checkout .` を実行して追跡済みファイルをクリーンな状態に復元してから再試行する。

### 3. クリーンアップ

```bash
git worktree prune
```

成功時: `git worktree remove` 正常終了後の管理情報のクリーンアップ。

失敗時: `git worktree remove` がすべてのリトライ後に失敗した場合のフォールバッククリーンアップ。`prune` は無効な worktree 管理情報のみを削除し、worktree ディレクトリ自体は削除しない。

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

## Merge Conflict 対応パターン

### worktree内でmerge conflictが発生した場合の対応手順

#### 1. conflict検出時の即座停止ルール

worktree内で以下のいずれかの操作でconflictが検出された場合、即座に処理を停止しユーザーに報告する:
- `git pull --ff-only` 実行時
- `git merge` 実行時
- `git rebase` 実行時

停止時は以下の情報を報告:
- 発生した操作（例: `git pull --ff-only`）
- conflictが発生したファイル一覧
- worktreeパス

```markdown
## Merge Conflict 検出エラー

**操作**: {operation}
**worktree**: {worktree_path}
**停止理由**: merge conflictが発生したため、安全に操作を継続できません
**対象ファイル**: {conflicted_files}
**ユーザーアクション**: 手動でconflictを解決してください
```

#### 2. conflict markersの確認手順

conflict markers（`<<<<<<<`, `=======`, `>>>>>>>`）が含まれるファイルを確認:

```bash
git diff --name-only --diff-filter=U
```

または

```bash
git status --short | grep '^UU'
```

#### 3. 手動解決またはabort手順

**オプションA: 手動解決**
1. conflictファイルを手動で編集し、conflict markersを削除
2. 解決したファイルをstage: `git add {resolved_file}`
3. commit: `git commit -m "Resolve merge conflicts"`
4. 解決確認: `git status` でclean状態を確認

**オプションB: 操作の中止（abort）**
- mergeの場合: `git merge --abort`
- rebaseの場合: `git rebase --abort`

abort後、worktreeを元の状態に復元し、ユーザーに対応を依頼する。

#### 4. 解決後のcommit手順

conflictを手動解決した場合:
1. 変更をstage: `git add -u`
2. commit: `git commit -m "Resolve merge conflicts"`
3. 必要に応じてpush: `git push`

rebase中にconflictを解決した場合:
1. 変更をstage: `git add -u`
2. rebase継続: `git rebase --continue`
3. rebase完了後push: `git push --force-with-lease`（必要に応じて）

**重要**: force pushは慎重に実行すること。リモートの変更を上書きするリスクがあるため、事前に確認が必要。
