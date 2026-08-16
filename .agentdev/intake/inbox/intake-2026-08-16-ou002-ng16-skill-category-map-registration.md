# Intake Item: N16 skill-category-gap — categoryToCheckPattern map 登録と check_skill_rename_symmetry.ts 対象登録

## 発生源

- PR: #2151 (Issue #2136 / OU-002, Epic #2134 Wave 2)
- 発生 phase: case-run 検証（check_integrity NG 由来分類）
- capture 分類: intake（checker 改修候補）

## 問題

`check_integrity.ts` の `categoryToCheckPattern` map に検査カテゴリ「Skill rename 対称性」が未登録で、`check_skill_rename_symmetry.ts` が scriptFiles の対象登録から漏れている（integrity-rule-gap / skill-category-gap として NG 検出）。検証能力自体は当該スクリプトが既に提供済み。OU-002 では checker 側変更のため編集範囲外とし、baseline entry で暫定管理している。

## 推奨対応

checker 改修として `categoryToCheckPattern` map への登録と `scriptFiles` への `check_skill_rename_symmetry.ts` 対象登録を行い、暫定 baseline entry を除去する。

## 関連

- Issue: #2136 (CLOSED), Epic: #2134
- PR: #2151 (Findings / Capture候補 セクション intake 2)
- audit: docs/specs/integrity/audits/ng21-provenance-classification-20260816.md N16・残存課題「N16 の map 登録遗漏」
