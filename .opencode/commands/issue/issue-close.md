---
description: PRをマージし、対応記録を追記し、Issueをクローズしてブランチを削除する
agent: sisyphus
load_skills:
  - issue-guide
  - gh-cli-best-practices
  - git-worktree
---

# 完了処理

PRをマージし、Issueに記録を追記し、クローズ後にworktreeとブランチを削除する。③レビュー完了フェーズ。

## Input

- Issue番号
- PR番号（または自動検出）

## Output

- マージ済みPR
- クローズ済みIssue
- 削除済みブランチ・worktree

## Steps

1. Issue番号解決:
   - ユーザー入力からIssue番号を取得（指定されている場合はそれを使用）
   - 番号が省略された場合、セッション内会話から直近のIssue番号を検索（`issue-work` の完了報告、直前のIssue参照履歴等から抽出）
   - 複数のIssue番号が存在する場合は直近のものを優先し、ユーザーに確認（例: 「Issue #Nで完了処理を行います。よろしいですか？」）
   - 検出できない場合はユーザーに番号の指定を求めて停止
2. 前提確認: チェックボックス全完了確認、PR存在確認
3. docs/ 検証（パターンBの場合）:
   - `docs/requirements/REQ-NNNN-slug.md` が作成済みであることを確認
   - `docs/specs/system.md` または `docs/specs/patterns.md` が更新されていることを確認
   - ADRが必要な判断があった場合、`docs/adr/` にADRが作成されていることを確認
   - `docs/README.md` ドキュメントハブに新規エントリが含まれていることを確認
   - 不足がある場合: 警告を表示してユーザーの判断を仰ぐ
4. PRマージ（`gh pr merge`）→ 対応記録をIssueにコメント追記 → テンプレート: @.opencode/commands/issue/templates/issue_comment_feature_implementation.md or @.opencode/commands/issue/templates/issue_comment_bug_record.md
5. Issueクローズ（`gh issue close --reason completed`）→ ブランチ・worktree削除
6. 完了報告 → `issue-guide` の完了報告フォーマット

## Guardrails

- PRのCIが通っていることを確認（`gh pr checks`）
- 未完了チェックボックスがある場合はエラー停止
- 未マージPRはクローズしない
- `gh-cli-best-practices` に従って `--body-file` 使用
- パターンBで docs/ 更新がない場合、警告を表示して停止確認
- Issue番号省略は同一セッション内で作成済みの場合のみ
