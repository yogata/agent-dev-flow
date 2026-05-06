---
description: 既存Issueの本文更新、コメント追加、またはREQファイル更新を行う
load_skills:
  - issue-guide
  - gh-cli-best-practices
  - req-file-manager
---

# Issue更新

既存Issueの本文更新、コメント追加、またはREQファイル更新を行う。主にレビューNG時の対応に使用。

## Input

- Issue番号
- 更新内容（本文更新 or コメント追加 or REQファイル更新）
- 更新種別（`--body` / `--comment` / `--req`）

## Output

- 更新されたIssue本文 または 追加されたコメント または 更新されたREQファイル

## Steps

1. 現在のIssue状態を取得 → `issue-guide` のフェーズ体系で現在フェーズを判定
2. 更新内容に応じて分岐:
   - 本文更新: テンプレートに従って更新 → `gh issue edit`
   - コメント追加: テンプレート `templates/issue_comment_update.md` → `gh issue comment`
   - REQファイル更新: `req-file-manager` スキルの判定ロジックでAPPEND/UPDATEを実行:
     - **APPEND**: 既存REQファイルに要件追記、frontmatter updated更新
     - **UPDATE**: 既存REQファイルの該当セクション更新、frontmatter updated更新
3. 完了報告 → `issue-guide` の完了報告フォーマットで結果出力

## Guardrails

- SSoTの整合性を維持（Issue本文と要件docの不整合を防ぐ）
- `gh-cli-best-practices` に従って `--body-file` 使用
- フェーズは変更なし（現在のフェーズを維持）
