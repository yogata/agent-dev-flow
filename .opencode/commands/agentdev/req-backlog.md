---
description: promoted artifact を分析・統合し、Requirement Unit（RU）を生成する
agent: sisyphus
load_skills:
  - agentdev-workflow-lifecycle
  - agentdev-workflow-reporting
  - agentdev-gh-cli
---

# Req Backlog

`.agentdev/intake/promoted/*.md` 及び `.agentdev/learning/promoted/*.md` の promoted artifact を読み込み、分析・統合して Requirement Unit（RU）を `.agentdev/backlog/req-units/RU-*.md` として生成する。

**このコマンドは RU 生成のみを行う。** REQ ファイルの保存・Issue の作成は行わない（REQ-0039-001）。

## Input

- `.agentdev/intake/promoted/*.md`（intake パイプラインからの promoted artifact、フラット構造）
- `.agentdev/learning/promoted/*.md`（learning パイプラインからの promoted artifact、フラット構造）

## Output

- `.agentdev/backlog/req-units/RU-*.md`（Requirement Unit）
- 成功した promoted artifact の削除（REQ-0039-006）

## RU フォーマット

RU-*.md は以下の構造に従う（REQ-0039-002, 003）:

```markdown
---
source_type: {intake | learning | mixed}
generated_by: req-backlog
generated_at: {ISO 8601 timestamp}
status: draft
sources:
  - path: {.agentdev/intake/promoted/xxx.md | .agentdev/learning/promoted/xxx.md}
    type: {intake | learning}
---

## Sources

{各 source artifact の要点抽出。パススルー禁止（REQ-0039-003）}

## Source Summary

{全 source の共通テーマ・論点の統合サマリ}

## 統合理由

{N:1 統合または 1:N 分割の理由。どの artifact を統合/分割したか、その根拠}

## 要件化の方向

{req-define に渡すべき要件化の方向性・アプローチ・推奨スコープ}
```

### 粒度ルール（REQ-0039-004）

- **N:1**: 複数 artifact の趣旨が同一の場合、1 RU に統合する
- **1:N**: 1 artifact 内に複数の独立した論点がある場合、複数 RU に分割する
- 粒度判定は artifact 間の論理的関連性に基づく

## Steps

### Step 0: 実行前同期（git pull --ff-only）

`git pull --ff-only` を実行する。

- **失敗時**: 以下の構造化エラーメッセージを表示して停止する（自動解消しない）:
  ```
  ## Git 同期エラー

  **エラー種別**: pull --ff-only 失敗
  **停止理由**: リモートに未取り込みの変更があり、fast-forward マージできない
  **対象ブランチ**: {current_branch}
  **ユーザーアクション**: 手動で `git pull --rebase` または `git stash && git pull --ff-only && git stash pop` を実行してください
  **raw git output**:
  {git_error_output}
  ```

### Step 1: Artifact 検出

両ディレクトリから promoted artifact を検出する:

- `.agentdev/intake/promoted/*.md`
- `.agentdev/learning/promoted/*.md`

検出結果の判定:
- **0件**: 正常終了する（エラー扱いとしない）（REQ-0039-007）。完了報告で「対象なし」と報告
- **1件以上**: 検出された全 artifact をファイルパス昇順で並べ、Step 2 へ進む

### Step 2: Artifact 読み込み・分析

各 promoted artifact を読み込み、内容を分析する:

- **intake 系**: タイトル・概要・対象範囲・完了条件等の構造化内容を抽出
- **learning 系**: 背景・問題・望ましい変更・対象範囲・完了条件等の Requirement Source 形式内容を抽出
- frontmatter は持たない（ディレクトリ配置が一次状態）

分析結果を各 artifact ごとにまとめる:

| 項目 | 内容 |
|------|------|
| artifact パス | 元ファイルパス |
| source type | intake / learning |
| 主要テーマ | 抽出された主論点 |
| 関連 artifact 群 | 同一趣旨の可能性がある他 artifact |

### Step 3: 統合・分割判定

分析結果に基づき、RU への統合・分割を判定する（REQ-0039-004）:

- **N:1 統合条件**: 複数 artifact が同一の要件・課題に関する内容を含む
- **1:N 分割条件**: 1 artifact に独立した複数の論点が含まれる
- **1:1**: 特別な統合・分割が不要な場合

判定結果をユーザーに提示し、確認を得る:

- 統合・分割の grouping の妥当性
- 調整指示があれば反映

### Step 4: 矛盾検出

統合対象の artifact 間に矛盾がないか確認する（REQ-0039-005）:

- **矛盾の定義**: 同一事項に対して互いに両立不可能な要求が含まれる状態
- **矛盾検出時**: 矛盾する artifact を RU 化せず、ユーザーに確認を求める
  - 矛盾内容と対象 artifact を提示
  - ユーザーの指示を待つ（どちらを採用するか、両立可能か等）
- **矛盾しない artifact**: 通常通り RU 化を継続する（partial success）
- 矛盾の結果、RU 化を見送った artifact は `promoted/` に残置する

### Step 5: RU 生成

統合・分割判定に基づいて RU ファイルを生成する:

1. `.agentdev/backlog/req-units/` ディレクトリが存在しない場合は作成する
2. 各 RU について:
   - frontmatter を生成（source_type, generated_by, generated_at, status, sources）
   - Sources セクション: 各 source の要点（パススルー禁止）（REQ-0039-003）
   - Source Summary セクション: 統合サマリ
   - 統合理由セクション: N:1/1:N の理由
   - 要件化の方向セクション: req-define への推奨方向
3. ファイル名: `RU-{NNNN}.md`（NNNN は連番、既存ファイルの最大番号 +1 から採番）
4. 各 RU の内容をユーザーに提示し、確認を得る

### Step 6: 成功 artifact の削除

RU 生成が成功した promoted artifact を削除する（REQ-0039-006, 010）:

- **削除条件**: 当該 artifact が RU に取り込まれ、RU ファイルの生成が確認できた場合のみ
- **削除対象**: RU 化に成功した `.agentdev/intake/promoted/*.md` 及び `.agentdev/learning/promoted/*.md`
- **残置対象**: RU 化に失敗した artifact、矛盾検出により保留された artifact
- 削除結果を記録する（Step 8 の完了報告で集計）

### Step 7: Git 永続化

`.agentdev/` 配下の変更を commit / push する:

- `git diff --name-only` で `.agentdev/` 配下の変更ファイルを確認する
- **変更なし時**: commit/push せず、Step 8 の完了報告で「変更なし」と報告
- **変更あり時**:
  1. `git add` は `.agentdev/` 配下の変更ファイルのみを対象とする（SHALL）
  2. commit message: `chore(agentdev): generate requirement units via req-backlog`（Conventional Commits 形式）（SHALL）
  3. `git push` を実行する
  4. **push 失敗時**: 以下の構造化エラーメッセージを表示し、完了扱いにしない（SHALL）:
     ```
     ## Git Push エラー

     **エラー種別**: push 失敗
     **停止理由**: リモートへのプッシュに失敗
     **対象ブランチ**: {current_branch}
     **変更ファイル**: {changed_files}
     **ユーザーアクション**: 手動で `git push` を実行してください
     **raw git output**:
     {git_error_output}
     ```

### Step 8: 完了報告

完了報告 → `agentdev-workflow-reporting` の完了報告フォーマット（completion-reports.md → req-backlog 完了時）に従って出力。git 永続化結果（変更有無・ファイル一覧・commit hash・push 成否）を含める

## Error Handling

| エラー | 対処 |
|--------|------|
| git pull --ff-only 失敗 | 構造化エラーメッセージを表示して停止。自動解消しない |
| git push 失敗 | 構造化エラーメッセージを表示。完了扱いにしない |
| artifact 読み込み失敗 | 当該 artifact をスキップし、後続 artifact の処理を継続。失敗を記録して Step 8 で報告 |
| 矛盾検出 | 矛盾する artifact を RU 化せずユーザーに確認。矛盾しない artifact は通常通り RU 化を継続 |
| 全件失敗 | 構造化された実行報告を出力して終了（REQ-0039-008） |

## Guardrails

### 責務境界（REQ-0039-001, 009）
- G01: REQ ファイルの保存を行わない（`req-save` が担当）
- G02: GitHub Issue の作成を行わない（`case-open` が担当）
- G03: `req-define` を自動起動しない（次ステップの提示のみ）
- G04: promoted artifact の単純コピー（パススルー）を生成しない（MUST NOT）（REQ-0039-003）。全 RU は分析・統合された構造化内容でなければならない

### raw item 保護（REQ-0039-009）
- G05: `.agentdev/intake/inbox/` の intake raw item を更新しない（MUST NOT）
- G06: `.agentdev/intake/archive/` の intake raw item を更新しない（MUST NOT）
- G07: `.agentdev/learning/inbox.md` を更新しない（MUST NOT）
- G08: `.agentdev/learning/archive.md` を更新しない（MUST NOT）
- G09: raw item の更新は各パイプラインのコマンド（intake-promote, learning-promote）の責務である

### 実行制約
- G10: promoted artifact は `.agentdev/intake/promoted/*.md` 及び `.agentdev/learning/promoted/*.md` のフラット構造からのみ読み込む（サブディレクトリは探索しない）
- G11: RU の配置先は `.agentdev/backlog/req-units/` のみ
- G12: 矛盾検出時はユーザーの指示を待ち、自動的に解決しない
- G13: partial success をサポートする（成功分は RU 化 + 元 artifact 削除、失敗分は残置）（REQ-0039-010）
