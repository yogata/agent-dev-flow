# Intake Item: SPEC確定候補 — integrity-contracts SPEC への reference-path-existence 拡張の正規反映

## 発生源

- PR: #2152 (Issue #2141 / OU-007, Epic #2134 Wave 2)
- 発生 phase: case-close Step 3-2 SPEC 確定フロー（パターン (c) 見送り、後続へ委ねる記録）
- capture 分類: intake（SPEC 更新候補。`## SPEC確定候補` 由来。`## Findings / Capture候補` とは区別）

## 問題

integrity-contracts.md「reference-path-existence 検出における backtick 囲みパスの扱い（REQ-010-020）」節は、PR #2152 で checkScriptTemplateReferencePaths に追加した拡張（ネストサブディレクトリ参照検出、skill references/*.md 走査、reference ファイルの文脈解決、CJK 句読点隣接の誤延長防止）を本文に反映していない。PR #2152 は AUTOGEN 登録機構（rules/IR-062 + generate_indexes.ts）のみ編集し、同節本文は docs/specs 直接編集の制約により手を付けていない。

## 推奨対応

spec-save 経由で同節へ拡張内容（4点）を正規反映する。実装側は PR #2152 で main 入り済み（merge commit 4bf264b7）。

## 関連

- Issue: #2141 (CLOSED), Epic: #2134
- PR: #2152 (SPEC確定候補 セクション 1)
- 実装: check_integrity.ts checkScriptTemplateReferencePaths
