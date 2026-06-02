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

| コマンド | 用途 | 完了報告variant |
|----------|------|----------------|
| req-define | 要件の壁打ち・整理 | `completion-reports/req-define/`（3 variants） |
| req-save | 壁打ち成果物をREQ/ADRファイルとして保存 | `completion-reports/req-save/`（5 variants） |
| case-open | REQファイルからGitHub Issue作成 | `completion-reports/case-open/`（2 variants） |
| case-run | 計画立案から実装・コミット・PR作成まで一括実行 | `completion-reports/case-run/`（1 variant） |
| case-run (Epic Orchestrator) | Epic Issueを入力としたWave順次実行 | `completion-reports/case-run-epic/`（3 variants） |
| case-update | Issue本文の更新やコメント追加 | `completion-reports/case-update/`（4 variants） |
| case-close | PRマージ・記録追記・Issueクローズ・ブランチ削除 | `completion-reports/case-close/`（3 variants） |
| intake-capture | 手動で気づき・課題を inbox.md に記録 | `completion-reports/intake-capture/`（1 variant） |
| intake-from-github | クローズ済みissue/PRから残課題を抽出・分類しdraftとして保存 | `completion-reports/intake-from-github/`（1 variant） |
| intake-review | inbox の未処理エントリを一括レビューし処分判定 | `completion-reports/intake-review/`（1 variant） |
| intake-promote | review 済み intake item を後続コマンド用 artifact に整形 | `completion-reports/intake-promote/`（1 variant） |
| backlog-review | promoted artifact の分析・HITL・review draft保存 | `completion-reports/backlog-review/`（3 variants） |
| backlog-save | review draft から RU を生成・git永続化 | `completion-reports/backlog-save/`（3 variants） |
| learning-refine | 問題クラス分類→8軸評価→archive移動 | `completion-reports/learning-refine/`（1 variant） |
| learning-promote | 昇華判定→Requirement Source staging stub生成 | `completion-reports/learning-promote/`（1 variant） |
| integrity-check | ドキュメント・スキル・コマンドの整合性を検証 | `completion-reports/integrity-check/`（1 variant） |
| req-restructure-review | REQ体系の健全性を診断し再構成アクションを提示 | `completion-reports/req-restructure-review/`（1 variant） |

## references/ 構成一覧

| ファイル | 内容 |
|----------|------|
| completion-reports.md | 完了報告variantのregistry/index（共通ルール・必須フィールド定義・variant一覧テーブル） |
| completion-reports/{command}/ | 各コマンドの完了報告variantファイル（各variantが最終出力全文を保持） |
| checkbox-updates.md | チェックボックス更新ルール |
| subagent-output.md | サブエージェント出力ポリシー |

## レビュー観点: 完了報告フォーマット適合性

完了報告フォーマットの違反を検出するためのレビュー観点。レビュー時（`/review-work`）や乖離検出（`agentdev-spec-compliance`）時に参照する。

### 検出項目

| 観点 | 違反条件 |
|------|----------|
| フォーマット適合 | 選択したvariantファイルと一致しない完了報告を出力している |
| インラインコードブロック残存 | コマンド定義ファイル内に完了報告のインラインコードブロックが残存している |
| 次のコマンドの欠落 | variantに次コマンドが定義されているコマンドで `次のコマンド` が出力されていない |
| 汎用締め文の使用 | 禁止された汎用締め文（「次にやるべきことがあれば…」等）を使用している |
| load_skills 欠落 | 完了報告を参照するコマンドの `load_skills` に `agentdev-workflow-reporting` が含まれていない |
| 共通必須フィールド | 完了報告に `完了コマンド`・`対象`・`結果`・`検証結果`・`git 永続化`・`次のコマンド` のいずれかが欠落している |
| 完了報告の最終表示 | 完了報告の後に追加出力（Todo一覧・Step別ログ・補足説明等）が存在する |
| Todo 最終出力禁止 | 完了報告の後に Todo 一覧を出力している |
| 終端コマンドの次のコマンド | `case-close`・`integrity-check` 等の終端コマンドで `次のコマンド: なし` 以外を出力している |

## See Also

- [agentdev-workflow-lifecycle](../agentdev-workflow-lifecycle/SKILL.md) — フェーズ定義・パターン判定基準
- [agentdev-workflow-routing](../agentdev-workflow-routing/SKILL.md) — レビューNG時の対応フロー
- [agentdev-workflow-orchestration](../agentdev-workflow-orchestration/SKILL.md) — Epic Orchestrator モード定義・Wave実行フロー
- [agentdev-req-analysis](../agentdev-req-analysis/SKILL.md) — 要件分析手法と品質基準
- [agentdev-adr-guidelines](../agentdev-adr-guidelines/SKILL.md) — ADR要否評価基準
- [agentdev-spec-compliance](../agentdev-spec-compliance/SKILL.md) — 実装と要件の乖離検出
- **agentdev-no-ai-slop-writing**: 自然言語成果物の文章品質ゲート（AI-slop 検出・修正）