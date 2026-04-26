---
description: 既存Issueの本文更新またはコメント追加を行う
---

# Issue更新

既存のIssueに対して、本文の更新またはコメントの追加を行います。主にレビューNG時の「仕様バグ」「実装バグ」対応に使用します。

---

## 入力（SSoT）

- **GitHub Issue/PR** — 現在の状態

## 出力（SSoT）

- **GitHub Issue/PR** — 更新後の状態

## 完了後のフェーズ

変更なし（現在のフェーズを維持）

---

## 引数

- `<Issue番号>` — 単一:`101` / 複数:`101,102,103` / 省略時は直前のIssue

## オプション

- `--body` — Issue本文を更新（デフォルト）
- `--comment` — Issueにコメントを追加

## 手順

### A. Issue本文の更新（仕様バグ対応）

1. Issue確認: `gh issue view $ISSUE_NUMBER`
2. 更新内容の整理: 追加・修正が必要な要件、変更理由
3. Issue本文更新: `gh issue edit $ISSUE_NUMBER --body-file "temp/issue-body.md"`

### B. Issueへのコメント追加（実装バグ対応）

1. Issue確認: `gh issue view $ISSUE_NUMBER`
2. コメント内容の整理: 問題点、期待される動作、修正方針
3. コメント追加 — テンプレート: `@.opencode/commands/issue/templates/pr_comment_fix.md`
   - テンプレートから作成し、`temp/comment-body.md` に保存
   - コメント追加: `gh issue comment $ISSUE_NUMBER --body-file "temp/comment-body.md"`

## 完了検証

以下を確認し、すべて完了していることを確認する:

- **検証失敗時**: 複数の手順を詳細に記録し、原因を特定して再実行する

---

## 完了時

`issue-guide` スキルの「完了報告生成」と「次のステップ提案」を実行してください。

現在のコンテキスト:

- コマンド: issue-update
- Issue番号: {N}
- 更新種別: {body/comment}

## エラーハンドリング

`issue-guide` スキルのエラーハンドリングを参照してください。
