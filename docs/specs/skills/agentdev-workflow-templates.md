---
title: `agentdev-workflow-templates` SPEC
status: accepted
created: 2026-06-21
updated: 2026-07-27
---

# `agentdev-workflow-templates` SPEC

## 目的

agentdev 系コマンドで使用する Issue/PR 本文、コメントテンプレートの管理、選定ルール、セクション規約を提供する。

## 適用対象

- Issue/PR/コメント用テンプレートを選定する場合
- テンプレートのファイルパスを取得する場合
- テンプレートのセクション構造、規約を確認する場合

## 提供する判断、操作

- Issue 本文テンプレート（feature / bug / epic / child）
- コメントテンプレート（bug_analysis / feature_technical / update / review_ng / feature_implementation / bug_record）
- PR 本文テンプレート（`## Findings / Capture候補`、`## SPEC確定候補` セクション含む）
- テンプレート選定ルール（work_type、Issue 種別、フロー種別）
- セクション規約（`<!-- 【必須】 -->`、`<!-- 【任意】 -->` マーカー）

## 参照する references

- `templates/issue_desc_feature.md`
- `templates/issue_desc_bug.md`
- `templates/issue_desc_epic.md`
- `templates/issue_desc_child.md`
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
- PR テンプレート（pr_desc.md）は verify-only PR の根拠欄を含む。根拠欄には種別 verify-only、実装差分を含まない理由、根拠成果物または commit、検証対象、検証結果を記入する。根拠は姉妹実装 PR だけでなく、実装 PR、先行 commit、main 反映済み commit、既存成果物、検証のみで完結する理由を許容する。case-run は verify-only PR 作成時に当該欄を埋め、case-close と QG-4 は当該欄を完了条件の証拠ソースとして読む（[case-run.md](../commands/case-run.md)「verification-only PR（実装差分なし、検証のみ）（v2:REQ-0158-002）」、[case-close.md](../commands/case-close.md)「verification-only PR の files_checked 空確認（v2:REQ-0158-002）」参照）

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

## test strategy 記述ガイドライン（AG-006）

issue_desc_*.md テンプレートの「テスト戦略」セクションに記述する pass_criteria は QG-4 評価で REQ content と照合される。記述品質のばらつきが QG-4 時に顕在化するため、以下を共通ガイドラインとして正規所有する。

### 共通 pass_criteria のリスクと REQ 個別期待値推奨

複数 REQ へまたがる共通の pass_criteria を起票する場合、各 REQ の pipeline stage（promote 系、review 系等）の違いを吸収せず、単一の文字列一致を要求すると QG-4 評価時に REQ content と pass_criteria 期待値が食い違う。Issue #1760 QG-4 で REQ-0129-012 を含む完了条件が REQ content と文字列一致せず、意味合致評価で処理された実績がある。共通化は避け、REQ 単位の個別期待値を pass_criteria へ記述することを推奨する。

### 変更対象外 REQ 検証の正しい表現

「変更対象外 REQ の変更がないこと」を検証する場合は「存在しないこと」と書かず「diff がないこと」として表現する。実在する REQ を「存在しないこと」と記述すると検証意図と検証方法がずれる。Issue #1760 TS-003 で「REQ-0147-010 が存在しないこと」と誤表現し、REQ-0147-010 は存在する（変更なし）ため正しい検証意図は「変更されていないこと」だった。

### 存在確認の使用条件

「存在しないこと」は新規作成禁止（例: 「REQ-0164 が存在しないこと」等の未作成確認）の場合のみ使用する。既存 REQ への変更有無の検証には使用しない。

### テンプレートへのガイド反映

feature、bug、child の各 issue_desc テンプレートは「テスト戦略」セクションへ本ガイドラインの要点を HTML コメントとして埋め込む。起票者が pass_criteria を記述する際に参照できるようにする。epic テンプレートは「テスト戦略」セクションを持たないため対象外とする。

## execution contract セクション（Issue template 拡張）

feature Issue、child Issue テンプレートに execution contract セクションを追加する。
このセクションの存在が presence-based 判定の識別子となる（AG-012、REQ-017-014）。

### 追加セクション構成

Issue 本文に次のセクションを必須とする（新規作成時）。

```markdown
## Execution Contract

### 変更対象成果物
- （artifact type と対象パスのリスト）

### 必須品質統制
- （artifact-quality-control-routing SPEC に基づく能力キーと検証項目）

### 関連 ADR 拘束条件
- （該当 ADR と完了条件/test strategy への反映）

### scope-affecting impact candidate
- （case-open が事前探索した候補）

### adversarial-review 発動契約（任意）
- （ユーザー明示指定時のみ記録）
```

### presence-based 判定

case-open は新規 Issue 作成時および case-update による新契約更新時に「Execution Contract」
セクションを必ず付与する。case-run は当該セクションの存在有無により新旧 Issue を識別する。

### legacy Issue テンプレート

本変更以前の Issue テンプレートは廃止せず、履歴として維持する。既存の
issue_desc_feature.md、issue_desc_child.md は新テンプレートへ移行する。
issue_desc_bug.md、issue_desc_epic.md は bugfix/maintenance/docs_chore または backlog 由来であり、
execution contract セクションの付加を検討するが必須とはしない（work_type により
execution contract 責務が軽量なため）。

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

