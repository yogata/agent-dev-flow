# コマンド SPEC「JSON 出力」フィールド一覧の陳腐化（extensions_check_required / declared_files_check 未掲載）

## 観測内容

`docs/specs/commands/{req-save,spec-save,case-close}.md` の「JSON 出力」説明文が 9 フィールドのみ列挙し、`extensions_check_required` と `declared_files_check` を掲載していない。SSoT である `docs/specs/integrity/integrity-contracts.md`（TargetedDocsReport interface の 11 フィールドを確定済み）と乖離している。

対象 3 箇所:
- `docs/specs/commands/req-save.md:79` — 9 フィールド列挙
- `docs/specs/commands/spec-save.md:90` — 同様
- `docs/specs/commands/case-close.md:100` 付近 — 同様

不足フィールド: `extensions_check_required`, `declared_files_check`

## 影響

- SPEC と SSoT（integrity-contracts.md）の不整合
- 実装の健全性は保たれている（Wave 2 PR #1477 で check_changed_docs.ts の report オブジェクトが extensions_check_required を正しく含むよう修正済み）
- SPEC 記載のみ陳腐化

## 課題

上記 3 SPEC の「JSON 出力」フィールド一覧へ不足フィールドを追加し、SSoT と一致させる。必要に応じて `case-run.md` の同種記載も確認・整合させる。

## 既存要件との関連

- REQ-0158（targeted docs guard）
- REQ-0154（SPEC status 追跡）
- 関連 item: check_changed_docs.ts report オブジェクトのフィールド欠落（コード実装側、別 item）

## 出典

- 観測元: Epic #1472 Wave 2 / Issue #1474 / PR #1477 の case-close 実行（2026-07-07）
