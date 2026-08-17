# decision-baseline-table の全件出力規則の明文化（SPEC確定候補）

## 観測内容

実装の decision-baseline-table は現行 Decision 全件（accepted/proposed/superseded を含む）をステータス列付きで出力する。旧 adr-baseline-table（accepted のみ）と意味が異なるため、`docs/specs/integrity/index-auto-generation.md`「生成規則」に全件出力規則として明文化が望ましい。

## 影響

- SPEC 生成規則が旧 adr-baseline-table 時代のままのため、AUTOGEN 出力の意味解釈が文面から確定しない

## 課題

spec-save 経由で生成規則へ全件出力規則を明文化する。実装側は PR #2148 で main 入り済み。

## 既存要件・成果物との関連

- SPEC: docs/specs/integrity/index-auto-generation.md「生成規則」
- 実装: generate_indexes.ts generateDecisionBaselineTable（PR #2148、main 入り済み）
- 関連: 2026-08-16-spec-cand-decision-baseline-count-caption.md（同 PR 由来の例示整合、統合候補）

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2148 (Issue #2135 / OU-001, Epic #2134 Wave 1) SPEC確定候補 セクション 2
- 元 item: intake-2026-08-16-spec-cand-decision-baseline-table-all-entries.md
