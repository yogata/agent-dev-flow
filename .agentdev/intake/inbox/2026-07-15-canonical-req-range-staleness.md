# Canonical: REQ range の陳腐化（REQ-0161 → 実際は REQ-0162）

## 概要

`docs/guides/project-docs-and-specs.md` に記載の REQ range「REQ-0101 から REQ-0161」が実際と乖離している。現状は REQ-0162 まで（53 files）であり、更新が必要。

## 詳細

- 対象: `docs/guides/project-docs-and-specs.md`
- 記載: 「REQ-0101 から REQ-0161」
- 実態: REQ-0162 まで（53 files、直近で追加された REQ-0162 を含む）
- 検出: check_integrity.ts Canonical req-range-staleness（NG 1件）

## 候補となる対応

`docs/guides/project-docs-and-specs.md` の REQ range を「REQ-0161」から「REQ-0162」に更新する。機械的修正。

## 根拠

- 観測元: /repo/docs-check 2026-07-15 実施（check_integrity.ts Canonical strict）
- 検出規模: NG 1件
- 原因分類: 確認済み（REQ-0162 追加時の更新漏れ）
- route: intake → quick fix（機械的更新）
