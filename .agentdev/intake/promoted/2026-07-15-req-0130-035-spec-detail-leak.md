# CanonicalConflict: REQ-0130-035 に SPEC detail（Step number）の混入

## 観測内容

`docs/requirements/REQ-0130.md:45`（REQ-0130-035）に SPEC detail（「Step 6」等のステップ番号引用）が混入。REQ には WHAT（要求）を記述すべきであり、SPEC/command の HOW（実装ステップ）は含むべきでない。

## 影響

- REQ の純粋性低下（REQ/SPEC 境界違反）
- REQ-0130-035 の読者が実装ステップを要求と誤認するリスク
- 同カテゴリの INFO（baseline）複数（REQ-0108-268, REQ-0140-028, REQ-0144-009, REQ-0149-009, REQ-0153-001）は対象外降格済み、全体のは正を議論すべき

## 課題

REQ-0130-035 に SPEC detail（Step number）が混入。REQ/SPEC 境界（REQ=WHAT, SPEC=HOW）の違反。

## 既存要件との関連

- REQ/SPEC 境界設計（REQ=WHAT, SPEC=HOW）
- REQ-0130（case-update 関連要件）

## 対応方針の方向性

REQ-0130-035 に混入した SPEC detail（Step number）を、対応する SPEC または command 定義へ分離・移動する。REQ 側は WHAT 表現のみを残す。

route: req-define（REQ 本文の修正）。

## 根拠

- 観測元: /repo/docs-check 2026-07-15 実施（check_integrity.ts CanonicalConflict heuristic）
- 対象: `docs/requirements/REQ-0130.md:45`（REQ-0130-035）
- 混入内容: SPEC detail（「Step 6」等のステップ番号引用）
- 検出規模: WARNING 1件
- 同カテゴリ INFO（baseline）複数は対象外（REQ-0108-224）
