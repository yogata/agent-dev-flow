# SPEC target_area 未検出時の APPEND fallback の公式化

## 観測内容

req-define が既存 SPEC への新規セクション追加を `operation: spec-update` と未作成見出しの `target_area` で表すため、`search-target-area.ts` は `matches: []` を返す。
spec-save Step 5 は未検出時の follow-up 報告と create 系 operation への切替を推奨するが、実行時には content が見出しから始まる場合の APPEND fallback が一貫して使われている。
この deviation は case-auto Draft 1 から 8 のほぼ全件で発生した。

## 影響

新規セクション追加の実意は満たすものの、公式手続きと実運用が一致せず、同じ deviation の報告と workaround が反復する。

## 課題

新規セクション追加を req-define 側の第一級 operation とするか、spec-save 側で未検出時の APPEND を公式化するかが未決定である。

## 既存要件、仕様との関連

- `docs/specs/commands/spec-save.md` Step 5
- `docs/specs/commands/req-define.md` Step 7-3a
- `search-target-area.ts`

## 対応方向

req-define で設計判断を行い、operation の追加または spec-save の未検出時契約の公式化を選択する。
想定は maintenance、standard scale である。

## 発生源

case-auto Draft 1 から 8 の spec-save 委譲。
