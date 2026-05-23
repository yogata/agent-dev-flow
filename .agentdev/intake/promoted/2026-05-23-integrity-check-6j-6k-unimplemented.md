---
route: intake-open
status: promoted
---

# integrity-check に旧 data path / 旧 terminology 検出パターンを追加 (6j/6k)

## 概要

`check_integrity.ts` の `LEGACY_PATTERNS` に、旧 data path（`data/` → `docs/` 移行前のパス参照）および旧 terminology（旧名前空間の残余）の検出パターンが未追加。#340 で 6j/6k として明示的に残課題とされていた。

## 対象範囲

- `check_integrity.ts` の `LEGACY_PATTERNS` 配列へのパターン追加
- 対象は旧 data path と旧 terminology のみに限定（false positive 抑制）

## 完了条件

- [ ] 旧 data path 検出パターンが `LEGACY_PATTERNS` に追加されている
- [ ] 旧 terminology 検出パターンが `LEGACY_PATTERNS` に追加されている
- [ ] 追加パターンの false positive が最小限に抑えられている

## 備考

- 優先度: 低
- パターン追加対象を旧 data path / 旧 terminology に限定し、対象語彙を増やしすぎないこと
- 元 item: `.agentdev/intake/accepted/2026-05-23-integrity-check-6j-6k-unimplemented.md`
- 根拠: Issue #340, PR #341
