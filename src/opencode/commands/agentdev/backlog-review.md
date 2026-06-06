---
description: promoted artifact を分析・統合し、ユーザー承認後に RU（Requirement Unit）を生成する
agent: sisyphus
---

# Backlog Review

`.agentdev/intake/promoted/*.md` 及び `.agentdev/learning/promoted/*.md` の promoted artifact を読み込み、分析・統合してユーザーに判定を提示し、承認後に直接 RU を生成する（REQ-0105-058, 059）。

**このコマンドはユーザー承認後に RU を生成する。ユーザー承認は RU 作成承認を兼ねる（REQ-0105-059）。**

## Input

- `.agentdev/intake/promoted/*.md`（intake パイプラインからの promoted artifact）
- `.agentdev/learning/promoted/*.md`（learning パイプラインからの promoted artifact）
- **引数指定**: ユーザーがファイルパスを引数として指定した場合、指定されたファイルのみを対象とする。引数なしの場合、両ディレクトリの全 promoted artifact を対象とする

## Output

- `.agentdev/backlog/req-units/RU-*.md`（Requirement Unit）
- 成功した promoted artifact の削除

## RU フォーマット

RU-*.md は以下の構造に従う（REQ-0105）:

```markdown
---
source_type: {intake | learning | mixed | chat}
generated_by: backlog-review
generated_at: {ISO 8601 timestamp}
status: draft
depends_on: [RU-{NNNN}] (optional, REQ-0105-066)
sources:
  - path: {.agentdev/intake/promoted/xxx.md | .agentdev/learning/promoted/xxx.md}
    type: {intake | learning}
---

## Sources

{各 source artifact の要点抽出。パススルー禁止（REQ-0105-061）}

## Source Summary

{全 source の共通テーマ・論点の統合サマリ}

## 統合理由

{N:1 統合または 1:N 分割の理由}

## 要件化の方向

{req-define に渡す要件化の方向性}
```

## Steps

### Step 0: 実行前同期

`git pull --ff-only` を実行する。失敗時は構造化エラーメッセージを表示して停止する（`agentdev-git-worktree` の git-common-procedures.md Section 2 と同一のエラー形式）。

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

各 promoted artifact を読み込み、内容を分析する:

| 項目 | 内容 |
|------|------|
| artifact パス | 元ファイルパス |
| source type | intake / learning |
| 主要テーマ | 抽出された主論点 |
| 関連 artifact 群 | 同一趣旨の可能性がある他 artifact |

**upstream handoff metadata 付与**（REQ-0104-023）: artifact が AgentDevFlow 本体の不具合・改善点を扱う場合、分析結果に `handoff_target: agent-dev-flow` と `apply_in_current_project: false` を記録する。判定は `agentdev-workflow-lifecycle/references/upstream-handoff.md` に従う

### Step 3: 統合・分割判定 + depends_on 依存解決 + ユーザー承認

分析結果に基づき、RU への統合・分割を判定し、ユーザーに提示して承認を得る（REQ-0105-031）:

- **N:1 統合**: 同一関心領域の複数 artifact → 1 RU
- **1:N 分割**: 1 artifact 内の複数独立論点 → 複数 RU
- **1:1**: 特別な統合・分割不要

**depends_on 依存解決**（REQ-0105-066〜069）:
- RU 間に依存関係がある場合、`depends_on` に RU-ID を指定する
- 依存先 RU が同一バッチ内または既存 RU（`.agentdev/backlog/req-units/`）として存在することを確認
- 循環依存が存在しないことを確認
- 依存順に並べ替え可能であることを確認
- 未解決・循環・同時処理対象外の依存がある場合、当該 RU を処理せず理由を提示

ユーザーの調整指示があれば反映する。

### Step 4: 矛盾検出 + ユーザー承認

統合対象の artifact 間に矛盾がないか確認し、矛盾があればユーザーに委ねる（REQ-0105-032）:

| 項目 | 内容 |
|------|------|
| Artifact ペア | `{artifact_A} vs {artifact_B}` |
| 矛盾の内容 | 両立不可能な要求の概要 |
| A の主張 | A の該当記述と要約 |
| B の主張 | B の該当記述と要約 |

矛盾する artifact は RU 化対象から除外し `promoted/` に残置する。矛盾しない artifact は通常通り処理継続（partial success）。

### Step 5: RU 生成

ユーザー承認済みの判定結果に基づいて RU を生成する（REQ-0105-058）:

1. `.agentdev/backlog/req-units/` が存在しない場合は作成
2. 各 RU について:
    - frontmatter 生成（source_type, generated_by: backlog-review, generated_at, status: draft, depends_on（任意）, sources）
    - **upstream handoff metadata 転記**（REQ-0104-024）: 分析結果に `handoff_target` と `apply_in_current_project: false` が存在する場合、RU frontmatter に転記する。RU 本文に現在プロジェクトでは実装しない upstream handoff 用 RU であることを記載する
    - Sources セクション: 各 source の要点（パススルー禁止）（REQ-0105-061）
    - Source Summary セクション: 統合サマリ
    - 統合理由セクション: N:1/1:N の理由
    - 要件化の方向セクション: req-define への推奨方向
3. ファイル名: `RU-{NNNN}.md`（既存ファイルの最大番号 +1 から採番）
4. **depends_on 検証**（REQ-0105-066〜069）:
    - depends_on 値は RU-ID に限定（promoted artifact path 不可）
    - 依存先 RU が存在することを確認
    - 循環依存がないことを確認
    - 依存順に並べ替え可能であることを確認
    - 検証失敗時は当該 RU を生成せず理由を提示

### Step 6: 成功 artifact の削除

RU 生成が成功した promoted artifact のみを削除する（REQ-0105-060）:

- **削除条件**: 当該 artifact が RU に取り込まれ、RU ファイルの生成が確認できた場合のみ
- **残置対象**: RU 化に失敗した artifact、矛盾により除外された artifact
- 削除結果を記録する

### Step 7: Git 永続化

`.agentdev/` 配下の変更を commit / push する（REQ-0105-065）:

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

RU 生成結果・git 永続化結果を含める。次のコマンド: `/agentdev/req-define`（REQ-0105-063）

## Guardrails

- G01: REQ ファイルの保存を行わない（`req-save` が担当）
- G02: GitHub Issue の作成を行わない（`case-open` が担当）
- G03: promoted artifact の単純コピー（パススルー）を生成しない（MUST NOT）（REQ-0105-061）
- G04: `.agentdev/intake/inbox/`、`.agentdev/intake/archive/`、`.agentdev/learning/inbox.md`、`.agentdev/learning/archive/active.md` を更新しない（MUST NOT）
- G05: 矛盾検出時はユーザーの指示を待ち、自動的に解決しない
- G06: RU 生成に失敗した artifact は削除しない（REQ-0105-060）
- G07: depends_on に promoted artifact path を指定しない（MUST NOT）（REQ-0105-066）。RU-ID のみ許容
