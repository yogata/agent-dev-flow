# Canonical: REQ range の陳腐化（REQ-0161 → 実際は REQ-0162）

## 観測内容

`docs/guides/project-docs-and-specs.md` に記載の REQ range「REQ-0101 から REQ-0161」が実際と乖離。現状は REQ-0162 まで（53 files、直近で追加された REQ-0162 を含む）。

## 影響

- ガイド文書の記載不正確（機能的影響なし）
- 文書読者による REQ range の誤認リスク

## 課題

REQ-0162 追加時に `docs/guides/project-docs-and-specs.md` の REQ range 更新が漏れた。

## 既存要件との関連

- なし（ガイド文書の保守、Canonical req-range-staleness 検査対象）

## 対応方針の方向性

`docs/guides/project-docs-and-specs.md` の REQ range を「REQ-0161」から「REQ-0162」に更新する。機械的修正。

## 根拠

- 観測元: /repo/docs-check 2026-07-15 実施（check_integrity.ts Canonical strict）
- 対象: `docs/guides/project-docs-and-specs.md`
- 記載: 「REQ-0101 から REQ-0161」
- 実態: REQ-0162 まで（53 files）
- 検出規模: NG 1件
