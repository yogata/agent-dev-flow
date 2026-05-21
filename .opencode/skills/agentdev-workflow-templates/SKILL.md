---
name: agentdev-workflow-templates
description: Manages Issue/PR description and comment templates, selection rules, and section conventions for the issue-* command pipeline. USE FOR: determining which template to use for a given situation, reading template files, or understanding template section structure. DO NOT USE FOR: workflow phase definitions, requirement analysis, or architecture decisions.
---

# Issue Template Manager スキル

issue-*系コマンドで使用するIssue/PR本文・コメントテンプレートの管理・選定ルール・セクション規約を提供する。

- **知識ベース**: テンプレート本体、選定ルール、セクション規約
- **参照先**: issue-*コマンドから直接参照される
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
- 完了報告フォーマットやチェックボックス更新（→ agentdev-workflow-reporting）

## テンプレート一覧

### Issue本文テンプレート

| テンプレート | 用途 | 対象コマンド | Pattern |
|---|---|---|---|
| `issue_desc_feature.md` | 機能追加・変更 | issue-create | B |
| `issue_desc_bug.md` | バグ修正 | issue-create | A |
| `issue_desc_epic.md` | Epic Issue本文 | issue-create (Epic flow) | B (Epic) |
| `issue_desc_child.md` | 子Issue本文 | issue-create (Epic flow) | B (Epic) |
| `issue_desc_backlog_epic.md` | バックログEpic | issue-backlog-create | D |
| `issue_desc_backlog_child.md` | バックログ子Issue | issue-backlog-create | D |

### コメントテンプレート

| テンプレート | 用途 | 対象コマンド | タイミング |
|---|---|---|---|
| `issue_comment_bug_analysis.md` | バグ分析結果 | issue-create | Issue作成後コメント (バグ修正・軽微変更/リファクタリング・保守作業/ドキュメント・雑務) |
| `issue_comment_feature_technical.md` | 技術検討結果 | issue-create | Issue作成後コメント (機能追加) |
| `issue_comment_update.md` | 進捗更新 | issue-update | Issue更新時コメント |
| `issue_comment_review_ng.md` | レビューNG記録 | issue-update | レビューNG時コメント |
| `issue_comment_feature_implementation.md` | 実装記録 | issue-close | PRマージ後コメント (機能追加) |
| `issue_comment_bug_record.md` | 対応記録 | issue-close | PRマージ後コメント (バグ修正・軽微変更/リファクタリング・保守作業/ドキュメント・雑務) |

### PR本文テンプレート

| テンプレート | 用途 | 対象コマンド |
|---|---|---|
| `pr_desc.md` | PR本文 | issue-work |

### テンプレートパス

テンプレートファイルは以下のパスに配置される:

```
.opencode/skills/agentdev-workflow-templates/templates/
```

## 選定ルール

### Issue作成時のテンプレート選定（issue-create）

| 条件 | 本文テンプレート | コメントテンプレート |
|------|-----------------|---------------------|
| バグ修正・軽微変更（Pattern A） | `issue_desc_bug.md` | `issue_comment_bug_analysis.md` |
| 機能追加（Pattern B） | `issue_desc_feature.md` | `issue_comment_feature_technical.md` |
| リファクタリング・保守作業（Pattern C） | `issue_desc_feature.md` | `issue_comment_bug_analysis.md` |
| ドキュメント・雑務（Pattern D） | `issue_desc_feature.md` | `issue_comment_bug_analysis.md` |
| Epic flow | `issue_desc_epic.md` | Patternに準拠 |

### Issueクローズ時のテンプレート選定（issue-close）

| 条件 | コメントテンプレート |
|------|---------------------|
| 機能追加（Pattern B） | `issue_comment_feature_implementation.md` |
| その他（Pattern A/C/D） | `issue_comment_bug_record.md` |

### バックログ作成時のテンプレート選定（issue-backlog-create）

| 条件 | テンプレート |
|------|-------------|
| Epic Issue | `issue_desc_backlog_epic.md` |
| 子Issue | `issue_desc_backlog_child.md` |

## セクション規約

### 共通ルール

- テンプレートは Read tool で読み込み、変数部分を置換して使用する
- テンプレートの構造を維持する（セクションの削除・順序変更禁止）
- 変数に該当するデータがない場合、そのセクションに「該当なし」と記載する（セクションごと削除しない）
- セクション見出しは日本語で記述する（SHALL）
- `<!-- 【必須】 -->` マーカー付きセクションは省略不可
- `<!-- 【任意】 -->` マーカー付きセクションは省略可能

### 必須セクション検証

`agentdev-gh-cli` のVERIFY操作で使用する必須セクション検証は、`<!-- 【必須】 -->` マーカーに基づいて行う:

- `<!-- 【必須】 -->` が見出し行の直後にある場合、その見出しが必須セクション
- 検証対象は見出し行（`## ...`）の文字列一致

## テンプレート追加・更新規約

### 命名規則

ファイル種別に応じたプレフィクスで命名する:

| プレフィクス | 用途 |
|---|---|
| `issue_desc_` | Issue本文テンプレート |
| `issue_comment_` | コメントテンプレート |
| `pr_desc_` | PR本文テンプレート |

### テンプレート本体に含めるもの

- frontmatter（name, about, labels）
- セクション見出し（日本語）
- `<!-- 【必須】 -->` / `<!-- 【任意】 -->` マーカー
- 変数プレースホルダー（`{variable}` 形式）

### テンプレート本体に含めないもの

- gh操作のコマンド（`gh issue create` 等）
- 実行手順・分岐ロジック
- テンプレート選定ルール（本SKILL.mdに記載）

## See Also

- [agentdev-workflow-lifecycle](../agentdev-workflow-lifecycle/SKILL.md) — フェーズ定義・Pattern Registry
- [agentdev-workflow-reporting](../agentdev-workflow-reporting/SKILL.md) — 完了報告フォーマット・チェックボックス更新
- [agentdev-req-file-manager](../agentdev-req-file-manager/SKILL.md) — REQファイル管理（doc_requirement.md テンプレート）
- [agentdev-adr-file-manager](../agentdev-adr-file-manager/SKILL.md) — ADRファイル管理（doc_adr.md テンプレート）
- [agentdev-spec-compliance](../agentdev-spec-compliance/SKILL.md) — 乖離検出（report_spec_compliance.md テンプレート）
