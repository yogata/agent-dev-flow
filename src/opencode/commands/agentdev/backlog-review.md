---
description: promoted artifact を分析・統合し、ユーザー承認後に RU（Requirement Unit）を生成する
agent: sisyphus
---

# Backlog Review

`.agentdev/intake/promoted/*.md` 及び `.agentdev/learning/promoted/*.md` の promoted artifact を読み込み、分析・統合してユーザーに判定を提示し、承認後に直接 RU を生成する。

**このコマンドはユーザー承認後に RU を生成する。ユーザー承認は RU 作成承認を兼ねる。**

## Input

- `.agentdev/intake/promoted/*.md`（intake パイプラインからの promoted artifact）
- `.agentdev/learning/promoted/*.md`（learning パイプラインからの promoted artifact）
- **引数指定**: ユーザーがファイルパスを引数として指定した場合、指定されたファイルのみを対象とする。引数なしの場合、両ディレクトリの全 promoted artifact を対象とする

## Output

- `.agentdev/backlog/req-units/RU-*.md`（Requirement Unit）
- 成功した promoted artifact の削除

## RU フォーマット

RU-*.md は以下の構造に従う:

```markdown
---
source_type: {intake | learning | mixed | chat}
generated_by: backlog-review
generated_at: {ISO 8601 timestamp}
status: draft
  depends_on: [RU-{NNNN}] (optional)
  sources:
  - path: {.agentdev/intake/promoted/xxx.md | .agentdev/learning/promoted/xxx.md}
    type: {intake | learning}
---

## Sources

{各 source artifact の要点抽出。パススルー禁止}

## Source Summary

{全 source の共通テーマ・論点の統合サマリ}

## 統合理由

{N:1 統合または 1:N 分割の理由}

## 要件化の方向

{req-define に渡す要件化の方向性}
```

## Steps

### Step 0: 実行前同期

`git pull --ff-only` を実行する。失敗時は構造化エラーメッセージを表示して停止する（`agentdev-git-worktree` と同一のエラー形式）。

### Step 1: Artifact 検出

引数の有無に応じて対象を切り替える:

**引数なしの場合**: 両ディレクトリから promoted artifact を検出:
- `.agentdev/intake/promoted/*.md`
- `.agentdev/learning/promoted/*.md`

**引数ありの場合**: 指定されたファイルパスのみを対象。存在しないパスはエラー報告してスキップ。

検出結果の判定:
- **0件**: 正常終了（エラー扱いとしない）。完了報告で「対象なし」と報告
- **1件以上**: ファイルパス昇順で Step 2 へ

### Step 2: Artifact 読み込み・分析

分析基準・upstream handoff metadata 付与ルールは `agentdev-backlog-integration` を参照

### Step 3: 統合・分割判定 + depends_on 依存解決 + ユーザー承認

統合・分割判定基準・depends_on 依存解決ルールは `agentdev-backlog-integration` を参照

### Step 4: 矛盾検出 + ユーザー承認

矛盾検出ロジック・出力形式は `agentdev-backlog-integration` を参照

### Step 5: RU 生成

RU 生成ルール・frontmatter スキーマ・depends_on 検証は `agentdev-backlog-integration` を参照

### Step 6: 成功 artifact の削除

RU 生成が成功した promoted artifact のみを削除する:

- **削除条件**: 当該 artifact が RU に取り込まれ、RU ファイルの生成が確認できた場合のみ
- **残置対象**: RU 化に失敗した artifact、矛盾により除外された artifact
- 削除結果を記録する

### Step 7: Git 永続化

`.agentdev/` 配下の変更を commit / push する:

- `git diff --name-only` で `.agentdev/` 配下の変更を確認
- **変更なし時**: commit/push せず完了報告で「変更なし」と報告
- **変更あり時**:
  1. `.agentdev/` 配下のみ `git add`
  2. commit message: `chore(agentdev): generate requirement units via backlog-review`
  3. `git push` を実行。失敗時は構造化エラーメッセージを表示して停止

### Step 8: 完了報告

完了報告 → 完了報告templateに従って出力:
- 全て成功 → `.opencode/commands/agentdev/templates/backlog-review/standard.md`
- partial success（矛盾あり）→ `.opencode/commands/agentdev/templates/backlog-review/partial.md`
- promoted artifact なし → `.opencode/commands/agentdev/templates/backlog-review/zero-promoted.md`

RU 生成結果・git 永続化結果を含める。次のコマンド: `/agentdev/req-define`

## Guardrails

- G01: REQ ファイルの保存を行わない（`req-save` が担当）
- G02: GitHub Issue の作成を行わない（`case-open` が担当）
- G03: promoted artifact の単純コピー（パススルー）を生成しない
- G04: `.agentdev/intake/inbox/`、`.agentdev/intake/archive/`、`.agentdev/learning/inbox.md`、`.agentdev/learning/archive/active.md` を更新しない
- G05: 矛盾検出時はユーザーの指示を待ち、自動的に解決しない
- G06: RU 生成に失敗した artifact は削除しない
- G07: depends_on に promoted artifact path を指定しない。RU-ID のみ許容
