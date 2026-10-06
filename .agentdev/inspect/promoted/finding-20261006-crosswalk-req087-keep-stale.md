# crosswalk-inventory REQ-087 行の retired 反映漏れ

- **分類**: inspect finding promote（F-04・severity medium・confidence high・Jev 分類 promote 意見一致）
- **由来**: inspect-docs finding 20261006T151122Z（backlog-auto stage 1）。inspect-promote 2026-10-07 自律確定

## 観測（evidence・実測確認済み）

- `docs/designs/foundations/references/crosswalk-inventory.md:62` が「| REQ-087 | keep | ― | ― | executed | 採番例外記録は維持。… |」のまま
- REQ-087 は 2026-10-04 retired（94a9f43a、`retired/REQ-087.md:4 status: migrated`、:11 移管先 REQ-001-070/REQ-010-070/numbering-policy 明記）
- retired 化コミット 94a9f43a の変更ファイルに crosswalk-inventory.md が含まれないこと（git show --stat で実証）、以降の最新更新 9fbbbc4a も未是正
- 同一表内の前例: :24 REQ-016・:54 REQ-057 は「keep → retired」追随更新済み
- 機械検査（check_integrity retired-req-primary-ref）が本行を Warning 検出しており、意味確認の結果妥当な検出と確定

## 影響課題

living tracking 表が retired 実体と不整合。前回 intake item 由来の再検出（RU 化対象外のまま残存、5fd9fe9c で RU 内 REQ-087 言及 0 件を実証）。

## 対応候補

docs 修正: :62 を「keep → retired」へ追随更新（:24/:54 前例準拠）。解消時に baseline Warning（exemption/baseline 登録状態）の整理を要する可能性。

## 既存要件関連

REQ-001-070・REQ-010-070（移管先現行所有者）、numbering-policy.md:69、retired/REQ-087.md。

## 統合注記（backlog-review での統合判定候補）

F-05（:43 REQ-046 同型）と同一表で併合処理推奨。docs-check route 候補（retired REQ の crosswalk 処遇行突合検査）は F-05 側に記載。
