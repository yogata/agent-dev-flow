# REQ-102 が retired REQ-093 を廃止注記なしに参照

- **分類**: inspect finding promote（F-02・severity medium・confidence high・Jev 分類 promote 意見一致）
- **由来**: inspect-docs finding 20261006T151122Z（backlog-auto stage 1）。inspect-promote 2026-10-07 自律確定

## 観測（evidence・実測確認済み）

- `docs/requirements/REQ-102.md:24`（対象外節）に「agentdev_gh（Custom Tool）の起動環境障害（REQ-093）」と retired ID を廃止注記なしで参照
- 判断の主文意（対象外指定）自体は成立するが、参照導線が廃止済み REQ に向いている。参照先の正は REQ-052-014/015（retired/REQ-093.md:9-11 の移管宣言、REQ-052.md:34-35 で実在確認済み）

## 影響課題

F-01 と同一 intake item 由来の残置。単独では軽微だが F-01 と合わせて retired 参照導線を放置することになる。

## 対応候補

docs 修正: F-01 と一括で REQ-052 へ付け替え。

## 既存要件関連

retired/REQ-093.md:9-11、REQ-052-014/015。

## 統合注記（backlog-review での統合判定候補）

F-01 と一括処理推奨（同一コミット・同一 RU 候補）。
