# Worktree 作成、削除、ブランチ操作の詳細手順

## 作成手順

### 1. 統合先の解決（worktree 作成元）

worktree の作成元は当該 Case の統合先（以下 `origin/{base_branch}`）である。
通常Caseの統合先は既定 `main`、実証Caseは対象評価ブランチを指定する。
呼出元（case-run 等）から統合先を明示指定された場合は当該ブランチを使用する。
worktree の作成元、PR の base、rebase・同期基準、鮮度確認、squash merge 先、Epic 後続 Wave の作業起点は同一の統合先を参照する。

明示指定がない場合（通常Case）はリポジトリのデフォルトブランチを検出して使用する（従来どおり）:

```bash
git remote show origin | grep 'HEAD branch' | sed 's/.*: //'
```

検出結果を `origin/{base_branch}` として使用。
デフォルトは `main`。
ローカルのベースブランチは古くなっている可能性があるため、常にリモートの最新状態を起点とする。
実証Caseの指定する評価ブランチが remote に存在しない場合は、先に「評価ブランチの作成・削除」の作成手順を実行する。

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

## 評価ブランチの作成・削除（既存 Git 能力の再利用）

実証Caseの評価ブランチは、専用の公開 Git コマンド体系を追加せず、既存の Git 能力で作成・削除する。
評価ブランチは正規成果物ではなく一時的・非正規の成果物として扱う。
命名形式は本スキルで固定せず、実装設計で決定した形式に従う。
作成・削除の要否の判断（実証の開始・終了タイミング、再開可能性の考慮を含む）は呼出元が所有し、本手順は操作のみを提供する。

### 1. 作成

```bash
git branch "{evaluation_branch}" origin/main
git push origin "{evaluation_branch}"
```

- 作成元は main とする。評価ブランチ同士を依存・派生関係として扱わない
- 作成後、作成手順の統合先として当該評価ブランチを指定する

### 2. 削除

```bash
git push origin --delete "{evaluation_branch}"
git branch -D "{evaluation_branch}"
```

- 評価ブランチは main へ merge しない前提で削除するため、マージ判定のある `-d` ではなく `-D` を使用する
- リモートにブランチが存在しない場合はエラーを無視して続行（worktree 削除手順のリモートブランチ削除と同一の扱い）
- 削除失敗時は警告表示して停止

## worktree 内判定ヘルパー

現在 worktree 内にいるか（メインリポジトリで作業していないか）を判定する検証ヘルパー手順。
case-run の precondition gate（STEP-S3 前置 gate 群）および実行担当サブエージェントの自己検証から参照される。
2つの検証を組合せて判定する。

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

この結果がメインリポジトリルート（`.worktrees/` を含まないパス）と**一致しない**ことを確認する。
一致する場合はメインリポジトリにいる（worktree 内ではない）。

### 2. 判定基準

| 検証A（worktree list 登録） | 検証B（toplevel ≠ メインルート） | 判定 |
|---|---|---|
| 当該 worktree あり | 一致しない（worktree 内） | ✅ worktree 内にいる（隔離されている） |
| 当該 worktree あり | 一致する（メインルート） | ❌ メインリポジトリにいる（隔離されていない） |
| 当該 worktree なし | - | ❌ worktree 未作成 |

### 3. 適用箇所

- **case-run STEP-S3（precondition gate）**: 実行担当サブエージェント起動前に本ヘルパーで検証し、worktree 内にいない場合は起動を停止して当該 STEP へ戻る
- **実行担当サブエージェントの自己検証**: 実装作業開始前に本ヘルパーで worktree 内にいることを自己検証する（詳細は `agentdev-case-run-execution-adapter` 参照）

## worktree 標準運用ガイド

worktree 環境の運用落とし穴に対する標準運用ガイド（L-003, L-008, L-009, L-013、PR #1036/#1099/#1128 由来）。

### src/opencode/ 直接参照（SoT パス）

worktree 内では `.opencode/skills/` の junction が再作成されないため、junction 切断時に `.opencode/` 経由参照が失敗する。
整合性検査、スキル参照は `src/opencode/` を SoT パスとして直接参照すること。

### isInsideWorktree 適用

`isInsideWorktree` で worktree 実行を判定し、junction 依存検査（`checkSourceProjectionConsistency` 等）に適用すること。
worktree 内で junction が再作成されない場合の偽陽性を防止するためである。

### isInsideWorktree 適用範囲の拡張候補

`checkSourceProjectionConsistency` 以外の junction 依存検査に対する `isInsideWorktree` 適用を評価対象として明記すること。
junction 依存の整合性検査全般に worktree 実行判定を拡張する候補を個別に評価し、偽陽性の発生する検査から順次適用する。

## worktree 構造的制約（agentdev-git-worktree-test-fallback Design）

worktree は独立した working tree を持つため、本体リポジトリ直下を前提とする検査が worktree 内では成立しない事象がある。
次の構造的制約を前提として運用する。

### gitignore 対象ファイル受け渡し不可

worktree は独立した working tree であるため、メインリポジトリで `.gitignore` 対象となっているファイル（`.opencode/skills/agentdev-*/` ジャンクション配下、`.agentdev-plugin/` 等）は worktree 側へ受け渡しできない。
worktree 内で当該ファイルを参照する検査は失敗する。

worktree 内で gitignore 対象ファイルを参照・編集する必要がある場合は、`git add -f` で強制追加して worktree の working tree に存在させるか、source パス（`src/opencode/`）へ fallback して参照する。

### junction 依存 checker の skip 挙動

`.opencode/skills/agentdev-*` ジャンクションは worktree へ伝播しない。
このため junction の存在を前提とする checker（`checkSourceProjectionConsistency` 等）は worktree 内で偽陽性を発生させる。

junction 依存 checker は worktree 実行時（`isInsideWorktree` 判定で worktree 内と判定された場合）に skip する。
skip せずに検査が必要な場合は構造系テスト fallback（commands_e2e / skills_structure / templates_structure の source パス切替）を適用する。

## git stash 運用手順（一時退避）

worktree での検証における一時退避の標準手順と、やむ得ない stash 利用時の規則を定める。
stash スタックはリポジトリ全体で共有され、複数 worktree 並列環境では他セッションの退避内容と混在する。
本手順はその混在に起因する障害の再発防止として定めた（関連Issue/PRは履歴参照）。

### 1. detached worktree による baseline 比較（標準手順）

worktree 検証で一時退避が必要な場合、`git stash` を使わない。
検証対象 worktree の working tree を変更せず、baseline commit 上の detached worktree で検証を実行して結果を比較する。

**手順**:

1. baseline commit を確定する: 検証対象 worktree の `HEAD`（PR 差分の検証では `origin/main`）
2. baseline 用の detached worktree を作成する: `git worktree add --detach ".worktrees/baseline-verify" {baseline_commit}`
3. detached worktree 内で検証（checker、test 等）を実行する
4. 検証対象 worktree と detached worktree の検証結果を比較し、失敗が本次変更起因か既存起因かを判定する
5. detached worktree を削除する: `git worktree remove ".worktrees/baseline-verify"`

baseline 用 worktree は Issue 用の命名規則（`.worktrees/{N}-{type}`）の対象外の一時領域である。
検証完了時に必ず削除し、削除時のエラーハンドリングは「削除手順」に従う。
並列セッションで同時実行する場合はパスが衝突しないよう一意な接尾辞を付ける。

**理由**: `git stash` は working tree と stash スタックを変更する。
detached worktree は検証対象の working tree を変更せず、stash スタックも消費しないため、並列セッションへ影響しない。

### 2. やむ得ない stash 利用時の規則

detached worktree による代替が成立しない場合に限り、`git stash` の利用を認める。
利用時は以下の2規則を守る。

**規則1: `@{}` 引数の引用符必須**

`stash@{N}` 形式の引数は、シェルの解釈により意図しない引数へ変わる（bash のブレース展開で `stash@{0}` が `stash@0` となる、PowerShell で `@{...}` がハッシュリテラルとして解析される等）。
`stash@{N}` を含む引数は必ず引用符で囲む。

```bash
# 正
git stash pop 'stash@{0}'
git stash show --name-only 'stash@{1}'

# 誤（シェルが @{} を解釈する）
git stash pop stash@{0}
```

**規則2: `-u` 使用時の除外 pathspec**

`git stash push -u` は未追跡ファイルを退避対象に巻き込む。
ドメイン状態（`.agentdev/` 配下）や実行時作業領域を退避対象から除外するため、除外 pathspec を指定する。

```bash
git stash push -u -- . ':(exclude).agentdev/**'
```

除外対象は実行環境に応じて追加する（ビルド成果物等）。

共有作業ツリー（main worktree）では、`git stash` を含むスイープ操作は並列実行安全ステージングプロシージャ（`references/git-common-procedures.md` 手順 3）の禁止対象である。

### 3. 複数 worktree 環境での stash 往復前確認

stash スタックはリポジトリ全体で共有される。
自セッションの stash 以外に、他 worktree、他セッションの stash が同一スタックに混在し得る。

stash の退避（push）と復元（pop、apply）を往復する前に、以下を確認する。

1. `git stash list` で既存エントリを確認する
2. 復元対象エントリが自セッションのものであることを確認する: `git stash show --name-only 'stash@{0}'`
3. 自セッション以外のエントリが混在する場合、スタック先頭を暗黙に復元する `pop` を使わず、引用符付きの index で自セッションのエントリを明示して `git stash apply 'stash@{N}'` で復元する

他セッションの stash エントリの削除（`git stash drop`）、スタック全体のクリア（`git stash clear`）は行わない。

## 削除手順

**追跡済みファイル削除禁止**: クリーンアップ操作中は追跡済みファイルを削除してはならない。
削除対象は未追跡ファイルのみ（実行時作業領域配下の一時ファイル、ビルド成果物等）。

### 1. 未追跡ファイルのクリーンアップ

worktree 内の未追跡ファイル（実行時作業領域配下の一時ファイル、ビルド成果物等）が `git worktree remove` エラーの原因になるため削除:

**Windows**: `git -C ".worktrees/{N}-{type}" clean -fd`
**POSIX**: `git -C ".worktrees/{N}-{type}" clean -fd`

**重要**: 追跡済みファイル（ドメイン状態を含む可能性あり）は削除禁止。
未追跡ファイルのみを削除対象とする。
未追跡ファイルが存在しない場合はエラーにせず続行。

### 2. worktreeの削除

```bash
git worktree remove ".worktrees/{N}-{type}"
```

**Permission denied 時のリトライ**: ファイルハンドル解放待ちのため短い待機を挟んでリトライ。
最大3回。
リトライ条件は "Permission denied" を含む場合のみ。
上限到達時は警告表示して停止。

**リトライ前の復元**: リトライ時、worktree 内に変更された追跡済みファイルがある場合は `git checkout .` を実行して追跡済みファイルをクリーンな状態に復元してから再試行する。

### 3. クリーンアップ

```bash
git worktree prune
```

成功時: `git worktree remove` 正常終了後の管理情報のクリーンアップ。

失敗時: `git worktree remove` がすべてのリトライ後に失敗した場合のフォールバッククリーンアップ。
`prune` は無効な worktree 管理情報のみを削除し、worktree ディレクトリ自体は削除しない。

#### Windows + ジャンクション環境の削除フォールバック

**エラーパターン**: Windows + ジャンクション環境で `git worktree remove` が `Not a directory` を含むエラーで失敗する場合。

**原因**: ジャンクションの reparse point により、git 内部の削除処理がディレクトリを正しく辿れないことがある。

**適用条件**: `git worktree remove` が上記エラーで失敗した場合のみ。
通常の削除成功時は実行しない。

**手順**:
1. worktree 管理情報を更新: `git worktree prune`
2. ジャンクションディレクトリを手動削除: `Remove-Item -LiteralPath "{worktree_path}" -Recurse -Force` または `rmdir /s /q "{worktree_path}"`
3. ローカルブランチを削除: `git branch -d {branch_name}`（必要時のみ `-D`）
4. リモートブランチがある場合のみ削除: `git push origin --delete {branch_name}`

**注意**: `install-consumer-opencode.ps1` が作成するジャンクション link 経由の worktree で発生する Windows 固有の挙動。
背景: worktree ジャンクション削除フォールバック要件（関連Issue/PRは履歴参照）。

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

**重要**: force pushは慎重に実行すること。
リモートの変更を上書きするリスクがあるため、事前に確認が必要。

