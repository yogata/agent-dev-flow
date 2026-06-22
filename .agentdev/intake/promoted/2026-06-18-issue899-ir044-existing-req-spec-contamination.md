# 既存 active REQ 8件に SPEC 詳細混入シグナル検出（IR-044 稼働後・Epic 想定内）

## 観測

IR-044（REQ/SPEC 境界違反検出）稼働後、既存 active REQ 8件（REQ-0101, 0104, 0108, 0114, 0124, 0126, 0131, 0136）に Step 番号・fixture・enum 等 SPEC 詳細が混入していることを検出。これは Epic #896 Wave 4 OU-05 (Issue #903) の想定内成果物。

## 影響

- 検出された REQ の SPEC 詳細を SPEC/rule catalog/command reference/skill reference へ段階的移行が必要

## 課題

- 優先順位付け
- 移行先 SPEC ファイル決定
- 一括移行 vs 段階的移行の判断

## 既存要件との関連

- REQ-0136-017（既存 REQ の SPEC 混入洗い出し）
- Epic #896 Wave 4 OU-05 (Issue #903)

## 根拠

- 元 inbox item: `2026-06-18-issue899-ir044-existing-req-spec-contamination.md`
- Issue #899
