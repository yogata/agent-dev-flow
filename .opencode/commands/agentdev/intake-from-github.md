---
description: クローズ済み GitHub Issue/PR から未回収の変更候補を intake item として保存する
agent: sisyphus
implementation_pattern: capture-only
load_skills:
  - agentdev-workflow-lifecycle
  - agentdev-workflow-reporting
  - agentdev-gh-cli
---

# Intake from GitHub

クローズ済みの GitHub Issue / PR の本文・コメントから未回収の変更候補を抽出し、intake item として `.agentdev/intake/inbox/` に保存する。

旧 `issue-backlog` の抽出機能を intake workflow に再定義したコマンド（REQ-0103）。

**このコマンドは保存専用である。** GitHub Issue の作成・採用可否の判断は行わない（REQ-0103）。

## Input

- ユーザーの自然言語による期間指定（「直近1週間」「今月」「2026-05-02から」等）
- または特定の Issue/PR 番号の指定

## Output

- `.agentdev/intake/inbox/YYYY-MM-DD-{topic-slug}.md` に保存された intake item（候補ごとに1ファイル）
- 抽出サマリーレポート（ユーザー確認用）

## Intake Item 形式

`intake-capture` と同一の推奨標準形を使用する（REQ-0103）。frontmatter・状態フィールド・重複排除キーは持たない。

```markdown
# {タイトル}

## 観測
{何が観測されたか}

## 今回扱わない理由
{なぜ今すぐ対応しないのか}

## 影響
{影響の評価}

## レビューで決めること
{レビューで判断すべき点}

## 根拠（任意）
{元 Issue/PR 番号、元テキストのコンテキスト等}
```

**セクションに関する制約**:
- 各セクションの見出し名は固定しない。抽出内容に合わせて適切に整理する
- 必須セクション・省略不可セクションを設けない（REQ-0103）
- 内容がないセクションを形式維持のためだけに作成しない

## Steps

1. **期間解釈**: ユーザーの自然言語による期間指定を解釈し、GitHub CLI の検索クエリ用日付範囲（`since` / `until`）に変換する。現在日付は実行時のシステム日付を使用する。

2. **データ取得**: `gh` CLI を使用して、指定期間内にクローズされた Issue と PR を取得する:
   - Issues: `gh issue list --state closed --search "closed:>=YYYY-MM-DD" --limit 100 --json number,title,body,state,closedAt,labels,comments`
   - PRs: `gh pr list --state closed --search "closed:>=YYYY-MM-DD" --limit 100 --json number,title,body,state,closedAt,labels,comments`
   - `agentdev-gh-cli` に従ってコマンドを実行する（読み取り操作は READ 操作手順に従う）
   - コメントも取得: `gh issue view {N} --json comments` / `gh pr view {N} --json comments`

3. **構造的検出**: 取得した Issue/PR の本文およびコメントから、未チェックのチェックボックス（`- [ ]` または `* [ ]`）を構造的に抽出する。チェック済み（`- [x]`）は除外。

4. **LLM 全文解析**: 構造的検出で捕捉できなかった残課題を LLM による全文解析で抽出する:
   - 対象キーワード: 「対象外」「先送り」「別途対応」「後で」「TODO」「FIXME」「今後の課題」「残課題」「要検討」等
   - 暗黙的な残課題（否定表現等）も検出
   - 各抽出結果に元テキストのコンテキスト（前後文）を付与

5. **intake item 生成**: 抽出した各候補を intake item 形式に整理する:
    - 1 候補につき 1 ファイル
    - ファイル名: `YYYY-MM-DD-{topic-slug}.md`
    - 観測元（Issue/PR 番号）は「根拠」セクションに記載
    - 元テキストのコンテキストも「根拠」セクションに含める

5b. **実行前同期（git pull）**:
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

6b. **.agentdev/intake 変更の commit と push**:
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

8. **完了報告** → `agentdev-workflow-reporting` の完了報告variantに従って出力。variant: completion-reports/intake-from-github/standard.md。git 永続化結果（変更有無・ファイル一覧・commit hash・push 成否）を含める

## Error Handling

| エラー | 対処 |
|--------|------|
| git pull --ff-only 失敗 | 構造化エラーメッセージを表示して停止。自動解消しない |
| git push 失敗 | 構造化エラーメッセージを表示。完了扱いにしない |

## Guardrails

### 責務境界（REQ-0103）
- G01: GitHub Issue の作成を行わない（`case-open` が担当）
- G02: 採用可否の判断を行わない（`intake-review` が担当）
- G03: review・整形・分類の判断を行わない（後続コマンドの責務）
- G04: Issue/PR へのコメント投稿・マーカー付与は行わない（`backlog-save` が担当）

### 形式制約（REQ-0103〜039）
- G05: workflow 管理 artifact として扱わない（REQ-0103）
- G06: frontmatter・状態値・重複排除キー・後続 artifact 参照を必須にしない（REQ-0103, REQ-0103）
- G07: 特定セクションを必須セクションとして扱わない（REQ-0103）
- G08: review 結果を item に書き込まない（REQ-0103）

### 実行制約
- G09: GitHub Issue/PR のデータ取得は `gh` CLI のみ使用（GitHub API 直接呼び出し不可）
- G10: 対象はクローズ済み Issue/PR のみ（オープン中は対象外）
- G11: `agentdev-gh-cli` に従って読み取り操作を実行する
- G12: 保存先は `.agentdev/intake/inbox/` のみ
- G13: サブエージェントの最終出力は verbatim で出力する（再フォーマット禁止）
