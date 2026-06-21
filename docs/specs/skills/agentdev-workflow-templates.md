---
title: agentdev-workflow-templates SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# agentdev-workflow-templates SPEC

## 目的

agentdev 系コマンドで使用する Issue/PR 本文・コメントテンプレートの管理・選定ルール・セクション規約を提供する。

## 適用対象

- Issue/PR/コメント用テンプレートを選定する場合
- テンプレートのファイルパスを取得する場合
- テンプレートのセクション構造・規約を確認する場合

## 提供する判断・操作

- Issue 本文テンプレート（feature / bug / epic / child / backlog_child / backlog_epic）
- コメントテンプレート（bug_analysis / feature_technical / update / review_ng / feature_implementation / bug_record）
- PR 本文テンプレート（`## Findings / Capture候補`・`## SPEC確定候補` セクション含む）
- テンプレート選定ルール（work_type・Issue 種別・フロー種別）
- セクション規約（`<!-- 【必須】 -->`・`<!-- 【任意】 -->` マーカー）

## 参照する references

- `templates/issue_desc_feature.md`
- `templates/issue_desc_bug.md`
- `templates/issue_desc_epic.md`
- `templates/issue_desc_child.md`
- `templates/issue_desc_backlog_child.md`
- `templates/issue_desc_backlog_epic.md`
- `templates/issue_comment_bug_analysis.md`
- `templates/issue_comment_feature_technical.md`
- `templates/issue_comment_update.md`
- `templates/issue_comment_review_ng.md`
- `templates/issue_comment_feature_implementation.md`
- `templates/issue_comment_bug_record.md`
- `templates/pr_desc.md`

## 現在の動作

- テンプレートは Read tool で読み込み、変数部分を置換して使用
- `<!-- 【必須】 -->` マーカー付きセクションは省略不可
- `<!-- 【任意】 -->` マーカー付きセクションは省略可能
- 変数に該当するデータがない場合は「該当なし」と記載

## 対象外

- ワークフローのフェーズ定義や遷移ロジック（`agentdev-workflow-lifecycle` 担当）
- パターン分類や判定基準（`agentdev-workflow-lifecycle` 担当）
- 要件分析手法や品質基準（`agentdev-req-analysis` 担当）

## 検証観点

- テンプレートの構造を維持しているか
- `<!-- 【必須】 -->` マーカー付きセクションを省略していないか
- 変数に該当するデータがない場合は「該当なし」と記載しているか

## See Also

- [agentdev-workflow-lifecycle.md](agentdev-workflow-lifecycle.md)
- [agentdev-issue-management.md](agentdev-issue-management.md)
- [commands/case-open.md](../commands/case-open.md)
- [commands/case-close.md](../commands/case-close.md)
