# Intake Item: SPEC確定候補 — mechanical-replacement-rules.md §4 の ordered list 行の扱い明文化

## 発生源

- PR: #2154 (Issue #2143 / OU-009, Epic #2134 Wave 3)
- 発生 phase: case-run 実装（X-4 機械判定の適用）
- capture 分類: intake（SPEC 更新候補。`## SPEC確定候補` 由来。`## Findings / Capture候補` とは区別）

## 問題

mechanical-replacement-rules.md §4（一文一行機械判定）はリスト行の定義を「`- ...`/`* ...`」のみ列挙しており、ordered list（`1. `）行の扱いが明文でない。
実装（apply-mechanical-replacement.ps1 のリスト判定 `^\s*[-*+]\s`）と過去是正 PR（#1091）の実績では ordered list 項目は prose として分割し、継続文はマーカーなしの後続行（lazy continuation）とする運用である。

## 推奨対応

spec-save 経由で §4 に ordered list 項目の扱い（prose として分割、継続文はマーカーなし後続行）を明文化する。

## 関連

- Issue: #2143 (CLOSED), Epic: #2134
- PR: #2154 (SPEC確定候補 セクション 1)
