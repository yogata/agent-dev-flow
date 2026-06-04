---
description: promoted artifact を分析・統合し、ユーザー承認を得て review 結果を保存する
agent: sisyphus
---

# Backlog Review

`.agentdev/intake/promoted/*.md` 及び `.agentdev/learning/promoted/*.md` の promoted artifact を読み込み、分析・統合してユーザーに判定を提示し、承認結果を draft として保存する。

**このコマンドは RU ファイルを生成しない（MUST NOT）（REQ-0105-033）。** 承認済み review 結果の保存のみを行う。RU 生成は `/agentdev/backlog-save` が担当する。

## Input

- `.agentdev/intake/promoted/*.md`（intake パイプラインからの promoted artifact）
- `.agentdev/learning/promoted/*.md`（learning パイプラインからの promoted artifact）
- **引数指定**: ユーザーがファイルパスを引数として指定した場合、指定されたファイルのみを対象とする。引数なしの場合、両ディレクトリの全 promoted artifact を対象とする

## Output

- `.sisyphus/drafts/backlog-review-{topic-slug}.md`（status: reviewed）

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

### Step 3: 統合・分割判定 + ユーザー承認

分析結果に基づき、RU への統合・分割を判定し、ユーザーに提示して承認を得る（REQ-0105-031）:

- **N:1 統合**: 同一関心領域の複数 artifact → 1 RU
- **1:N 分割**: 1 artifact 内の複数独立論点 → 複数 RU
- **1:1**: 特別な統合・分割不要

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

### Step 5: Review 結果の保存

ユーザー承認済みの判定結果を draft として保存する（REQ-0105-040, 041）:

```
.sisyphus/drafts/backlog-review-{topic-slug}.md
```

Draft の内容:
- **draft-meta**: topic-slug, status: reviewed, source artifacts, integration/split plan
- **判定結果**: 統合・分割の grouping と承認状況
- **矛盾検出結果**: 検出された矛盾とユーザーの判断
- **RU 生成方針**: 各 RU の source, source_type, 要件化の方向
- **失敗・残置**: 矛盾等で除外された artifact のリストと理由

### Step 6: 完了報告

完了報告 → 完了報告templateに従って出力:
- 全て成功 → `templates/backlog-review/standard.md`
- partial success（矛盾あり）→ `templates/backlog-review/partial.md`
- promoted artifact なし → `templates/backlog-review/zero-promoted.md`

git 永続化結果を含める。次のコマンド: `/agentdev/backlog-save`

## Guardrails

- G01: RU ファイルを生成しない（MUST NOT）（REQ-0105-033）。RU 生成は `backlog-save` の責務
- G02: REQ ファイルの保存を行わない（`req-save` が担当）
- G03: GitHub Issue の作成を行わない（`case-open` が担当）
- G04: promoted artifact の単純コピー（パススルー）を生成しない（MUST NOT）
- G05: `.agentdev/intake/inbox/`、`.agentdev/intake/archive/`、`.agentdev/learning/inbox.md`、`.agentdev/learning/archive/active.md` を更新しない（MUST NOT）
- G06: 矛盾検出時はユーザーの指示を待ち、自動的に解決しない
