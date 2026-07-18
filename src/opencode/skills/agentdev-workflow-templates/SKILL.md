---
name: agentdev-workflow-templates
description: Manages Issue/PR description and comment templates, selection rules, and section conventions for the agentdev command pipeline. USE FOR: determining which template to use for a given situation, reading template files, or understanding template section structure. DO NOT USE FOR: workflow phase definitions, requirement analysis, or architecture decisions.
---

# Issue テンプレート管理スキル

agentdev系コマンドで使用するIssue/PR本文、コメントテンプレートの管理、選定ルール、セクション規約を提供する。テンプレートは Read tool で読み込み、変数部分を置換して使用する。

## USE FOR

- Issue/PR/コメント用テンプレートを選定する場合
- テンプレートのファイルパスを取得する場合
- テンプレートのセクション構造、規約を確認する場合
- 新しいテンプレートの追加、既存テンプレートの更新規約を確認する場合

## DO NOT USE FOR

- ワークフローのフェーズ定義や遷移ロジック（→ `agentdev-workflow-lifecycle`）
- パターン分類や判定基準（→ `agentdev-workflow-lifecycle`）
- 要件分析手法や品質基準（→ `agentdev-req-analysis`）
- 完了報告フォーマットやチェックボックス更新

## テンプレート一覧

### Issue本文テンプレート

| テンプレート | 用途 | 対象コマンド | work_type |
|---|---|---|---|
| `issue_desc_feature.md` | 機能追加、変更 | case-open | feature |
| `issue_desc_bug.md` | バグ修正 | case-open | bugfix |
| `issue_desc_epic.md` | Epic Issue本文 | case-open | feature (Epic) |
| `issue_desc_child.md` | 子Issue本文 | case-open | feature (Epic) |

### コメントテンプレート

| テンプレート | 用途 | 対象コマンド | タイミング |
|---|---|---|---|
| `issue_comment_bug_analysis.md` | バグ分析結果 | case-open | Issue作成後コメント (バグ修正、軽微変更/リファクタリング、保守作業/ドキュメント、雑務) |
| `issue_comment_feature_technical.md` | 技術検討結果 | case-open | Issue作成後コメント (機能追加) |
| `issue_comment_update.md` | 進捗更新 | case-update | Issue更新時コメント |
| `issue_comment_review_ng.md` | レビューNG記録 | case-update | レビューNG時コメント |
| `issue_comment_feature_implementation.md` | 実装記録 | case-close | PRマージ後コメント (機能追加) |
| `issue_comment_bug_record.md` | 対応記録 | case-close | PRマージ後コメント (バグ修正、軽微変更/リファクタリング、保守作業/ドキュメント、雑務) |

### PR本文テンプレート

| テンプレート | 用途 | 対象コマンド |
|---|---|---|
| `pr_desc.md` | PR本文 | case-run |

### PR本文必須セクション（pr_desc.md）

| セクション | マーカー | 記述ルール | 該当なし時 |
|---|---|---|---|
| 概要 | 【必須】 | Issueの要約 | - |
| 実装内容 | 【必須】 | 実装内容の概要 | - |
| 完了条件 | 【必須】 | チェックボックス形式 | - |
| テスト結果 | 【必須】 | テスト結果の概要 | 「該当なし」 |
| 品質メトリクス | 【必須】 | テーブル形式（メトリクス/結果/基準/判定） | - |
| Findings/ Intake候補 | 【必須】 | case-run で発見した本筋外 Finding（intake候補、learning候補）を記録。各項目に発見元、内容、分類（intake/learning）を含める | 「該当なし」 |
| SPEC確定候補 | 【任意】 | case-run/ driver が実装時に発見した SPEC レベルの詳細（schema、enum、判定表、内部アルゴリズム等）。`Findings / Capture候補` とは別セクション。case-close Step 3 の SPEC 確定チェック入力となる | セクションごと省略 |

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
| Epic フロー | `issue_desc_epic.md` | work_type に応じて子Issueと同一ルール適用 |

### Issueクローズ時のテンプレート選定（case-close）

| 条件 | コメントテンプレート |
|------|---------------------|
| feature | `issue_comment_feature_implementation.md` |
| その他（non-feature (bugfix/maintenance/docs_chore)） | `issue_comment_bug_record.md` |

### Issue作成時のテンプレート選定（case-close）

### 共通ルール

- テンプレートは Read tool で読み込み、変数部分を置換して使用する
- 変数置換後の本文は直ちに `[System.IO.File]::WriteAllText`（UTF8Encoding($false)）により UTF-8 BOM なし LF 一時ファイル（`$env:TEMP/agentdev/gh-temp-{timestamp}.md` 等）へ保存し、`gh --body-file`/ `-F` で渡すこと。文字列変数での本文持ち回り、PowerShell の `Out-File`/ `Set-Content`/ `>` リダイレクトによる一時ファイル作成を禁止する（agentdev-gh-cli standard-procedures Section 1 準拠、REQ-0132-024）
- テンプレートの構造を維持する（セクションの削除、順序変更禁止）。Markdown 行構造（LF、セクション間空行、インデント）の byte 単位保持を含む（REQ-0132-025）
- 変数に該当するデータがない場合、そのセクションに「該当なし」と記載する（セクションごと削除しない）
- セクション見出しは日本語で記述する
- `<!-- 【必須】 -->` マーカー付きセクションは省略不可。ただし該当データがない場合は「該当なし」と記載し、セクション自体は残す
- `<!-- 【任意】 -->` マーカー付きセクションはセクションごと完全に省略可能

### 必須セクション検証

`agentdev-gh-cli` のVERIFY操作で使用する必須セクション検証は、`<!-- 【必須】 -->` マーカーに基づいて行う:

- `<!-- 【必須】 -->` が見出し行の直後にある場合、その見出しが必須セクション
- 検証対象は見出し行（`## ...`）の文字列一致

## 完了条件書き方ガイド

関数削除を要求する完了条件の書き方標準。
共用関数の包括的削除による破壊的変更を防止する（L-014、PR #1140 / #1139 Epic #1138 由来）。

- 関数削除を要求する完了条件は対象スコープ（例: 「from checkX」「IR-044 由来の context exemption」）を明記すること
- 関数名列挙による完全削除の代用を禁止する。共用関数、cross-cutting helper は複数 checker から参照される可能性があり、定義削除前に全使用箇所を確認すること
- 完了条件の checkbox は「対象スコープの明示」と「全使用箇所の確認証拠」を含むこと

## See Also

- [agentdev-req-file-manager](../agentdev-req-file-manager/SKILL.md)（REQファイル管理。doc_requirement.md テンプレート）
- [agentdev-adr-file-manager](../agentdev-adr-file-manager/SKILL.md)（ADRファイル管理。doc_adr.md テンプレート）
- **agentdev-doc-writing**: ADR/REQ/SPEC横断の文書品質査読ゲート（文書種別責務、要件性、文意品質、粒度）


