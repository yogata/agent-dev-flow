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

## worktree 内判定ヘルパー

現在 worktree 内にいるか（メインリポジトリで作業していないか）を判定する検証ヘルパー手順。case-run の precondition gate（Step 4-2）および実行担当サブエージェントの自己検証から参照される。2つの検証を組合せて判定する。

### 1. 検証コマンド

**検証A**: `git worktree list` で当該 worktree が登録されていることの確認

```bash
git worktree list
```

出力に当該 Issue の worktree（`.worktrees/{N}-{type}`）が含まれることを確認する。

**検証B**: `git rev-parse --show-toplevel` で現在の作業ディレクトリのルートがメインリポジトリルートと**一致しない**ことの確認

```bash
# worktree 内で実行
git rev-parse --show-toplevel
```

この結果がメインリポジトリルート（`.worktrees/` を含まないパス）と**一致しない**ことを確認する。一致する場合はメインリポジトリにいる（worktree 内ではない）。

### 2. 判定基準

| 検証A（worktree list 登録） | 検証B（toplevel ≠ メインルート） | 判定 |
|---|---|---|
| 当該 worktree あり | 一致しない（worktree 内） | ✅ worktree 内にいる（隔離されている） |
| 当該 worktree あり | 一致する（メインルート） | ❌ メインリポジトリにいる（隔離されていない） |
| 当該 worktree なし | — | ❌ worktree 未作成 |

### 3. 適用箇所

- **case-run Step 4-2（precondition gate）**: 実行担当サブエージェント起動前に本ヘルパーで検証し、worktree 内にいない場合は起動を停止して Step 4 へ戻る
- **実行担当サブエージェントの自己検証**: 実装作業開始前に本ヘルパーで worktree 内にいることを自己検証する（詳細は `agentdev-case-run-execution-adapter` 参照）

## 削除手順

**追跡済みファイル削除禁止**: クリーンアップ操作中は追跡済みファイルを削除してはならない。削除対象は未追跡ファイルのみ（ランタイムワークスペース配下の一時ファイル、ビルド成果物等）。

### 1. 未追跡ファイルのクリーンアップ

worktree 内の未追跡ファイル（ランタイムワークスペース配下の一時ファイル、ビルド成果物等）が `git worktree remove` エラーの原因になるため削除:

**Windows**: `git -C ".worktrees/{N}-{type}" clean -fd`
**POSIX**: `git -C ".worktrees/{N}-{type}" clean -fd`

**重要**: 追跡済みファイル（ドメイン状態を含む可能性あり）は削除禁止。未追跡ファイルのみを削除対象とする。未追跡ファイルが存在しない場合はエラーにせず続行。

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

#### Windows + ジャンクション環境の削除フォールバック

**エラーパターン**: Windows + ジャンクション環境で `git worktree remove` が `Not a directory` を含むエラーで失敗する場合。

**原因**: ジャンクションの reparse point により、git 内部の削除処理がディレクトリを正しく辿れないことがある。

**適用条件**: `git worktree remove` が上記エラーで失敗した場合のみ。通常の削除成功時は実行しない。

**手順**:
1. worktree 管理情報を更新: `git worktree prune`
2. ジャンクションディレクトリを手動削除: `Remove-Item -LiteralPath "{worktree_path}" -Recurse -Force` または `rmdir /s /q "{worktree_path}"`
3. ローカルブランチを削除: `git branch -d {branch_name}`（必要時のみ `-D`）
4. リモートブランチがある場合のみ削除: `git push origin --delete {branch_name}`

**注意**: `install-consumer-opencode.ps1` が作成するジャンクション link 経由の worktree で発生する Windows 固有の挙動。背景: worktree ジャンクション削除フォールバック要件（関連Issue/PRは履歴参照）。

### 4. ローカルブランチの削除

```bash
git branch -d "{type}/issue-{N}"
```

**squash merge 後の条件付き `-D` 許可**:
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
