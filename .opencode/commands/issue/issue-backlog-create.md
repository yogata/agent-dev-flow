---
description: 承認済みバックログdraftからEpic+子Issueを作成し、抽出元にマークコメントを投稿する
agent: sisyphus
load_skills:
  - issue-lifecycle
  - issue-reporting
  - gh-cli-best-practices
---

# バックログIssue作成

承認済みバックログdraft（`.sisyphus/drafts/backlog-draft-{period-slug}.md`）を読み込み、Epic Issue + 子Issue群を作成し、抽出元issue/PRに `backlog-extracted` コメントを投稿する。`issue-backlog` の後続コマンド。

## Input

- 省略可能な `period-slug` 引数（明示的なdraft指定用）

## Output

- Epic Issue（サマリー + テーブル）
- 子Issue群（Epic配下）
- `backlog-extracted` コメント（抽出元issue/PR）

## Steps

1. **Draft検出**: 引数の有無に応じてdraftを特定する:
   - 引数なし + 承認済みdraft（`status: approved`）が1件 → 自動検出して次Stepへ進む
   - 引数なし + 承認済みdraftが0件 → エラー停止: `承認済み backlog draft が存在しません。issue-backlog で抽出・承認してください。`
   - 引数なし + 承認済みdraftが2件以上 → 候補一覧を表示して停止: `承認済み draft が複数あります。対象を指定してください: {候補一覧}`
   - 引数あり → 指定された `period-slug` に対応する `.sisyphus/drafts/backlog-draft-{period-slug}.md` を読み込む

   draftの検索方法: `.sisyphus/drafts/backlog-draft-*.md` のファイル一覧を取得し、各ファイルのfrontmatter `status` を確認する。

2. **Draft検証**: 読み込んだdraftの `status` を確認する:
   - `status: draft` → エラー停止: `指定された draft は未承認です。issue-backlog で承認してください。`
   - `status: issued` → エラー停止: `指定された draft は既に処理済みです。`
   - `status: approved` → 次Stepへ進む

3. **Draft読み込み**: draftファイルの内容をパースする:
   - frontmatter: period, period-slug, sources
   - カテゴリ別抽出項目: タイトル、説明、カテゴリ、優先度、元テキスト、元issue/PR、解消チェック結果

4. **解消済み項目の除外**: 解消チェック結果が `解消済み` の項目をIssue作成対象から除外する（draft内で既にマークされている）。

5. **Epic Issue作成**: `issue_desc_backlog_epic.md` テンプレートを適用してEpic Issueを作成する:
   - テンプレート: `.opencode/commands/issue/templates/issue_desc_backlog_epic.md`
   - テンプレート変数を分類結果で置換して本文を生成
   **テンプレート準拠要件**: テンプレートの `【必須】` セクションが全てEpic Issue本文に含まれること。必須セクションが欠落している場合、生成をやり直すこと。
   - タイトル: `バックログ: {期間} の残課題（{N}件）`
   - ラベル: `enhancement`, `epic`
   - `gh-cli-best-practices` に従って `--body-file` で作成
   - `gh-cli-best-practices` の VERIFY操作（書き込み内容検証）を実行すること

6. **子Issue作成**: 各残課題（解消済み以外）をEpic配下の子Issueとして作成する:
   - テンプレート: `.opencode/commands/issue/templates/issue_desc_backlog_child.md`
   - テンプレート変数を各残課題の内容で置換して本文を生成
   **テンプレート準拠要件**: テンプレートの `【必須】` セクションが全て子Issue本文に含まれること。必須セクションが欠落している場合、生成をやり直すこと。
   - `Parent: #{epic_number}` でEpicとの親子関係を記載
   - ラベル: `enhancement`
   - `gh-cli-best-practices` に従って `--body-file` で作成
   - `gh-cli-best-practices` の VERIFY操作（書き込み内容検証）を実行すること

7. **Epic更新**: 全子Issue作成後、Epic Issue本文の子Issueリンク（Issue番号）を実際のIssue番号で更新する:
   - `gh-cli-best-practices` に従って `--body-file` で更新
   - テンプレートの `【必須】` セクションが維持されていることを確認

8. **`backlog-extracted` コメント投稿**: 抽出元の各issue/PRに「バックログ抽出済み」コメントを投稿する:
   - コメントフォーマット:
     ```
     📋 **バックログ抽出済み**（backlog-extracted）
     - 抽出日: {YYYY-MM-DD}
     - Epic: #{Epic番号}
     - 子Issue: #{子1}, #{子2}, ...
     ```
   - `gh-cli-best-practices` に従って `--body-file` で投稿: `gh issue comment {N} --body-file ...` / `gh pr comment {N} --body-file ...`
   - コメント投稿に失敗した場合でもEpic + 子Issue作成は成功扱いとし、失敗したissue/PR番号を完了報告に含める

9. **Draft状態更新**: draftファイルの `status` を `approved` から `issued` に更新する。

10. **完了報告** → `issue-reporting` の完了報告フォーマットに従って出力:
    ```
    ✅ バックログIssue作成が完了しました。
      対象期間: {since} 〜 {until}
      Epic Issue: #{N}
      子Issue数: {M}件
      ⚠️ コメント投稿失敗: #{失敗1}, #{失敗2}, ...（失敗がない場合はこの行は表示しない）
      Draft状態: issued
    ```

## Guardrails

- ①バイブス壁打ちフェーズのショートカット経路（実装コード禁止）
- `gh-cli-best-practices` に従って `--body-file` 使用（`--body` 直接指定禁止）
- データ取得は `gh` CLIのみ使用（GitHub API直接呼び出し不可）
- コメント投稿失敗時もEpic + 子Issue作成は成功扱いとし、失敗番号を完了報告に含める
- テンプレートの【必須】セクションが全てIssue本文に含まれていることを確認してからgh issue createを実行すること。欠落セクションがある場合は再生成すること
- サブエージェントの最終出力はverbatimで出力する（再フォーマット禁止）
- Pattern分岐の判定基準と固有ルールは `issue-lifecycle` → Pattern Registry を参照
- vibe禁止: ユーザーへの確認なくIssue作成を実行しない（draft承認が前提）
