# alloc-composite-id.ts の 3 桁 REQ 形式非対応

## 観測内容

`alloc-composite-id.ts` の `extractAllCompositeIds` は `/REQ-(\d{4})-(\d{3})/` を使い、4 桁の REQ 番号だけを認識する。
本リポジトリは `REQ-001-NNN` などの 3 桁形式を使用するため、既存 ID を認識できず `max=0` を返す。
一方、`extractCompositeIdNumbers` は `\d{3,4}` を許容しており、関数間で形式契約が一致していない。

## 影響

REQ-001、REQ-003、REQ-006、REQ-008、REQ-010 を含む req-save で自動採番が機能せず、Draft 1 から 8 まで手動採番が必要になった。

## 課題

3 桁と 4 桁の両形式を一貫して認識する採番契約と検証が不足している。

## 既存要件、仕様との関連

- `src/opencode/skills/agentdev-req-file-manager/scripts/src/alloc-composite-id.ts`
- `extractAllCompositeIds`
- `extractCompositeIdNumbers`

## 対応方向

正規表現を `/REQ-(\d{3,4})-(\d{3})/` へ変更し、3 桁と 4 桁の両形式で採番を検証する。
想定は maintenance、standard scale である。

## 発生源

case-auto Draft 1 から 8 の req-save と spec-save の統合委譲。
