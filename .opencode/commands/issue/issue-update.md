---
description: 既存Issueの本文更新またはコメント追加を行う
load_skills:
  - issue-guide
  - gh-cli-best-practices
---

# Issue更新

既存Issueの本文更新またはコメント追加を行う。主にレビューNG時の対応に使用。

## Input

- Issue番号
- 更新内容（本文更新 or コメント追加）
- 更新種別（`--body` / `--comment`）

## Output

- 更新されたIssue本文 または 追加されたコメント

## Steps

1. 現在のIssue状態を取得 → `issue-guide` のフェーズ体系で現在フェーズを判定
2. 更新内容に応じて本文更新 or コメント追加:
   - 本文更新: テンプレートに従って更新 → `gh issue edit`
   - コメント追加: テンプレート `templates/pr_comment_fix.md` → `gh issue comment`
3. 完了報告 → `issue-guide` の完了報告フォーマットで結果出力

## Guardrails

- SSoTの整合性を維持（Issue本文と要件docの不整合を防ぐ）
- `gh-cli-best-practices` に従って `--body-file` 使用
- フェーズは変更なし（現在のフェーズを維持）
- 出力先: `$1` 引数で指定
