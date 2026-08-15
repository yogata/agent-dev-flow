# Intake Item: SPEC確定候補 — index-auto-generation.md の decision-baseline-count キャプション形式の例示整合

## 発生源

- PR: #2148 (Issue #2135 / OU-001, Epic #2134 Wave 1)
- 発生 phase: case-close Step 3-2 SPEC 確定フロー（パターン (c) 見送り、後続へ委ねる記録）
- capture 分類: intake（SPEC 更新候補。`## SPEC確定候補` 由来。`## Findings / Capture候補` とは区別）

## 問題

実装の decision-baseline-count キャプションは `現行の承認済み Decision はN件、提案中の Decision はM件である。`（accepted + proposed の2値）。`docs/specs/integrity/index-auto-generation.md` L39 の例示（「承認済みステータス（accepted）の DEC-001〜DEC-{NNN} Y件」）は実装と異なる文言のため、例示を実装形式に揃えるか注記が望ましい。

## 推奨対応

spec-save 経由で index-auto-generation.md の例示を実装形式へ整合させる（または注記を付す）。実装側は PR #2148 で main 入り済み。

## 関連

- Issue: #2135 (CLOSED), Epic: #2134
- PR: #2148 (SPEC確定候補 セクション 1)
- 実装: generate_indexes.ts generateDecisionBaselineCaption
