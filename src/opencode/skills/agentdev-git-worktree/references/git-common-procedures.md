# Git 共通処理プロシージャ

複数 command で使う git 操作の共通手順、構造化エラーメッセージを定義する。
各 command は詳細本文ではなく、ここで定義する手順名、入出力、停止条件を参照する。

---

## 1. 実行前同期（git pull --ff-only）

### 前提確認

`git status --porcelain` でローカル変更の有無を確認する。
ローカル変更が検出された場合、構造化エラーで停止する。

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
## Git 同期エラー（hash 不一致、自マージ以外の新規コミット検出）

**事前hash**: {pre_hash}
**事後hash**: {post_hash}
**取り込まれたコミット**:
{git log output}
**停止理由**: pull により自マージ以外の新規コミットが取り込まれた。評価・承認をやり直すこと
**ユーザーアクション**: 当該コマンドを最初から再実行してください
```

---

## 2. ドメイン状態永続化（git add + commit + push）

`.agentdev/` 配下の変更を commit/ push する共通手順。

### 手順

1. `git diff --name-only` で `.agentdev/` 配下の変更ファイルを確認
2. **変更なし時**: commit/push せず、完了報告で「変更なし」と報告
3. **変更あり時**:
 a. **並列実行安全ステージングプロシージャ（手順 3）に従う**。
`git add <path>`/ `git rm <path>` で明示パスをステージする。
各 command が生成、変更する**専用サブディレクトリまたは明示ファイルパス**に限定し、`.agentdev/` 全体の一括スコープは禁止。
他パスを巻き込まない
 b. コミットは `git commit -- <paths>`（`--only` pathspec 形式）で行い、共有 index に存在する他セッションのステージ済み変更を当該コミットに排出しないこと。commit message: Conventional Commits 形式（各 command 固有の message を使用）
 c. `git push` を実行
 d. **push 失敗時** → 構造化エラーで停止（下記）

### エラー: push 失敗

```markdown
## Git Push エラー（ドメイン状態永続化失敗）

**失敗対象**: .agentdev/ 配下のドメイン状態永続化
**エラー種別**: push 失敗
**対象ブランチ**: {current_branch}
**変更ファイル**: {changed_files}
**ユーザーアクション**: 手動で `git push` を実行してください
**raw git output**:
{git_error_output}
```

---

## 3. 並列実行安全ステージング（concurrent-safe staging）

共有作業ツリー（main worktree）で複数セッションが並行実行される環境で、他セッションの変更を巻き込み、破壊しない git ステージ、コミット規律を定義する。
`case-run` の worktree 隔離フェーズ（専用 worktree + branch で index が独立）は構造的に安全なため本プロシージャの対象外とする。

### 前提確認

本プロシージャは「共有作業ツリー（main worktree）」で git 操作を行う全 command に適用される。
`case-run` の隔離 worktree は index が独立しているため対象外。

### 手順

1. **スイープ操作禁止**: 以下の操作は共有作業ツリーで実行してはならない。他セッションの正当な変更を無差別に巻き込み、破壊、復元誤爆するため:
 - `git add -A`/ `git add .`/ `git add --all`
 - `git commit -a`
 - `git checkout .`
 - `git reset --hard`
 - `git stash`
 - 非所有パス（他セッションが変更中のパス）に対する `git checkout -- <path>`/ `git restore <path>`

2. **明示パスステージ + `git commit -- <paths>` の義務付け（/ 005）**:
 a. ステージは `git add <path>`/ `git rm <path>` の明示パス指定のみ許可する。親ディレクトリ全体（`.agentdev/` 等）の一括スコープは禁止し、当該 command が生成、変更する**専用サブディレクトリまたは明示ファイルパス**に限定する
 b. コミットは `git commit -- <paths>`（`--only` pathspec 形式）を用いる。共有 index に存在する他セッションのステージ済み変更を当該コミットに排出しないこと

3. **ファイル変更の即時ステージ、コミット原則**: ファイルの作成、変更、削除を行う command は、当該変更を未ステージ状態で作業ツリーに残存させないこと。
削除、変更の実行と同一ステップ内で明示パスによりステージおよびコミットを完結すること（Form Zero）。

### 停止条件

- スイープ操作の実行要求を検出した場合 → 当該操作を行わず停止する
- 明示パス指定なしに親ディレクトリ全体をスコープとする `git add` を検出した場合 → 停止する
- 削除、変更が未ステージで作業ツリーに残存している場合 → 即時ステージ、コミットするか停止する

### 適用宣言

共有作業ツリーで git 操作を行う全 command（req-save, spec-save, case-open, case-close, learning-promote, backlog-review, intake-capture, intake-from-github, intake-promote, inspect-docs, inspect-skills, inspect-promote）は本プロシージャに従うこと。
各 command 側には規律の詳細本文ではなく、本プロシージャ名と停止条件のみを記述する。

---

## 4. PR merge 前 HEAD hash 記録

PR merge 手続き（`agentdev-gh-cli`）実行前に `git rev-parse HEAD` で現在の HEAD commit hash を記録する。
自マージ検出で使用する。

---

## 5. 未コミット変更検出

worktree 内で `git status --short` を実行し、未コミット変更の有無を確認する。

- **未コミット変更あり**: 検出内容を報告し、ユーザーの指示に従う。自動的な破棄、コミットは行わない
- **未コミット変更なし**: そのまま次の手順へ進む

---

## 6. ブランチ、worktree削除

→ `agentdev-git-worktree` SKILL.md の「worktree削除手順」セクションに準拠。
ローカルブランチ削除、リモートブランチ削除、squash merge 後の条件付き `-D` 許可を含む。

---

## 7. PR merge 前重複ファイルチェック

PR squash merge および `git pull --ff-only` の実行前に、ローカル未コミット変更ファイルと対象 PR 変更ファイルの重複を検出する。
並列作業環境、Windows + ジャンクション環境で、PR の squash commit が取り込むファイルとローカル未コミット変更が重複した場合、Step 9（実行前同期）の `git pull --ff-only` が失敗する問題を早期に検出、防止する。

### 前提確認

PR 番号が解決済みであること。
PR 補助データ読込手続き（`agentdev-gh-cli`）が実行可能であること。

### 手順

1. ローカル未コミット変更ファイル一覧を取得:
 ```bash
 git status --short
 ```
 出力のパス部分（ステータスコード以降）をファイル一覧とする

2. 対象 PR 変更ファイル一覧を取得:
 ```bash
 PR 補助データ読込手続き（agentdev-gh-cli）で変更ファイル一覧を取得
 ```

3. 両者の重複ファイルを特定:
 - `git status --short` のパスを正規化（前後の空白、`./` 除去）し集合 A を構築
 - PR files のパスを集合 B とする
 - 集合 A ∩ 集合 B を重複ファイルとする

4. 結果に応じた分岐:
 - **重複ファイルあり**: 以下の構造化警告を提示して merge/pull を停止し、ユーザーによる対応を促す
 - **重複ファイルなし**: 後続ステップ（merge/ pull）へ進む
 - **PR 補助データ読込手続き（agentdev-gh-cli）実行不可時**: 本チェックをスキップし、後方互換性として「1. 実行前同期」プロシージャのローカル変更検出でフォールバック検出を維持する

### 警告: 重複ファイル検出

```markdown
## 重複ファイル検出警告（PR merge / pull 前停止）

**PR番号**: {pr_number}
**重複ファイル**:
{duplicated_files}
**停止理由**: ローカル未コミット変更ファイルが対象 PR の変更ファイルと重複している。このまま merge → pull すると `git pull --ff-only` が失敗する可能性がある
**ユーザーアクション**: 以下のいずれかで対応後に再実行してください
- 変更を退避: `git stash`
- 変更をコミット: 該当ファイルを commit
- 変更を破棄: `git checkout -- <file>`
- worktree を利用して別環境で作業
```

**重要**: 重複なしの場合でも、ローカル未コミット変更が存在する場合は後続の「1. 実行前同期」プロシージャが改めて検出、停止する。
本チェックは PR 対象ファイルとの重複に特化した早期警告であり、既存のローカル変更検出を置き換えない。

---

## 8. Windows + worktree 環境の git 操作フォールバック

Windows + worktree 環境で発生する git 操作の実行形式差異に対するフォールバック手順（L-003, L-008, L-009, L-013、PR #1036/#1099/#1128 由来）。

### git mv workdir フォールバック

Windows + worktree 環境で `git -C <worktree> mv` が `fatal: renaming ... failed` で失敗する場合、workdir 指定 + 平置き `git mv` にフォールバックすること。

- **失敗パターン**: `git -C ".worktrees/{N}-{type}" mv old/path new/path` → `fatal: renaming ... failed`
- **フォールバック**: workdir パラメータに worktree パスを指定し、平置き `git mv old/path new/path` を実行する
- **理由**: Windows + worktree で `git -C <worktree> mv` の実行形式差異によりリネームが失敗する挙動差に対処する

### pull --ff-only 失敗時フォールバック（並列セッション安全化）

並列セッション運用で共有 main worktree の `git pull --ff-only` が拒否される場合のフォールバック手順。
未コミット変更を保持、停止し、並列セッション安全性を確保すること。

- **拒否パターン**: 共有 main worktree で他セッションが加えた未コミット変更により `git pull --ff-only` が拒否される
- **フォールバック**: 未コミット変更を保持したまま停止し、ユーザーによる対応（stash/commit/checkout）を待つ。スイープ操作（`git checkout .` 等）は並列実行安全ステージングプロシージャ（手順 3）で禁止されているため実行しない
- **整合性**: 追記内容は既存の並列実行安全ステージングプロシージャ（手順 3）と整合させること

---

## 9. git main 同期リスク事前検出（REQ）

`git pull --ff-only` 実行前に、worktree 状態（dirty tree）・並列実行による ref lock 競合・非 main ブランチ占有の3リスクを事前検出し、安全な代替同期手順を選択する。
暗黙の手順順序依存を明示的な事前チェックに置き換える（3件の pull 失敗事象: worktree 状態、並列実行コンテキスト、非 main ブランチ占有に基づく）。
case-close Step 9-2 から参照される。

### 前提確認

本プロシージャは case-close Step 9（実行前同期）で `git pull --ff-only` を実行する直前に適用される。
Step 9-1（重複ファイルチェック再実行）の後に実行する。

### リスク判定

3リスクを順に判定する。いずれかのリスク検出時は後述「代替同期手順選択」へ分岐する。

#### リスク1: worktree 状態（dirty tree）

```bash
git status --porcelain
```

出力が空でない場合、worktree に未コミット変更が存在する。
`git pull --ff-only` はローカル変更と競合して失敗する。

#### リスク2: 並列実行による ref lock 競合

並列実行コンテキスト（case-close Epic Wave クローズ、case-auto 複数 execution_unit 並列等）で、他セッションが同一 main worktree で git 操作を実行中の場合、`git pull --ff-only` が ref lock 競合で失敗する。

判定:

- `.git/index.lock` の存在確認（存在時は他セッションが操作中）
- 実行コンテキストが並列（Epic Wave、case-auto 複数 execution_unit）かの確認

#### リスク3: 非 main ブランチ占有

```bash
git rev-parse --abbrev-ref HEAD
```

現在のブランチが `main` 以外の場合、`git pull --ff-only` は当該ブランチの pull となり main の同期にならない。
他セッションが `main` を checkout している場合も ref の占有で失敗する。

### 代替同期手順選択

リスク判定結果に応じ、以下の手順を選択する。

| 検出リスク | 選択手順 |
|---|---|
| なし | 通常の `git pull --ff-only`（手順1 実行前同期プロシージャ） |
| リスク1（dirty tree） | 構造化エラーで停止。ユーザーによる対応（stash/commit/checkout）を待つ。スイープ操作禁止（手順3 並列実行安全ステージングプロシージャ準拠） |
| リスク2（ref lock 競合） | 直列化待機: 短い間隔（5秒）で lock 解放を待機（最大60秒）し、解放後に `git pull --ff-only` を再試行。上限超過時は構造化エラーで停止 |
| リスク3（非 main ブランチ占有） | `git fetch origin main:main` による非チェックアウト同期（後述）。現在のブランチを維持したまま main ref を更新 |
| リスク1 + リスク2/3 | リスク1 を優先し構造化エラーで停止 |

### 代替同期手順: git fetch origin main:main（非チェックアウト同期）

```bash
git fetch origin main:main
```

現在 checkout 中のブランチを切り替えずにローカル main ref を更新する。
worktree が非 main ブランチを保持している場合や、他セッションが main を占有している場合に安全な同期手段。

**制約**: ローカル main がリモートから分岐している場合（独自 commit がある場合）は non-fast-forward エラーとなる。
その場合は構造化エラーで停止しユーザー判断を仰ぐ。

### エラー: リスク1 dirty tree 検出

```markdown
## Git 同期リスク検出エラー（worktree dirty tree）

**対象ブランチ**: {current_branch}
**未コミット変更**:
{git status --porcelain output}
**停止理由**: worktree に未コミット変更が存在するため、安全に pull できない
**ユーザーアクション**: ローカル変更を確認し、`git stash` / `git commit` / `git checkout -- <file>` 等で対応後に再実行してください
```

### エラー: リスク2 ref lock 競合（直列化待機上限超過）

```markdown
## Git 同期リスク検出エラー（ref lock 競合）

**対象ブランチ**: {current_branch}
**待機時間**: {elapsed_seconds}秒（上限60秒）
**停止理由**: 他セッションが ref lock を保持したまま60秒以内に解放しなかったため、直列化待機を中止した
**ユーザーアクション**: 並列セッションの完了を確認後、再実行してください
```

### エラー: リスク3 非 main ブランチ占有・fetch 失敗

```markdown
## Git 同期リスク検出エラー（非 main ブランチ占有・fetch 失敗）

**現在ブランチ**: {current_branch}
**停止理由**: 非 main ブランチ占有を検出し `git fetch origin main:main` を試行したが、ローカル main がリモートから分岐しているため non-fast-forward エラーとなった
**ユーザーアクション**: ローカル main の分岐状況を確認し、手動で同期してください
**raw git output**:
{git_error_output}
```

### 各 command の参照方法

command 側（case-close Step 9-2 等）には以下のように参照する:

- 「`agentdev-git-worktree` の git main 同期リスク事前検出プロシージャ（REQ）に従い、3リスクの事前検出と代替同期手順選択を実行」

---

## 各 command の参照方法

command 側には共通処理の詳細本文ではなく、使用するプロシージャ名と停止条件のみを記述する:

- 「`agentdev-git-worktree` の実行前同期プロシージャに従い `git pull --ff-only` を実行」
- 「`agentdev-git-worktree` のドメイン状態永続化プロシージャに従い commit/push を実行」
- 「push 失敗時は構造化エラーで停止（ドメイン状態永続化プロシージャのエラー形式）」
- 「`agentdev-git-worktree` の並列実行安全ステージングプロシージャに従い、明示パス（`git add <path>`/ `git rm <path>`）でステージし、`git commit -- <paths>`（--only pathspec 形式）でコミットする。スイープ操作（`git add -A`/ `git add .`/ `git checkout .` 等）は禁止。`.agentdev/` 全体の一括 `git add` は禁止し当該 command の専用サブディレクトリ、明示パスに限定する。削除、変更は同一ステップで即時ステージ、コミットする（Form Zero）」

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

**重要**: 自動的なrebase継続は禁止。
必ずabortしてユーザーに判断を委ねる。

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

**重要**: `--force` ではなく `--force-with-lease` を推奨。
リモートの変更を上書きするリスクを低減するため。

3. **push失敗時の構造化エラー**（ドメイン状態永続化プロシージャに定義済み）を適用

---

## Squash merge 後分岐ハンドリング手順（REQ）

squash merge（PR merge 手続き、`agentdev-gh-cli`）実行後にローカルと remote で分岐（divergent）が発生した場合のハンドリング手順。
本手順は case-close Step 4-1 から参照される。

### 前提確認

本手順は PR squash merge 完了後に適用される。
squash merge により remote 側に1つの統合 commit が作成される一方、ローカル側には元の個別 commit が残存する場合、ローカルと remote が分岐状態となる。

### 手順

1. **ローカル先行 commit 検出**:
 ```bash
 git fetch origin
 git log origin/{branch}..HEAD --oneline
 ```
 出力が空でない場合、ローカルに remote 未 push の commit が存在する。

2. **remote 先行 commit 確認**:
 ```bash
 git log HEAD..origin/{branch} --oneline
 ```
 出力が空でない場合、remote 側に squash merge 結合 commit が存在する。

3. **内容重複確認**:
 ```bash
 git diff origin/{branch} HEAD --name-status
 ```
 ローカル先行 commit の変更ファイルと squash merge 統合 commit の変更ファイルの重複を確認する。

4. **処理分岐**:
 - **完全重複**: ローカル先行 commit の変更が squash merge に完全に含まれている場合 → `git reset --hard origin/{branch}` でローカル先行 commit を破棄し、squash merge 状態に reset する
 - **部分重複**: 一部変更が重複している場合 → ユーザーに状況を報告し、`git reset --soft origin/{branch}` での soft reset または手動解決を提案
 - **独立変更**: 重複なし、独立した変更がある場合 → ユーザーに状況を報告し、対応を委ねる

### 構造化エラー: 分岐検出時

```markdown
## Squash Merge 後分岐検出エラー

**対象ブランチ**: {current_branch}
**ローカル先行コミット**:
{git log origin/{branch}..HEAD --oneline の出力}
**remote 先行コミット**:
{git log HEAD..origin/{branch} --oneline の出力}
**重複分析**: {完全重複|部分重複|独立変更}
**ユーザーアクション**: 内容を確認し、対応を選択してください
- 完全重複: `git reset --hard origin/{branch}` で reset
- 部分重複: `git reset --soft origin/{branch}` で soft reset または手動解決
- 独立変更: 手動で状況を確認して対応
```

### 各 command の参照方法

command 側（case-close 等）には以下のように参照する:

- 「`agentdev-git-worktree` の squash merge 後分岐ハンドリング手順（REQ）に従い、ローカル先行 commit 検出、内容重複確認、reset を実行」

---

## コンフリクト解消 rebase パス（REQ/002、REQ/025）

squash merge がコンフリクトで失敗した場合（リトライ全失敗後、エラー原因がコンフリクトの場合）に実行する機械的解消パス（コンフリクト解消モデル Level 1）。
**実装変更は行わず** rebase のみ試みる。
本手順は case-close Step 4-2 から参照される。

### rebase 実行

`git fetch origin main` 後、`git rebase origin/main` を実行し機械的解消を試みる（rebase プロシージャは worktree-operations.md「Merge Conflict 対応パターン」参照）。

### 分岐

- **rebase 自動解決時**: rebase が自動解決した場合は `git push --force-with-lease` で更新し、**squash merge（PR merge 手続き、`agentdev-gh-cli`）へ戻り再マージ**する
- **rebase コンフリクト発生時**: rebase 自体がコンフリクトを発生した場合は実装変更を行わず、`git rebase --abort` で rebase を破棄し、**case-auto へエスカレーションして停止**する（コンフリクト解消モデル Level 2/3 は case-auto の責務、case-auto command SPEC のコンフリクト解消モデル Level 2/3 参照、extension 経由）。停止理由に「Level 1 rebase で解消不能、Level 2/3 へエスカレーション」を明記する

### 対象外

コンフリクト解消のための実装変更、ソース編集は case-close の責務外。
Level 2（コンフリクト文脈付き再委譲）、Level 3（マージ順序変更、blocked 単位の隔離）は case-auto が担う。

### 各 command の参照方法

command 側（case-close Step 4-2 等）には以下のように参照する:

- 「`agentdev-git-worktree` のコンフリクト解消 rebase パス（REQ）に従い、rebase による機械的解消を試み、失敗時は case-auto Level 2/3 へエスカレーション」


