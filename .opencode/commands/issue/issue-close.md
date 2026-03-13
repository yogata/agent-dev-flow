---
description: PRをマージし、対応記録を追記し、Issueをクローズしてブランチを削除する
---

# 完了処理

PRをマージし、GitHub Issueに記録を追記し、クローズ後にworktreeとブランチを削除します。

---

## 入力（SSoT）

- **GitHub Issue** — open状態
- **GitHub PR** — open状態

## 出力（SSoT）

- なし（完了）

## 完了後のフェーズ

`done` — 完了

---

## 前提

`@issue-workflow` スキルを実行し、以下を取得してください：

- パターン（A/B）判定
- 現在のフェーズ確認

## 引数

- `<Issue番号>` — 単一:`101` / 複数:`101,102,103` / 省略時は[省略可能条件]を参照

**【省略可能条件】**

Issue番号省略が可能なのは以下の場合のみ：

- 同一セッション内で `/issue-create` により Issue が作成されている
- かつ、その Issue 番号がセッションコンテキストに保持されている

**【禁止事項】**

以下の推測方法は明示的に禁止：

- `.worktrees` ディレクトリからの Issue 番号推測
- `git branch` からの Issue 番号推測
- `gh issue list` からの最新 Issue 取得
- その他、セッションコンテキスト以外からの推測

省略時かつ条件を満たさない場合、`ISSUE_NUMBER_REQUIRED` エラーで停止する。

## 手順

### 1. 前提確認

- **チェックボックス完了確認**: Issue本文に未完了の `- [ ]` が存在する場合 → `CHECKBOX_INCOMPLETE` エラーで停止
- **PR存在確認**: `gh pr list --head $(git branch --show-current) --state open`
- **PR状態遷移**:
  - DRAFT → Ready: `gh pr ready $PR_NUMBER`
  - MERGED → 手順3（PRマージ）をスキップ

### 2. docs/コミット（パターンBのみ）

- ステージング: `git add docs/requirements.md docs/specifications.md docs/implementation-guide.md docs/adr/`
- コミット: `git commit -m "docs(docs): update docs for #$ISSUE_NUMBER"`
- プッシュ: `git push origin HEAD`

### 3. PRマージ

PRマージ: `gh pr merge $PR_NUMBER --merge`

### 4. 記録追記

- **パターンA（小）** — `@.opencode/commands/issue/templates/issue_comment_bug_record.md`
- **パターンB（中）** — `@.opencode/commands/issue/templates/issue_comment_feature_implementation.md`

- テンプレートから記録を作成し、`temp/comment-body.md` に保存（日付等の変数を置換）
- コメント追加: `gh issue comment $ISSUE_NUMBER --body-file "temp/comment-body.md"`

### 5. Issueクローズ

Issueクローズ: `gh issue close $ISSUE_NUMBER --reason completed`

### 6. クリーンアップ

1. mainに切り替え: `git checkout main`
2. 最新を取得: `git pull`
3. worktree削除: `git worktree remove --force .worktrees/$ISSUE_NUMBER-<type>`
4. ローカルブランチ削除: `git branch -D <type>/issue-$ISSUE_NUMBER`
5. リモートブランチ削除: `git push origin --delete <type>/issue-$ISSUE_NUMBER`
6. prune: `git fetch --prune`

### 7. Planファイルのアーカイブ

`.sisyphus/archives` に plan、notepadsを含むファイル一式をアーカイブ

## 複数Issueの場合

各Issueに対して手順1〜5を実行後、まとめてクリーンアップ（手順6）を行います。

## 完了時

`@issue-workflow` スキルの「完了報告生成」を実行してください。

現在のコンテキスト:

- コマンド: issue-close
- Issue番号: {N}
- PR番号: {PR_N}
- パターン: {判定結果}
- 削除したworktree: {worktree名}
- 削除したブランチ: {ブランチ名}

## エラーハンドリング

`@issue-workflow` スキルのエラーハンドリングを参照してください。
