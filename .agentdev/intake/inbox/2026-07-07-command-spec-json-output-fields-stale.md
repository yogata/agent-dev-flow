# コマンド SPEC「JSON 出力」フィールド一覧の陳腐化（extensions_check_required / declared_files_check 未掲載）

## 概要

`docs/specs/commands/{req-save,spec-save,case-close}.md` の「JSON 出力」説明文が 9 フィールドのみ列挙し、`extensions_check_required` と `declared_files_check` を掲載していない。SSoT である `docs/specs/integrity/integrity-contracts.md`（Phase 2 で TargetedDocsReport interface の 11 フィールドを確定済み）と乖離している。

Wave 2 (PR #1477) で check_changed_docs.ts の report オブジェクトが `extensions_check_required` を正しく含むよう修正されたため、実装と SPEC の乖離が顕在化した。

## 詳細

対象 3 箇所（いずれも Wave 2 マージ後、2026-07-07 現在）:

- `docs/specs/commands/req-save.md:79` — 「JSON 出力は `workflow`、`files_checked`、`coupled_files_checked`、`failures`、`warnings`、`doc_map_update_required`、`spec_readme_update_required`、`requirements_readme_update_required`、`full_docs_check_recommended` を含む。」（9 フィールド）
- `docs/specs/commands/spec-save.md:90` — 同様の 9 フィールド列挙
- `docs/specs/commands/case-close.md:100` 付近 — 同様の 9 フィールド列挙

不足フィールド:
- `extensions_check_required`
- `declared_files_check`

SSoT 対照（`docs/specs/integrity/integrity-contracts.md` TargetedDocsReport interface）では 11 フィールドすべて定義済み。Wave 1 の TS-001（AG-002）は interface 一致性を検証対象とするため、本 SPEC 記載漏れは TS-001 の対象外（実装の健全性は保たれている）。

## 候補となる対応

1. 上記 3 SPEC の「JSON 出力」フィールド一覧へ `extensions_check_required`、`declared_files_check` を追加し、SSoT（integrity-contracts.md）と一致させる
2. 必要に応じて `case-run.md` の同種記載も確認・整合させる
3. 整合後、`/repo/docs-check` または targeted docs guard で SPEC 変更が他の整合性を破壊しないことを検証する

## 根拠

- 観測元: Epic #1472 Wave 2 / Issue #1474 / PR #1477 の case-close 実行（2026-07-07）。PR 本文 `## Findings / Capture候補` > `### pre-existing（Wave 1 既知課題、本 PR スコープ外）`
- 対象ファイル: `docs/specs/commands/req-save.md`、`docs/specs/commands/spec-save.md`、`docs/specs/commands/case-close.md`
- 関連要件: REQ-0158（targeted docs guard）、REQ-0154（SPEC status 追跡）
- 関連既知課題: `.agentdev/intake/inbox/2026-07-05-check-changed-docs-report-missing-fields.md`（script 実装側の report object 欠落。本項目は SPEC 記載側の陳腐化で対象が異なる）
- スコープ: Wave 2 (#1474) 対象外。PR 本文にて「Wave 3 まで軽量（spec-save で部分的対応）」と明記済み
