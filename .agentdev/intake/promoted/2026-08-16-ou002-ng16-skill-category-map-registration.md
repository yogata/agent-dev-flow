# N16 skill-category-gap — categoryToCheckPattern map 登録と check_skill_rename_symmetry.ts 対象登録

## 観測内容

`check_integrity.ts` の `categoryToCheckPattern` map に検査カテゴリ「Skill rename 対称性」が未登録で、`check_skill_rename_symmetry.ts` が scriptFiles の対象登録から漏れている（integrity-rule-gap / skill-category-gap として NG 検出）。検証能力自体は当該スクリプトが既に提供済み。OU-002 では checker 側変更のため編集範囲外とし、baseline entry で暫定管理している。

## 影響

- 既存の検証能力が check_integrity の実行経路から呼び出されず、カテゴリ gap が NG として検出され続ける

## 課題

checker 改修として `categoryToCheckPattern` map への登録と `scriptFiles` への `check_skill_rename_symmetry.ts` 対象登録を行い、暫定 baseline entry を除去する。

## 既存要件・成果物との関連

- 対象: check_integrity.ts（categoryToCheckPattern、scriptFiles）、check_skill_rename_symmetry.ts
- audit: docs/specs/integrity/audits/ng21-provenance-classification-20260816.md N16・残存課題「N16 の map 登録遗漏」

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2151 (Issue #2136 / OU-002, Epic #2134 Wave 2) Findings / Capture候補 セクション intake 2
- 元 item: intake-2026-08-16-ou002-ng16-skill-category-map-registration.md
