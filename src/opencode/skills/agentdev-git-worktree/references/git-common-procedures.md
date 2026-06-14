# Git 共通処理プロシージャ

複数 command で使う git 操作の共通手順・構造化エラーメッセージを定義する。各 command は詳細本文ではなく、ここで定義する手順名・入出力・停止条件を参照する。

---

## 1. 実行前同期（git pull --ff-only）

### 前提確認

`git status --porcelain` でローカル変更の有無を確認する。ローカル変更が検出された場合、構造化エラーで停止する。

### 手順

1. `git status --porcelain` でローカル変更確認（前述）
2. pull 前 HEAD hash 記録: `git rev-parse HEAD`
3. `git pull --ff-only` を実行
4. pull 後 HEAD hash 取得: `git rev-parse HEAD`
5. hash 一致確認（一致 = リモートに新規コミットなし）

### エラー: ローカル変更検出

```markdown
## ローカル変更検出エラー（pull 前同期不可）

**対象ファイル**:
{git status --porcelain output}
**停止理由**: pull 前にローカル変更が存在するため、安全に pull できない
**ユーザーアクション**: ローカル変更を確認し、`git stash` / `git checkout -- <file>` 等で対応後に再実行してください
```

### エラー: pull 失敗

```markdown
## Git 同期エラー

**エラー種別**: pull --ff-only 失敗
**停止理由**: リモートに未取り込みの変更があり、fast-forward マージできない
**対象ブランチ**: {current_branch}
**ユーザーアクション**: 手動で `git pull --rebase` または `git stash && git pull --ff-only && git stash pop` を実行してください
**raw git output**:
{git_error_output}
```

### エラー: hash 不一致（自マージ以外の新規コミット検出）

pull 後 hash が pull 前 hash と不一致の場合:

1. `git log --oneline {pre_hash}..{post_hash}` で取り込まれたコミットを確認
2. 取り込まれたコミットが全て自マージコミットのみ → 継続
3. 自マージ以外のコミットが含まれる → 以下の構造化エラーで停止:

```markdown
## Git 同期エラー（hash 不一致 — 自マージ以外の新規コミット検出）

**事前hash**: {pre_hash}
**事後hash**: {post_hash}
**取り込まれたコミット**:
{git log output}
**停止理由**: pull により自マージ以外の新規コミットが取り込まれた。評価・承認をやり直すこと
**ユーザーアクション**: 当該コマンドを最初から再実行してください
```

---

## 2. Domain state 永続化（git add + commit + push）

`.agentdev/` 配下の変更を commit / push する共通手順。

### 手順

1. `git diff --name-only` で `.agentdev/` 配下の変更ファイルを確認
2. **変更なし時**: commit/push せず、完了報告で「変更なし」と報告
3. **変更あり時**:
   a. `git add` は `.agentdev/` 配下のみを対象とする。他のパスを巻き込まない
   b. commit message: Conventional Commits 形式（各 command 固有の message を使用）
   c. `git push` を実行
   d. **push 失敗時** → 構造化エラーで停止（下記）

### エラー: push 失敗

```markdown
## Git Push エラー（domain state 永続化失敗）

**失敗対象**: .agentdev/ 配下の domain state 永続化
**エラー種別**: push 失敗
**対象ブランチ**: {current_branch}
**変更ファイル**: {changed_files}
**ユーザーアクション**: 手動で `git push` を実行してください
**raw git output**:
{git_error_output}
```

---

## 3. PR merge 前 HEAD hash 記録

`gh pr merge` 実行前に `git rev-parse HEAD` で現在の HEAD commit hash を記録する。自マージ検出で使用する。

---

## 4. 未コミット変更検出

worktree 内で `git status --short` を実行し、未コミット変更の有無を確認する。

- **未コミット変更あり**: 検出内容を報告し、ユーザーの指示に従う。自動的な破棄・コミットは行わない
- **未コミット変更なし**: そのまま次の手順へ進む

---

## 5. ブランチ・worktree削除

→ `agentdev-git-worktree` SKILL.md の「worktree削除手順」セクションに準拠。ローカルブランチ削除・リモートブランチ削除・squash merge 後の条件付き `-D` 許可を含む。

---

## 各 command の参照方法

command 側には共通処理の詳細本文ではなく、使用するプロシージャ名と停止条件のみを記述する:

- 「`agentdev-git-worktree` の実行前同期プロシージャに従い `git pull --ff-only` を実行」
- 「`agentdev-git-worktree` の domain state 永続化プロシージャに従い commit/push を実行」
- 「push 失敗時は構造化エラーで停止（domain state 永続化プロシージャのエラー形式）」

## Merge Conflict 対応パターン

### git pull/push時のmerge conflict対応

#### 1. pull --rebase失敗時のrebase --abort手順

`git pull --rebase` 実行時にconflictが発生した場合:

1. **即座にrebaseを中止**:
   ```bash
   git rebase --abort
   ```

2. **ローカル変更を確認**:
   ```bash
   git status --short
   ```

3. **状況報告**:
   ```markdown
   ## Pull Rebase Conflict エラー

   **対象ブランチ**: {current_branch}
   **停止理由**: rebase中にmerge conflictが発生したため、rebaseを中止しました
   **ユーザーアクション**: 以下のいずれかを選択してください
   - 手動でrebaseを実行しconflictを解決: `git pull --rebase` → 手動解決 → `git rebase --continue`
   - ローカル変更をstashしてpull: `git stash && git pull --ff-only && git stash pop`
   ```

**重要**: 自動的なrebase継続は禁止。必ずabortしてユーザーに判断を委ねる。

#### 2. pull --ff-only失敗時の対処

`git pull --ff-only` 実行時にfast-forwardマージできない場合:

1. **詳細状況の確認**:
   ```bash
   git fetch origin
   git log HEAD..origin/{branch} --oneline
   ```

2. **ローカル変更の有無を確認**:
   ```bash
   git status --porcelain
   ```

3. **状況に応じた対応**:

   - **ローカル変更なし、リモートに新規コミットあり**:
     ```markdown
     ## Pull FF-Only 失敗エラー（リモート先行）

     **対象ブランチ**: {current_branch}
     **リモートの新規コミット**: {new_commits}
     **ユーザーアクション**: 手動で `git pull --rebase` を実行してください
     ```

   - **ローカル変更あり、リモートと分岐**:
     ```markdown
     ## Pull FF-Only 失敗エラー（分岐検出）

     **対象ブランチ**: {current_branch}
     **ローカル変更**: {local_changes}
     **ユーザーアクション**: 以下のいずれかを選択してください
     - ローカル変更をコミットしてからpull
     - ローカル変更をstash: `git stash && git pull --ff-only && git stash pop`
     ```

#### 3. push拒否（remote hash不一致）時の対処

`git push` 実行時にremoteのhashが不一致の場合（非fast-forward）:

1. **詳細状況の確認**:
   ```bash
   git fetch origin
   git log HEAD..origin/{branch} --oneline
   git log origin/{branch}..HEAD --oneline
   ```

2. **状況報告**:
   ```markdown
   ## Push 拒否エラー（Remote Hash 不一致）

   **対象ブランチ**: {current_branch}
   **リモート先行コミット**: {remote_ahead_commits}
   **ローカル先行コミット**: {local_ahead_commits}
   **停止理由**: リモートとローカルで分岐しているため、安全にpushできません
   **ユーザーアクション**: 以下のいずれかを選択してください
   - リモートの変更を取り込んでからpush: `git pull --rebase` → `git push`
   - ローカルの変更をforce push（慎重に）: `git push --force-with-lease`
   ```

**重要**: `--force` ではなく `--force-with-lease` を推奨。リモートの変更を上書きするリスクを低減するため。

3. **push失敗時の構造化エラー**（domain state 永続化プロシージャに定義済み）を適用
