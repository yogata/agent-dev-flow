# Intake Item: epic-wave-close.md のゼロ起点 E ラベル（E4-0）の規約未整備

## 発生源

- PR: #2153 (Issue #2144 / OU-010, Epic #2134 Wave 2)
- 発生 phase: case-run 実装（順序ラベル3変種統一の適用範囲判定）
- capture 分類: intake（具体的検討候補）

## 問題

`agentdev-workflow-case-close/references/epic-wave-close.md` の E 系ラベルは E4-0（ゼロ起点副番号）を採用しており、サブステップ識別子の副番号開始値（ゼロ起点許容/非許容）の規約が未整備。OU-010 の3変種統一の対象外として未変換のまま残っている。

## 推奨対応

サブステップ識別子様式の SPEC 確定候補（intake-2026-08-16-spec-cand-substep-identifier-style.md）と併せてゼロ起点副番号の要否を確定し、必要に応じて E4-0 を E4-1 起点へ振り直す。

## 関連

- Issue: #2144 (CLOSED), Epic: #2134
- PR: #2153 (Findings / Capture候補 セクション intake 4)
