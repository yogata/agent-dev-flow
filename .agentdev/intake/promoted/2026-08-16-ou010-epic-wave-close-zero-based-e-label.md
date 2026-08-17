# epic-wave-close.md のゼロ起点 E ラベル（E4-0）の規約未整備

## 観測内容

`agentdev-workflow-case-close/references/epic-wave-close.md` の E 系ラベルは E4-0（ゼロ起点副番号）を採用しており、サブステップ識別子の副番号開始値（ゼロ起点許容/非許容）の規約が未整備である。OU-010 の3変種統一の対象外として未変換のまま残っている。

## 影響

- STEP-N-M 形式統一（PR #2153）後も副番号起点が E4-0 のみ例外扱いとなり、様式の一貫性が保てない

## 課題

サブステップ識別子様式の SPEC 確定候補（2026-08-16-spec-cand-substep-identifier-style.md）と併せてゼロ起点副番号の要否を確定し、必要に応じて E4-0 を E4-1 起点へ振り直す。

## 既存要件・成果物との関連

- 対象: agentdev-workflow-case-close/references/epic-wave-close.md
- 関連: 2026-08-16-spec-cand-substep-identifier-style.md（併せて確定）

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2153 (Issue #2144 / OU-010, Epic #2134 Wave 2) Findings / Capture候補 セクション intake 4
- 元 item: intake-2026-08-16-ou010-epic-wave-close-zero-based-e-label.md
