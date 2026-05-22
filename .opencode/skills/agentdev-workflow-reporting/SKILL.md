---
name: agentdev-workflow-reporting
description: Defines completion report formats, checkbox update rules, and sub-agent verbatim output policies for agentdev commands. USE FOR: generating command completion reports, updating Issue checkboxes, formatting sub-agent output, or applying report templates. DO NOT USE FOR: workflow phase definitions, pattern classification, or architecture decisions.
---

# Issue Completion Reporting スキル

agentdev系コマンドの完了報告フォーマット・チェックボックス更新ルール・サブエージェント出力ポリシーを提供する。

- **知識ベース**: 完了報告フォーマット、チェックボックス更新ルール、サブエージェント出力ポリシー
- **参照先**: agentdevコマンドから参照される
- **特性**: 宣言的定義のみを提供。手順・手続きは含まない
- **自明な質問の禁止**: エージェントが自律的に判断できることをユーザーに確認しない

## USE FOR

- agentdev系コマンドの完了報告フォーマットを適用する場合
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
| req-define | 要件の壁打ち・整理 | `completion-reports.md` → req-define 完了時 |
| req-save | 壁打ち成果物をREQ/ADRファイルとして保存 | `completion-reports.md` → req-save 完了時 |
| case-open | REQファイルからGitHub Issue作成 | `completion-reports.md` → case-open 完了時 |
| case-run | 計画立案から実装・コミット・PR作成まで一括実行 | `completion-reports.md` → case-run 完了時 |
| case-run (Epic Orchestrator) | Epic Issueを入力としたWave順次実行 | `completion-reports.md` → Epic Orchestrator 集約完了報告 |
| case-update | Issue本文の更新やコメント追加 | `completion-reports.md` → case-update 完了時 |
| case-close | PRマージ・記録追記・Issueクローズ・ブランチ削除 | `completion-reports.md` → case-close 完了時 |
| intake-from-github | クローズ済みissue/PRから残課題を抽出・分類しdraftとして保存 | `completion-reports.md` → intake-from-github 完了時 |
| intake-open | 承認済みバックログdraftからEpic+子Issueを作成 | `completion-reports.md` → intake-open 完了時 |

## reference/ 構成一覧

| ファイル | 内容 |
|----------|------|
| completion-reports.md | 各コマンドの完了報告フォーマット（Epic Orchestrator 集約完了報告含む） |
| checkbox-updates.md | チェックボックス更新ルール |
| subagent-output.md | サブエージェント出力ポリシー |

## See Also

- [agentdev-workflow-lifecycle](../agentdev-workflow-lifecycle/SKILL.md) — フェーズ定義・パターン判定基準
- [agentdev-workflow-routing](../agentdev-workflow-routing/SKILL.md) — レビューNG時の対応フロー
- [agentdev-workflow-orchestration](../agentdev-workflow-orchestration/SKILL.md) — Epic Orchestrator モード定義・Wave実行フロー
- [agentdev-req-analysis](../agentdev-req-analysis/SKILL.md) — 要件分析手法と品質基準
- [agentdev-adr-guidelines](../agentdev-adr-guidelines/SKILL.md) — ADR要否評価基準
- [agentdev-spec-compliance](../agentdev-spec-compliance/SKILL.md) — 実装と要件の乖離検出