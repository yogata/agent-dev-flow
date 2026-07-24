---
title: `agentdev-workflow-templates` SPEC
status: accepted
created: 2026-06-21
updated: 2026-07-24
---

# `agentdev-workflow-templates` SPEC

## 目的

agentdev 系コマンドで使用する Issue/PR 本文、コメントテンプレートの管理、選定ルール、セクション規約を提供する。

## 適用対象

- Issue/PR/コメント用テンプレートを選定する場合
- テンプレートのファイルパスを取得する場合
- テンプレートのセクション構造、規約を確認する場合

## 提供する判断、操作

- Issue 本文テンプレート（feature / bug / epic / child / backlog_child / backlog_epic）
- コメントテンプレート（bug_analysis / feature_technical / update / review_ng / feature_implementation / bug_record）
- PR 本文テンプレート（`## Findings / Capture候補`、`## SPEC確定候補` セクション含む）
- テンプレート選定ルール（work_type、Issue 種別、フロー種別）
- セクション規約（`<!-- 【必須】 -->`、`<!-- 【任意】 -->` マーカー）

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
- 変数置換後の本文は直ちに `[System.IO.File]::WriteAllText`（UTF8Encoding($false)）により一時ファイル（`$env:TEMP/agentdev/gh-temp-{timestamp}.md` 等）へ保存し、`gh --body-file`/ `-F` で渡すこと。文字列変数での本文持ち回り、PowerShell の `Out-File`/ `Set-Content`/ `>` リダイレクトによる一時ファイル作成を禁止する（agentdev-gh-cli standard-procedures Section 1 準拠）
- テンプレートの構造を維持する（セクションの削除、順序変更禁止）。Markdown 行構造（LF、セクション間空行、インデント）の保持を含む
- `<!-- 【必須】 -->` マーカー付きセクションは省略不可
- `<!-- 【任意】 -->` マーカー付きセクションは省略可能
- 変数に該当するデータがない場合は「該当なし」と記載
- PR テンプレート（pr_desc.md）は verify-only PR の根拠欄を含む。根拠欄には種別 verify-only、実装差分を含まない理由、根拠成果物または commit、検証対象、検証結果を記入する。根拠は姉妹実装 PR だけでなく、実装 PR、先行 commit、main 反映済み commit、既存成果物、検証のみで完結する理由を許容する。case-run は verify-only PR 作成時に当該欄を埋め、case-close と QG-4 は当該欄を完了条件の証拠ソースとして読む（[case-run.md](../commands/case-run.md)「verification-only PR（実装差分なし、検証のみ）（REQ-0158-002）」、[case-close.md](../commands/case-close.md)「verification-only PR の files_checked 空確認（REQ-0158-002）」参照）

## review_dispositions 証跡セクション（AG-002、AG-005、AG-009、AG-011）

case-open が draft-data の `review_dispositions` を読み取り、Issue 本文の「レビュー判断」セクションへ恒久証跡として転記する。本 SPEC が当該セクションの構造を正規所有する（AG-002）。

### 対象テンプレート

| テンプレート | work_type | セクション内容 |
|---|---|---|
| `issue_desc_feature.md` | feature | 全 disposition 明細 |
| `issue_desc_bug.md` | bugfix | 全 disposition 明細 |
| `issue_desc_epic.md` | feature (Epic) | 全 disposition 明細 |
| `issue_desc_child.md` | feature (Epic child) | 親 Epic Issue 参照のみ（明細重複転記なし） |

### セクション仕様

「レビュー判断」セクションは `<!-- 【必須】 -->` マーカー付きの必須セクションとする。feature、bug、epic テンプレートでは転記対象 disposition がない場合「該当なし」と記載する。child テンプレートでは「該当なし」を使用せず、親 Epic Issue 参照のみを記載する。

各 disposition 明細は以下の要素を持つ:

| 要素 | 内容 |
|---|---|
| id | `RD-NNN` |
| disposition | `covered` / `partially_covered` / `rejected` / `not_applicable` / `superseded` / `stale_target` |
| reason_code | 判断理由のコード |
| reason | 人間可読の判断理由 |
| evidence.path | 根拠ファイルパス |
| evidence.section | 根拠セクション |
| evidence.checked_at_commit | 確認 commit SHA（case-open が再確認後に記録） |

### 配置規則

- feature、bug、epic テンプレート: 「テスト戦略」セクション（epic は「完了条件」セクション）の直後、「補足情報」セクションの前に配置する
- child テンプレート: 「テスト戦略」セクションの直後、「補足情報」セクションの前に配置する

### child 固定内容（AG-009）

child テンプレートの「レビュー判断」セクションは親 Epic Issue 参照のみを記載する。disposition 明細の重複転記は行わない。「該当なし」も使用しない。全 disposition は Epic Issue 本体へ転記済みである。

### 転記規則（AG-011）

転記規則の詳細は [case-open.md](../commands/case-open.md)「review_dispositions の消費と証跡転記」節参照。単一 Standard Issue は全 disposition を当該 Issue へ、Epic flow は Epic Issue へ全 disposition を、複数 Standard Issue は各 Issue の OU 関連 disposition を当該 Issue へ、ドラフト全体の disposition をルート Issue へ転記する。

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

