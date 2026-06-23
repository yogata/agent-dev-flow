---
description: 採用済み成果物を分析、統合し、ユーザー承認後に RU（Requirement Unit）を生成する
agent: sisyphus
---

# Backlog レビュー

`.agentdev/intake/promoted/*.md`、`.agentdev/learning/promoted/*.md`、`.agentdev/inspect/promoted/*.md` の採用済み成果物を読み込み、分析、統合してユーザーに判定を提示し、承認後に直接 RU を生成する。

**このコマンドはユーザー承認後に RU を生成する。ユーザー承認は RU 作成承認を兼ねる。**

## 入力

- `.agentdev/intake/promoted/*.md`（intake パイプラインからの採用済み成果物）
- `.agentdev/learning/promoted/*.md`（learning パイプラインからの採用済み成果物）
- `.agentdev/inspect/promoted/*.md`（inspect パイプラインからの採用済み成果物）
- **引数指定**: ユーザーがファイルパスを引数として指定した場合、指定されたファイルのみを対象とする。引数なしの場合、全ディレクトリの採用済み成果物を対象とする

## 出力

- `.agentdev/backlog/req-units/RU-*.md`（Requirement Unit）
- 成功した採用済み成果物の削除

## RU フォーマット

RU-*.md は以下の構造に従う:

```markdown
---
source_type: {intake | learning | inspect | mixed | chat}
generated_by: backlog-review
generated_at: {ISO 8601 timestamp}
status: draft
  depends_on: [RU-{NNNN}] (optional)
  sources:
  - path: {.agentdev/intake/promoted/xxx.md | .agentdev/learning/promoted/xxx.md | .agentdev/inspect/promoted/xxx.md}
    type: {intake | learning | inspect}
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

## 手順

### Step 1: 実行前同期

`git pull --ff-only` を実行する。失敗時は構造化エラーメッセージを表示して停止する（`agentdev-git-worktree` と同一のエラー形式）。

### Step 2: 成果物検出

引数の有無に応じて対象を切り替える:

**引数なしの場合**: 両ディレクトリから採用済み成果物を検出:
- `.agentdev/intake/promoted/*.md`
- `.agentdev/learning/promoted/*.md`

**引数ありの場合**: 指定されたファイルパスのみを対象。存在しないパスはエラー報告してスキップ。

検出結果の判定:
- **0件**: 正常終了（エラー扱いとしない）。完了報告で「対象なし」と報告
- **1件以上**: ファイルパス昇順で Step 3 へ

### Step 3: 成果物読み込み、分析

分析基準、前工程からの引き継ぎメタデータ付与ルールは `agentdev-backlog-integration` を参照

### Step 4: 統合、分割判定 + depends_on 依存解決 + ユーザー承認

統合、分割判定基準、depends_on 依存解決ルールは `agentdev-backlog-integration` を参照

**矛盾なしの場合の単一承認（REQ-0147-009）**: 後続の Step 5 で矛盾が検出されない場合、本 Step 4 の統合、分割判定承認を RU 生成承認（Step 5/6）としても扱う。単一承認で処理し、追加の HITL は不要。

### Step 5: 矛盾検出 + 必要に応じて追加判断

矛盾検出ロジック、出力形式は `agentdev-backlog-integration` を参照

**矛盾検出時の追加判断（REQ-0147-009）**: 矛盾が検出された場合のみ、ユーザーに追加判断を求める。矛盾する artifact を RU 化せずユーザーに確認する。矛盾しない artifact は通常通り RU 化する（partial success）。自動解決しない（G05）

### Step 6: RU 生成

RU 生成ルール、frontmatter スキーマ、depends_on 検証は `agentdev-backlog-integration` を参照

### Step 7: 成功成果物の削除

RU 生成が成功した採用済み成果物のみを削除する:

- **削除条件**: 当該成果物が RU に取り込まれ、RU ファイルの生成が確認できた場合のみ
- **残置対象**: RU 化に失敗した成果物、矛盾により除外された成果物
- 削除結果を記録する

### Step 8: Git 永続化

`.agentdev/` 配下の変更を commit/ push する:

- `git diff --name-only` で `.agentdev/` 配下の変更を確認
- **変更なし時**: commit/push せず完了報告で「変更なし」と報告
- **変更あり時**:
  1. 並列実行安全ステージングプロシージャ（`agentdev-git-worktree`）に従い明示パスでステージする。生成した RU は `.agentdev/backlog/req-units/` 配下、削除した採用済み成果物は `.agentdev/{intake,learning,inspect}/promoted/` 配下の各パスを `git add <path>`/ `git rm <path>` で明示的にステージする。`.agentdev/` 全体の一括 `git add` は禁止
  2. commit message: `chore(agentdev): generate requirement units via backlog-review`
  3. `git commit -- <paths>`（--only pathspec 形式）を実行し、`git push` を行う。失敗時は構造化エラーメッセージを表示して停止

### Step 9: 完了報告

完了報告 → 完了報告templateに従って出力:
- 全て成功 → `.opencode/commands/agentdev/templates/backlog-review/standard.md`
- partial success（矛盾あり）→ `.opencode/commands/agentdev/templates/backlog-review/partial.md`
- 採用済み成果物なし → `.opencode/commands/agentdev/templates/backlog-review/zero-promoted.md`

RU 生成結果、git 永続化結果を含める。次のコマンド: `/agentdev/req-define`

## ガードレール

- G01: REQ ファイルの保存を行わない（`req-save` が担当）
- G02: GitHub Issue の作成を行わない（`case-open` が担当）
- G03: 採用済み成果物の単純コピー（パススルー）を生成しない
- G04: `.agentdev/intake/inbox/`、`.agentdev/intake/archive/`、`.agentdev/learning/inbox.md`、`.agentdev/learning/archive/active.md` を更新しない
- G05: 矛盾検出時はユーザーの指示を待ち、自動的に解決しない
- G06: RU 生成に失敗した成果物は削除しない
- G07: depends_on に採用済み成果物パスを指定しない。RU-ID のみ許容
- G08: 破壊的変更（矛盾解消、要件仕様スコープ変更、大量成果物削除等）は明示承認を維持する（REQ-0147-005）



