---
name: issue-reporting
description: Defines completion report formats, checkbox update rules, and sub-agent verbatim output policies for issue-* commands. USE FOR: generating command completion reports, updating Issue checkboxes, formatting sub-agent output, or applying report templates. DO NOT USE FOR: workflow phase definitions, pattern classification, or architecture decisions.
---

# Issue Reporting スキル

issue-*系コマンドの完了報告フォーマット・チェックボックス更新ルール・サブエージェント出力ポリシーを提供する。

- **知識ベース**: 完了報告フォーマット、チェックボックス更新ルール、サブエージェント出力ポリシー
- **参照先**: issue-*コマンドおよびissue-nextから参照される
- **特性**: 宣言的定義のみを提供。手順・手続きは含まない
- **自明な質問の禁止**: エージェントが自律的に判断できることをユーザーに確認しない

## USE FOR

- issue-*系コマンドの完了報告フォーマットを適用する場合
- Issue本文のチェックボックスを更新する場合
- サブエージェントの出力をverbatimで表示する場合
- テンプレートを使用してIssue本文やコメントを生成する場合
- 完了報告のテキスト形式を統一する場合

## DO NOT USE FOR

- ワークフローのフェーズ定義や遷移ロジック（→ issue-lifecycle）
- パターン分類や判定基準（→ issue-lifecycle）
- レビューNG時の対応フローや次コマンド推論（→ issue-review-routing）
- 要件分析手法や品質基準（→ req-analysis）
- アーキテクチャ決定のADR要否評価（→ adr-guidelines）
- 実装と要件の乖離検出（→ spec-compliance）

## 対象コマンド

| コマンド | 用途 |
|----------|------|
| issue-req | 要件の壁打ち・整理 |
| issue-save-req | 壁打ち成果物をREQ/ADRファイルとして保存 |
| issue-create | REQファイルからGitHub Issue作成 |
| issue-work | 計画立案から実装・コミット・PR作成まで一括実行 |
| issue-update | Issue本文の更新やコメント追加 |
| issue-close | PRマージ・記録追記・Issueクローズ・ブランチ削除 |
| issue-next | 現在の状態から次に実行すべきコマンドを推論 |
| issue-backlog | クローズ済みissue/PRから残課題を抽出・分類しdraftとして保存 |
| issue-backlog-create | 承認済みバックログdraftからEpic+子Issueを作成 |

## reference/ 構成一覧

| ファイル | 内容 |
|----------|------|
| completion-reports.md | 各コマンドの完了報告フォーマット |
| checkbox-updates.md | チェックボックス更新ルール |
| subagent-output.md | サブエージェント出力ポリシー |
| templates.md | テンプレート使用ガイド |

## See Also

- [issue-lifecycle](../issue-lifecycle/SKILL.md) — フェーズ定義・パターン判定基準
- [issue-review-routing](../issue-review-routing/SKILL.md) — レビューNG時の対応フロー
- [req-analysis](../req-analysis/SKILL.md) — 要件分析手法と品質基準
- [adr-guidelines](../adr-guidelines/SKILL.md) — ADR要否評価基準
- [spec-compliance](../spec-compliance/SKILL.md) — 実装と要件の乖離検出