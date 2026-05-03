---
description: PRをマージし、対応記録を追記し、Issueをクローズしてブランチを削除する
load_skills:
  - decision-log
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
- `decisions/` の `implemented_by` 更新

## Steps

1. 前提確認: チェックボックス全完了確認、PR存在確認
2. docs/ 検証（パターンBの場合）:
   - `docs/requirements/REQ-NNNN.md` が作成済みであることを確認
   - `docs/design/{issue番号}/HLD.md`, `LLD.md` が作成済みであることを確認
   - `docs/design/specifications.md` または `docs/design/implementation-guide.md` が更新されていることを確認
   - ADRが必要な判断があった場合、`docs/adr/` にADRが作成されていることを確認
   - `docs/README.md` ドキュメントハブに新規エントリが含まれていることを確認
   - 不足がある場合: 警告を表示してユーザーの判断を仰ぐ
3. PRマージ（`gh pr merge`）→ 対応記録をIssueにコメント追記 → テンプレート: `templates/issue_comment_feature_implementation.md` or `templates/issue_comment_bug_record.md`
4. 決定エントリのstatusを `implemented` に更新 → `decision-log` のライフサイクルに従って `implemented_by` にPR番号を記録
5. Issueクローズ（`gh issue close --reason completed`）→ ブランチ・worktree削除
6. `decisions/index.md` を更新 → テンプレート: `templates/doc_decision_index.md`
7. 完了報告 → `issue-guide` の完了報告フォーマット

## Guardrails

- PRのCIが通っていることを確認（`gh pr checks`）
- 未完了チェックボックスがある場合はエラー停止
- 未マージPRはクローズしない
- 決定エントリの最終更新（implemented）を忘れない
- `gh-cli-best-practices` に従って `--body-file` 使用
- パターンBで docs/ 更新がない場合、警告を表示して停止確認
- Issue番号省略は同一セッション内で作成済みの場合のみ
