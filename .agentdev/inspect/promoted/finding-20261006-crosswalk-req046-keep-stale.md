# crosswalk-inventory REQ-046 行の同型 retired 反映漏れ（機械検査未検出）

- **分類**: inspect finding promote（F-05・severity medium・confidence high・Jev 分類 promote 意見一致）
- **由来**: inspect-docs finding 20261006T151122Z（backlog-auto stage 1）。inspect-promote 2026-10-07 自律確定

## 観測（evidence・実測確認済み）

- `docs/designs/foundations/references/crosswalk-inventory.md:43` が「| REQ-046 | keep | ― | 13 | executed | 移行不変条件。第13段で retire 予約（v4 移行完了後に廃止判定）… |」のまま
- REQ-046 は 2026-09-30 retired（`retired/REQ-046.md:6 status: migrated`、:9-11 後継なし・恒常不変条件は REQ-010-065〜067 が継続所有）。retire 予約は消化済み
- 継続所有者の実在確認済み: `REQ-010.md:38-40`（REQ-010-065〜067）
- 機械検査（check_integrity retired-req-primary-ref）は REQ-087 のみ検出し REQ-046 を検出していない（検出範囲/baseline ギャップ）

## 影響課題

F-04 と同一表の不整合。機械検査の検出漏れが「retired 反映漏れは機械検査で自動検出できる」という前提を崩している。

## 対応候補

docs 修正: :43 を F-04 と同一表で併合処理（「keep → retired」追随更新）。
docs-check route 候補: retired REQ の crosswalk 処遇行と retired 実体の突合検査（REQ-046 が検出されなかった baseline 未登録・検出範囲ギャップの解消）。

## 既存要件関連

REQ-010-065〜067（継続所有者）、retired/REQ-046.md。

## 統合注記（backlog-review での統合判定候補）

F-04 と一括処理推奨。docs-check route 候補（突合検査の機械検査化）は RU 化時に実装系変更を含めるかの判断を req-define に委ねる。
