---
name: agentdev-workflow-templates
description: Manages Issue/PR description and comment templates, selection rules, and section conventions for the agentdev command pipeline. USE FOR: determining which template to use for a given situation, reading template files, or understanding template section structure. DO NOT USE FOR: workflow phase definitions, requirement analysis, or architecture decisions.
---

# Issue Template Manager スキル

agentdev系コマンドで使用するIssue/PR本文・コメントテンプレートの管理・選定ルール・セクション規約を提供する。

- **知識ベース**: テンプレート本体、選定ルール、セクション規約
- **参照先**: agentdevコマンドから直接参照される
- **特性**: テンプレートは Read tool で読み込み、変数部分を置換して使用する

## USE FOR

- Issue/PR/コメント用テンプレートを選定する場合
- テンプレートのファイルパスを取得する場合
- テンプレートのセクション構造・規約を確認する場合
- 新しいテンプレートの追加・既存テンプレートの更新規約を確認する場合

## DO NOT USE FOR

- ワークフローのフェーズ定義や遷移ロジック（→ agentdev-workflow-lifecycle）
- パターン分類や判定基準（→ agentdev-workflow-lifecycle）
- 要件分析手法や品質基準（→ agentdev-req-analysis）
- 完了報告フォーマットやチェックボックス更新

## テンプレート一覧

### Issue本文テンプレート

| テンプレート | 用途 | 対象コマンド | work_type |
|---|---|---|---|
| `issue_desc_feature.md` | 機能追加・変更 | case-open | feature |
| `issue_desc_bug.md` | バグ修正 | case-open | bugfix |
| `issue_desc_epic.md` | Epic Issue本文 | case-open | feature (Epic) |
| `issue_desc_child.md` | 子Issue本文 | case-open | feature (Epic) |

### コメントテンプレート

| テンプレート | 用途 | 対象コマンド | タイミング |
|---|---|---|---|
| `issue_comment_bug_analysis.md` | バグ分析結果 | case-open | Issue作成後コメント (バグ修正・軽微変更/リファクタリング・保守作業/ドキュメント・雑務) |
| `issue_comment_feature_technical.md` | 技術検討結果 | case-open | Issue作成後コメント (機能追加) |
| `issue_comment_update.md` | 進捗更新 | case-update | Issue更新時コメント |
| `issue_comment_review_ng.md` | レビューNG記録 | case-update | レビューNG時コメント |
| `issue_comment_feature_implementation.md` | 実装記録 | case-close | PRマージ後コメント (機能追加) |
| `issue_comment_bug_record.md` | 対応記録 | case-close | PRマージ後コメント (バグ修正・軽微変更/リファクタリング・保守作業/ドキュメント・雑務) |

### PR本文テンプレート

| テンプレート | 用途 | 対象コマンド |
|---|---|---|
| `pr_desc.md` | PR本文 | case-run |

### PR本文必須セクション（pr_desc.md）

| セクション | マーカー | 記述ルール | 該当なし時 |
|---|---|---|---|
| 概要 | 【必須】 | Issueの要約 | — |
| 実装内容 | 【必須】 | 実装内容の概要 | — |
| 完了条件 | 【必須】 | チェックボックス形式 | — |
| テスト結果 | 【必須】 | テスト結果の概要 | 「該当なし」 |
| 品質メトリクス | 【必須】 | テーブル形式（メトリクス/結果/基準/判定） | — |
| Findings / Intake候補 | 【必須】 | case-run で発見した本筋外 Finding（intake候補・learning候補）を記録。各項目に発見元・内容・分類（intake/learning）を含める | 「該当なし」 |

### テンプレートパス

テンプレートファイルは以下のパスに配置される:

```
.opencode/skills/agentdev-workflow-templates/templates/
```

## 選定ルール

### Issue作成時のテンプレート選定（case-open）

| 条件 | 本文テンプレート | コメントテンプレート |
|------|-----------------|---------------------|
| bugfix | `issue_desc_bug.md` | `issue_comment_bug_analysis.md` |
| feature | `issue_desc_feature.md` | `issue_comment_feature_technical.md` |
| maintenance | `issue_desc_feature.md` | `issue_comment_bug_analysis.md` |
| docs_chore | `issue_desc_feature.md` | `issue_comment_bug_analysis.md` |
| Epic flow | `issue_desc_epic.md` | work_type に応じて子Issueと同一ルール適用 |

### Issueクローズ時のテンプレート選定（case-close）

| 条件 | コメントテンプレート |
|------|---------------------|
| feature | `issue_comment_feature_implementation.md` |
| その他（non-feature (bugfix/maintenance/docs_chore)） | `issue_comment_bug_record.md` |

### Issue作成時のテンプレート選定（case-close）

### 共通ルール

- テンプレートは Read tool で読み込み、変数部分を置換して使用する
- テンプレートの構造を維持する（セクションの削除・順序変更禁止）
- 変数に該当するデータがない場合、そのセクションに「該当なし」と記載する（セクションごと削除しない）
- セクション見出しは日本語で記述する（SHALL）
- `<!-- 【必須】 -->` マーカー付きセクションは省略不可。ただし該当データがない場合は「該当なし」と記載し、セクション自体は残す
- `<!-- 【任意】 -->` マーカー付きセクションはセクションごと完全に省略可能

### 必須セクション検証

`agentdev-gh-cli` のVERIFY操作で使用する必須セクション検証は、`<!-- 【必須】 -->` マーカーに基づいて行う:

- `<!-- 【必須】 -->` が見出し行の直後にある場合、その見出しが必須セクション
- 検証対象は見出し行（`## ...`）の文字列一致

## See Also

- [agentdev-workflow-lifecycle](../agentdev-workflow-lifecycle/SKILL.md) — フェーズ定義・workflow classification
- [agentdev-req-file-manager](../agentdev-req-file-manager/SKILL.md) — REQファイル管理（doc_requirement.md テンプレート）
- [agentdev-adr-file-manager](../agentdev-adr-file-manager/SKILL.md) — ADRファイル管理（doc_adr.md テンプレート）
- [agentdev-spec-compliance](../agentdev-spec-compliance/SKILL.md) — 乖離検出（report_spec_compliance.md テンプレート）
- **agentdev-no-ai-slop-writing**: 自然言語成果物の文章品質ゲート（AI-slop 検出・修正）
