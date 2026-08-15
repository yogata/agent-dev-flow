# Intake Item: SPEC確定候補 — decision-baseline-table の全件出力規則の明文化

## 発生源

- PR: #2148 (Issue #2135 / OU-001, Epic #2134 Wave 1)
- 発生 phase: case-close Step 3-2 SPEC 確定フロー（パターン (c) 見送り、後続へ委ねる記録）
- capture 分類: intake（SPEC 更新候補。`## SPEC確定候補` 由来。`## Findings / Capture候補` とは区別）

## 問題

実装の decision-baseline-table は現行 Decision 全件（accepted/proposed/superseded を含む）をステータス列付きで出力する。旧 adr-baseline-table（accepted のみ）と意味が異なるため、`docs/specs/integrity/index-auto-generation.md`「生成規則」に全件出力規則として明文化が望ましい。

## 推奨対応

spec-save 経由で生成規則へ全件出力規則を明文化する。実装側は PR #2148 で main 入り済み。

## 関連

- Issue: #2135 (CLOSED), Epic: #2134
- PR: #2148 (SPEC確定候補 セクション 2)
- 実装: generate_indexes.ts generateDecisionBaselineTable
