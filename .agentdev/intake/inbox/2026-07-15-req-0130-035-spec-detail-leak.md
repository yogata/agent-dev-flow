# CanonicalConflict: REQ-0130-035 に SPEC detail（Step number）の混入

## 概要

`docs/requirements/REQ-0130.md:45`（REQ-0130-035）に SPEC detail（「Step 6」等のステップ番号）が混入している。REQ には WHAT（要求）を記述すべきであり、SPEC/command の HOW（実装ステップ）は含むべきでない。

## 詳細

- 対象: `docs/requirements/REQ-0130.md:45`（REQ-0130-035）
- 混入内容: SPEC detail（「Step 6」等のステップ番号引用）
- 検出: check_integrity.ts CanonicalConflict req-spec-boundary-violation（WARNING 1件）
- 設計原則: REQ/SPEC 境界（REQ=WHAT, SPEC=HOW）。同カテゴリの INFO（baseline）複数あり（REQ-0108-268, REQ-0140-028, REQ-0144-009, REQ-0149-009, REQ-0153-001）は対象外（REQ-0108-224）

## 候補となる対応

REQ-0130-035 に混入した SPEC detail（Step number）を、対応する SPEC または command 定義へ分離・移動する。REQ 側は WHAT 表現のみを残す。

## 根拠

- 観測元: /repo/docs-check 2026-07-15 実施（check_integrity.ts CanonicalConflict heuristic）
- 検出規模: WARNING 1件
- 原因分類: 確認済み（REQ/SPEC 境界違反）
- route: req-define（REQ 本文の修正）
