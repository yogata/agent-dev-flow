---
description: クローズ済み GitHub Issue/PR から未回収の変更候補を intake item として保存する
agent: sisyphus
---

# Intake from GitHub

クローズ済みの GitHub Issue / PR の本文・コメントから未回収の変更候補を抽出し、intake item として `.agentdev/intake/inbox/` に保存する。

旧 `issue-backlog` の抽出機能を intake workflow に再定義したコマンド。

**このコマンドは保存専用である。** GitHub Issue の作成・採用可否の判断は行わない。

## Input

- ユーザーの自然言語による期間指定（「直近1週間」「今月」「2026-05-02から」等）
- または特定の Issue/PR 番号の指定

## Output

- `.agentdev/intake/inbox/YYYY-MM-DD-{topic-slug}.md` に保存された intake item（候補ごとに1ファイル）
- 抽出サマリーレポート（ユーザー確認用）

## Intake Item 形式

`intake-capture` と同一の推奨標準形を使用する。frontmatter・状態フィールド・重複排除キーは持たない。各セクションの見出し名は固定せず、抽出内容に合わせて整理する。内容がないセクションを作成しない。

## Steps

1. **期間解釈**: 抽出アルゴリズムは `agentdev-workflow-lifecycle` skill の `references/intake-from-github-judgment-logic.md` の「Step 1: 期間解釈」を参照

2. **データ取得**: 取得方法・CLI コマンドは `agentdev-workflow-lifecycle` skill の `references/intake-from-github-judgment-logic.md` の「Step 2: データ取得」を参照

3. **構造的検出**: 抽出ルールは `agentdev-workflow-lifecycle` skill の `references/intake-from-github-judgment-logic.md` の「Step 3: 構造的検出」を参照

4. **LLM 全文解析**: キーワードリスト・コンテキスト付与ルールは `agentdev-workflow-lifecycle` skill の `references/intake-from-github-judgment-logic.md` の「Step 4: LLM 全文解析」を参照

5. **intake item 生成**: item 生成ルール・ファイル名規則は `agentdev-workflow-lifecycle` skill の `references/intake-from-github-judgment-logic.md` の「Step 5: intake item 生成」を参照

5-1. **実行前同期（git pull）**:
    - `git pull --ff-only` を実行する
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

6. **保存**:
    - 保存先: `.agentdev/intake/inbox/`
    - ディレクトリが存在しない場合は作成する
    - 同名ファイルが存在する場合は連番を付与する

6-1. **.agentdev/intake 変更の commit と push**:
    - `git diff --name-only` で `.agentdev/intake/` 配下の変更ファイルを確認する
    - **変更なし時**: commit/push せず、Step 8 の完了報告で「変更なし」と報告
    - **変更あり時**:
      1. `git add` は `.agentdev/intake/` 配下の変更ファイルのみを対象とする（SHALL）。他のパスを巻き込まない
      2. commit message: `chore(agentdev): capture intake items from github`（Conventional Commits 形式）（SHALL）
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

7. **サマリーレポート提示**: 抽出結果をサマリーとしてユーザーに提示する:
   ```
   ## Intake from GitHub 抽出サマリー

   - 対象期間: {since} 〜 {until}
   - 対象 Issue/PR 数: {N}
   - 抽出候補数: {M}
   - 保存先: .agentdev/intake/inbox/

   | # | タイトル | 元 Issue/PR | ファイル |
   |---|----------|-------------|----------|
   | 1 | ... | #XX | YYYY-MM-DD-xxx.md |
   ```

8. **完了報告** → 完了報告templateに従って出力。template: .opencode/commands/agentdev/templates/intake-from-github/standard.md。git 永続化結果（変更有無・ファイル一覧・commit hash・push 成否）を含める

## Error Handling

| エラー | 対処 |
|--------|------|
| git pull --ff-only 失敗 | 構造化エラーメッセージを表示して停止。自動解消しない |
| git push 失敗 | 構造化エラーメッセージを表示。完了扱いにしない |

## Guardrails

### 責務境界
- G01: GitHub Issue の作成を行わない（`case-open` が担当）
- G02: 採用可否の判断を行わない（`intake-promote` が担当）
- G03: review・整形・分類の判断を行わない（後続コマンドの責務）
- G04: Issue/PR へのコメント投稿・マーカー付与は行わない（`backlog-review` が担当）

### 形式制約
- G05: workflow 管理 artifact として扱わない
- G06: frontmatter・状態値・重複排除キー・後続 artifact 参照を必須にしない
- G07: 特定セクションを必須セクションとして扱わない
- G08: review 結果を item に書き込まない

### 実行制約
- G09: GitHub Issue/PR のデータ取得は `gh` CLI のみ使用（GitHub API 直接呼び出し不可）
- G10: 対象はクローズ済み Issue/PR のみ（オープン中は対象外）
- G11: `agentdev-gh-cli` に従って読み取り操作を実行する
- G12: 保存先は `.agentdev/intake/inbox/` のみ
- G13: 成果物本文（Issue本文・PR本文・commit message・保存対象ファイル本文・テンプレート成果物）はverbatimで返す。判定結果・調査過程・中間ログ・読解メモは要約・成果物パス・根拠・親判断事項・capture候補へ圧縮して返す
