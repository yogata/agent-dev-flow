---
title: Targeted Docs Guard 実装詳細
status: accepted
created: 2026-07-15
updated: 2026-07-18
---

# Targeted Docs Guard 実装詳細

REQ-0158（Targeted Docs Integrity Guard）から移送された実装計画・スキーマ詳細（AG-012 で REQ から SPEC へ移送）。配布物たる REQ 側は WHAT（結果要件）のみを残し、HOW（実装計画、スキーマ詳細）は本 SPEC に配置する。

## Phase1-6 実装計画

check_changed_docs.ts 中心の変更文書限定検査契約を Phase 1-6 で成熟させる。コマンドと check_changed_docs.ts の責務分担（コマンドが対象確定、check_changed_docs.ts が検査実行）、評価対象はフォーマット検査に限定（意味評価しない）を基本方針とする。

### Phase 1: SPEC 配置

- check_changed_docs.ts の変更文書限定検査契約は、挙動SPEC（entry/対象解決/profile/validator呼出/report契約/exit code）、カタログSPEC（TargetedDocsReport 型定義、workflow profile 定義）、実装詳細SPEC（validator内部アルゴリズム、分割基準）に配置されること。
- 個別判定条件は IR-*.md に配置されること。

### Phase 2: report 契約固定

- TargetedDocsReport 型が固定され、型/戻り値/JSON/text出力/テストが一致すること。
- 必須フィールド: workflow, files_checked, coupled_files_checked, failures, warnings, doc_map_update_required, spec_readme_update_required, requirements_readme_update_required, full_docs_check_recommended, extensions_check_required, docInputsCheckRequired, declared_files_check。上記リストのみを必須フィールドとし、それ以外を許容しない。

### Phase 3: 対象確定の命令側移行

- 対象確定はコマンド側が行うこと。check_changed_docs.ts は対象選定の十分性を判定しないこと。
- 対象があれば --files を渡し、対象なければ原則呼出さないこと。
- --files の区切り形式は space 区切り（推奨）と comma 区切り（後方互換）の両方を受入れること（REQ-0158-001）。例: `--files a.md b.md c.md`（space 区切り推奨）、`--files a.md,b.md,c.md`（comma 区切りも受入）。両形式の混在も可。
- --files 指定で files_checked が空の場合は失敗（FAILURE）扱い、--base-ref 指定で files_checked が空の場合は警告（WARNING）扱いとすること。

### Phase 4: コマンド別最小監査範囲

- req-save/spec-save/case-run/case-close の各コマンドが、対象ファイル種別に応じた最小監査範囲を定義すること。
- 各コマンド SPEC と integrity-contracts.md の Workflow×ツールマトリックス表が SSoT であること。
- case-run/case-close は永続文書更新を契機に検査すること。

### Phase 5: 回帰テスト

- 変更文書限定検査の回帰テストが存在すること。
- TargetedDocsReport の型/戻り値/JSON/text出力の一致を検証するテストを含むこと。

### Phase 6: validator 分割基準

- validator の分割基準が実装詳細SPEC に文書化されること。
- 分割基準は validator の責務境界、ファイルサイズ上限、関心分離ルールを含むこと。

## report フィールド一覧

check_changed_docs.ts の report JSON に含まれる全フィールドを列挙する。
陳腐化により未掲載だった以下フィールドを追加する:

- docInputsCheckRequired: 検査入力の必要性（boolean）
- extensionsCheckRequired: project extensions 検査の必要性（boolean）
- declaredFilesCheck: 宣言ファイル検査の実行結果（object）

既存フィールド（files_checked, findings 等）とあわせて、report JSON の
完全スキーマを本セクションに集約する。

## 関連

- REQ-0158（Targeted Docs Integrity Guard）
- `docs/specs/integrity/validator-split-criteria.md`（validator 分割基準、Phase 6 の詳細）
- `docs/specs/integrity/integrity-contracts.md`（Workflow×ツールマトリックス表）

