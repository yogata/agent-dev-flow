---
source_type: chat
generated_by: session
generated_at: 2026-05-31T00:00:00+09:00
status: draft
sources:
  - type: chat
    path: session:2026-05-31-case-close-pre-pull-reset
---

# RU: case-close pull前自動リセット廃止と case-open RU削除後同期確認

## 背景

`case-open` は Issue 作成後、Requirement Source に記録された `.agentdev/backlog/req-units/RU-*.md` を削除する。

`case-run` は `origin/main` をベースに worktree を作成して実装を行う。

`case-close Step 8b` は PR merge 後の `git pull --ff-only` 前に `git status --porcelain` を確認し、ローカル変更がある場合に `git checkout --` でリセットする規則を持つ。

現行 Step 8b には「ローカル変更リセットはPRで削除されたファイルに限定」とあるが、この判定手順は未定義であり、PR 外の削除ファイルまで復元し得る。

## 問題

`case-open` が RU を削除・commit・push した後、main 作業ディレクトリが削除後の `origin/main` と一致していない状態で `case-close` が実行されると、RU ファイルが `git status --porcelain` 上で `D` として見える場合がある。

この状態で `case-close Step 8b` が `git checkout --` を実行すると、古い local HEAD から RU ファイルを復元してしまう。

本質的な問題は、PR 削除ファイルの処理ではなく、pull 前にローカル変更を自動リセットする設計と、`case-open` 後の main 同期状態が明示されていない点である。

## Source Summary

チャット内で以下を合意した。

- `worktree` 作成主体は `case-run` であり、`case-open` ではない。
- `case-open` は RU 削除を行う。
- RU 削除後に main 作業ディレクトリが削除後状態と一致していれば、`case-close` で RU が `D` として検出されず、巻き戻りは発生しない。
- `case-close Step 8b` の「PRで削除されたファイルに限定」は未実装であり、趣旨は pull 前の安全な一時リセットと解釈できる。
- ただし、今回の根本対策として PR 削除ファイル照合を作り込むのではなく、pull 前の自動 `git checkout --` を廃止し、ローカル変更検出時は停止する方針とする。

## 統合理由

本件は `case-open` の RU 削除後状態確認と、`case-close` の pull 前リセット挙動が組み合わさって発生する。

そのため、`case-open` 側だけ、または `case-close` 側だけではなく、以下を一体で要件化する。

1. `case-open` は RU 削除 commit/push 後に main 作業ディレクトリの同期状態を確認する。
2. `case-close` は pull 前にローカル変更を自動リセットしない。

## 要件化の方向

`case-close Step 8b` の「PRで削除されたファイルに限定して自動リセットする」方針は廃止する。

代わりに、以下を要件化する。

1. `case-open` は RU 削除 commit/push 後、main 作業ディレクトリが削除後の `origin/main` と一致していることを確認する。
2. `case-close` は pull 前にローカル変更を自動で `git checkout --` してはならない。
3. `case-close` は pull 前ローカル変更を検出した場合、対象ファイルと状態を表示して停止する。

## 主対象REQまたは変更対象候補

### 主対象REQ

- `docs/requirements/REQ-0105.md`
  - `case-open` の RU 削除後同期確認を追加する。
- `docs/requirements/REQ-0106.md`
  - `case-close Step 8b` の pull 前自動リセット禁止を追加する。

### 変更対象候補

- `.opencode/commands/agentdev/case-open.md`
- `.opencode/commands/agentdev/case-close.md`

## 要件案

### REQ-0105 への APPEND

| ID | 要件 |
|---|---|
| REQ-0105-XXX | `case-open` は RU ファイル削除を commit/push した場合、main 作業ディレクトリの `HEAD` と `origin/main` が一致し、`git status --porcelain` に削除済み RU ファイルが残っていないことを確認すること（SHALL） |
| REQ-0105-XXX | `case-open` は RU ファイル削除 commit/push 後の同期確認に失敗した場合、完了扱いにせず、対象ファイル・現在の HEAD・`origin/main` を表示して停止すること（SHALL） |

### REQ-0106 への APPEND / UPDATE

| ID | 要件 |
|---|---|
| REQ-0106-XXX | `case-close` は `git pull --ff-only` 前にローカル変更を検出した場合、自動で `git checkout --` により変更をリセットしてはならないこと（SHALL） |
| REQ-0106-XXX | `case-close` は pull 前ローカル変更を検出した場合、対象ファイルと状態を表示し、構造化エラーで停止すること（SHALL） |
| REQ-0106-XXX | `case-close` は pull 前ローカル変更の自動リセット対象を「PRで削除されたファイル」に限定する旧規則を廃止すること（SHALL） |

## 対象外

- PR diff から削除ファイル一覧を抽出する実装
- `gh pr diff` / GitHub API による PR 削除ファイル照合
- `git stash` による自動退避
- `git reset --hard` による自動解消
- RU 削除責務の `case-open` 以外への移管
- `case-run` の worktree 作成責務変更

## 受け入れ条件

- `case-open` が RU 削除 commit/push 後、main 作業ディレクトリと `origin/main` の一致を確認する。
- `case-open` 後に削除済み RU が `git status --porcelain` 上で `D` として残らない。
- `case-close Step 8b` は pull 前ローカル変更を検出しても `git checkout --` を実行しない。
- pull 前ローカル変更が存在する場合、`case-close` は対象ファイルと状態を表示して停止する。
- `case-close` から「PRで削除されたファイルに限定して自動リセットする」規則が削除または無効化されている。
- RU 削除済みファイルが古い local HEAD から復元されない。
- REQ-0105、REQ-0106、`case-open`、`case-close` の記述が矛盾しない。
