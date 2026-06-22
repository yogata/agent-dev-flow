# docs/guides/project-docs-and-specs.md の REQ 範囲表記が REQ-0142 追加に追随せず陳腐化

## 観測

PR #1012 (REQ-0142) マージ後、`docs/guides/project-docs-and-specs.md` が REQ-0141 までしか言及していないことを検出。`req-range-staleness` NG が拡大。

## 影響

- docs-check 結果のノイズ
- 利用者が最新 REQ 範囲を正しく把握できない

## 課題

- ガイドの REQ 範囲表記を更新
- 他 `docs/guides/*.md` の同種問題の横展開確認
- pre-existing 性のドキュメント化

## 既存要件との関連

- AGENTS.md（REQ-0101〜REQ-0142 範囲定義）
- REQ-0142

## 根拠

- 元 inbox item: `2026-06-21-issue1011-project-docs-and-specs-req-range-stale.md`
- Issue #1011 / PR #1012
