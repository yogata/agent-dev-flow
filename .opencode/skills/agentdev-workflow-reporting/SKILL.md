---
name: agentdev-workflow-reporting
description: Defines completion report formats, checkbox update rules, and sub-agent verbatim output policies for issue-* commands. USE FOR: generating command completion reports, updating Issue checkboxes, formatting sub-agent output, or applying report templates. DO NOT USE FOR: workflow phase definitions, pattern classification, or architecture decisions.
---

# Issue Completion Reporting スキル

issue-*系コマンドの完了報告フォーマット・チェックボックス更新ルール・サブエージェント出力ポリシーを提供する。

- **知識ベース**: 完了報告フォーマット、チェックボックス更新ルール、サブエージェント出力ポリシー
- **参照先**: issue-*コマンドおよびissue-nextから参照される
- **特性**: 宣言的定義のみを提供。手順・手続きは含まない
- **自明な質問の禁止**: エージェントが自律的に判断できることをユーザーに確認しない

## USE FOR

- issue-*系コマンドの完了報告フォーマットを適用する場合
- Issue本文のチェックボックスを更新する場合
- サブエージェントの出力をverbatimで表示する場合
- 完了報告のテキスト形式を統一する場合

## DO NOT USE FOR

- ワークフローのフェーズ定義や遷移ロジック（→ agentdev-workflow-lifecycle）
- パターン分類や判定基準（→ agentdev-workflow-lifecycle）
- レビューNG時の対応フローや次コマンド推論（→ agentdev-workflow-routing）
- 要件分析手法や品質基準（→ agentdev-req-analysis）
- アーキテクチャ決定のADR要否評価（→ agentdev-adr-guidelines）
- 実装と要件の乖離検出（→ agentdev-spec-compliance）

## 対象コマンド

| コマンド | 用途 | 完了報告フォーマット |
|----------|------|---------------------|
| issue-req | 要件の壁打ち・整理 | `completion-reports.md` → issue-req 完了時 |
| issue-save-req | 壁打ち成果物をREQ/ADRファイルとして保存 | `completion-reports.md` → issue-save-req 完了時 |
| issue-create | REQファイルからGitHub Issue作成 | `completion-reports.md` → issue-create 完了時 |
| issue-work | 計画立案から実装・コミット・PR作成まで一括実行 | `completion-reports.md` → issue-work 完了時 |
| issue-update | Issue本文の更新やコメント追加 | `completion-reports.md` → issue-update 完了時 |
| issue-close | PRマージ・記録追記・Issueクローズ・ブランチ削除 | `completion-reports.md` → issue-close 完了時 |
| issue-next | 現在の状態から次に実行すべきコマンドを推論 | なし |
| issue-backlog | クローズ済みissue/PRから残課題を抽出・分類しdraftとして保存 | `completion-reports.md` → issue-backlog 完了時 |
| issue-backlog-create | 承認済みバックログdraftからEpic+子Issueを作成 | `completion-reports.md` → issue-backlog-create 完了時 |

## reference/ 構成一覧

| ファイル | 内容 |
|----------|------|
| completion-reports.md | 各コマンドの完了報告フォーマット |
| checkbox-updates.md | チェックボックス更新ルール |
| subagent-output.md | サブエージェント出力ポリシー |

## See Also

- [agentdev-workflow-lifecycle](../agentdev-workflow-lifecycle/SKILL.md) — フェーズ定義・パターン判定基準
- [agentdev-workflow-routing](../agentdev-workflow-routing/SKILL.md) — レビューNG時の対応フロー
- [agentdev-req-analysis](../agentdev-req-analysis/SKILL.md) — 要件分析手法と品質基準
- [agentdev-adr-guidelines](../agentdev-adr-guidelines/SKILL.md) — ADR要否評価基準
- [agentdev-spec-compliance](../agentdev-spec-compliance/SKILL.md) — 実装と要件の乖離検出