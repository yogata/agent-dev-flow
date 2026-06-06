---
description: 承認済み review 結果から RU（Requirement Unit）を生成・永続化する
agent: sisyphus
---

# Backlog Save

`backlog-review` が生成した承認済み review 結果（`.sisyphus/drafts/backlog-review-*.md`、status: reviewed）を読み込み、RU を生成して git 永続化する（REQ-0105-034）。

**このコマンドは RU 生成後に追加のユーザー確認を要求しない（MUST NOT）（REQ-0105-035）。** review での承認をもって RU 生成を完結させる。

## Input

- `.sisyphus/drafts/backlog-review-*.md`（status: reviewed の draft のみ）

## Output

- `.agentdev/backlog/req-units/RU-*.md`（Requirement Unit）
- 成功した promoted artifact の削除
- draft の status: saved 更新

## RU フォーマット

RU-*.md は以下の構造に従う（REQ-0105）:

```markdown
---
source_type: {intake | learning | mixed | chat}
generated_by: backlog-save
generated_at: {ISO 8601 timestamp}
status: draft
sources:
  - path: {.agentdev/intake/promoted/xxx.md | .agentdev/learning/promoted/xxx.md}
    type: {intake | learning}
---

## Sources

{各 source artifact の要点抽出。パススルー禁止（REQ-0105）}

## Source Summary

{全 source の共通テーマ・論点の統合サマリ}

## 統合理由

{N:1 統合または 1:N 分割の理由}

## 要件化の方向

{req-define に渡す要件化の方向性}
```

## Steps

### Step 0: 実行前同期

`git pull --ff-only` を実行する。失敗時は構造化エラーメッセージを表示して停止する。

### Step 1: Draft 検出

`.sisyphus/drafts/backlog-review-*.md` から status: reviewed の draft を検出する（REQ-0105-042）:

- **0件**: 正常終了。完了報告で「対象なし」と報告
- **1件以上**: 各 draft の内容を読み込み Step 2 へ
- status: saved の draft は再処理しない（MUST NOT）（REQ-0105-044）

### Step 2: RU 生成

各 draft の RU 生成方針に基づいて RU ファイルを生成する（REQ-0105-034）:

1. `.agentdev/backlog/req-units/` が存在しない場合は作成
2. 各 RU について:
    - frontmatter 生成（source_type, generated_by: backlog-save, generated_at, status: draft, sources）
    - **upstream handoff metadata 転記**（REQ-0104-024）: review draft に `handoff_target` と `apply_in_current_project: false` が存在する場合、RU frontmatter に転記する。RU 本文に現在プロジェクトでは実装しない upstream handoff 用 RU であることを記載する
    - Sources セクション: 各 source の要点（パススルー禁止）
   - Source Summary セクション: 統合サマリ
   - 統合理由セクション: N:1/1:N の理由
   - 要件化の方向セクション: req-define への推奨方向
3. ファイル名: `RU-{NNNN}.md`（既存ファイルの最大番号 +1 から採番）

**追加のユーザー確認は行わない**（REQ-0105-035）。review での承認をもって生成を完結。

### Step 3: 成功 artifact の削除

RU 生成が成功した promoted artifact を削除する（REQ-0105-036）:

- **削除条件**: 当該 artifact が RU に取り込まれ、RU ファイルの生成が確認できた場合のみ
- **残置対象**: RU 化に失敗した artifact、矛盾により除外された artifact
- 削除結果を記録する

### Step 4: Git 永続化

`.agentdev/` 配下の変更を commit / push する（REQ-0105-037）:

- `git diff --name-only` で `.agentdev/` 配下の変更を確認
- **変更なし時**: commit/push せず完了報告で「変更なし」と報告
- **変更あり時**:
  1. `.agentdev/` 配下のみ `git add`
  2. commit message: `chore(agentdev): generate requirement units via backlog-save`
  3. `git push` を実行。失敗時は構造化エラーメッセージを表示して停止

### Step 5: Draft Status 更新

RU 生成、artifact 削除、git commit/push が全て成功した後、当該 backlog-review draft の status を `saved` に更新する（REQ-0105-043）。

### Step 6: 完了報告

完了報告 → 完了報告templateに従って出力:
- 全て成功 → `.opencode/commands/agentdev/templates/backlog-save/standard.md`
- partial success → `.opencode/commands/agentdev/templates/backlog-save/partial.md`
- 対象 draft なし → `.opencode/commands/agentdev/templates/backlog-save/zero-draft.md`

git 永続化結果を含める。次のコマンド: `/agentdev/req-define`

## Guardrails

- G01: 追加のユーザー確認を要求しない（MUST NOT）（REQ-0105-035）。review での承認をもって完結
- G02: status: saved の draft を再処理しない（MUST NOT）（REQ-0105-044）
- G03: REQ ファイルの保存を行わない（`req-save` が担当）
- G04: GitHub Issue の作成を行わない（`case-open` が担当）
- G05: promoted artifact の単純コピー（パススルー）を生成しない（MUST NOT）
- G06: `.agentdev/intake/inbox/`、`.agentdev/intake/archive/`、`.agentdev/learning/inbox.md`、`.agentdev/learning/archive/active.md` を更新しない（MUST NOT）
- G07: RU 生成に失敗した artifact は削除しない（REQ-0105-036）
