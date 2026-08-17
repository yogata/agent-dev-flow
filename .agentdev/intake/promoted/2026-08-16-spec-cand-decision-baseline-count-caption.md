# index-auto-generation.md の decision-baseline-count キャプション形式の例示整合（SPEC確定候補）

## 観測内容

実装の decision-baseline-count キャプションは `現行の承認済み Decision はN件、提案中の Decision はM件である。`（accepted + proposed の2値）。`docs/specs/integrity/index-auto-generation.md` L39 の例示（「承認済みステータス（accepted）の DEC-001〜DEC-{NNN} Y件」）は実装と異なる文言のため、例示を実装形式に揃えるか注記が望ましい。

## 影響

- SPEC 例示と AUTOGEN 実出力が不一致であり、生成結果検証の際の参照文言として機能しない

## 課題

spec-save 経由で index-auto-generation.md の例示を実装形式へ整合させる（または注記を付す）。実装側は PR #2148 で main 入り済み。

## 既存要件・成果物との関連

- SPEC: docs/specs/integrity/index-auto-generation.md L39
- 実装: generate_indexes.ts generateDecisionBaselineCaption（PR #2148、main 入り済み）
- 関連: 2026-08-16-spec-cand-decision-baseline-table-all-entries.md（同 PR 由来、統合候補）

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2148 (Issue #2135 / OU-001, Epic #2134 Wave 1) SPEC確定候補 セクション 1
- 元 item: intake-2026-08-16-spec-cand-decision-baseline-count-caption.md
