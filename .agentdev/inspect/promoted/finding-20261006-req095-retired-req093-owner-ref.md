# REQ-095 が retired REQ-093 を廃止注記なしに現行所有者として参照

- **分類**: inspect finding promote（F-01・severity high・confidence high・Jev 分類 promote 意見一致）
- **由来**: inspect-docs finding 20261006T151122Z（backlog-auto stage 1）。inspect-promote 2026-10-07 自律確定

## 観測（evidence・実測確認済み）

- `docs/requirements/REQ-095.md:27`（対象外節）に「REQ-093 が所有する起動環境障害の予防・診断・回復」と retired ID を現行所有者として参照、廃止注記なし
- REQ-093 は 2026-10-03 retired（343d4661）。`retired/REQ-093.md:4 status: migrated`、同 :9-11「全操作の診断範囲と安全条件は REQ-052 が所有する」
- 移管先実体確認済み: `docs/requirements/REQ-052.md:34-35`（REQ-052-014/015 が診断範囲・安全条件を所有）
- REQ-095 updated 2026-10-06 は廃止後の編集であるにもかかわらず残置
- `requirements/README.md:100` に retired REQ-093 行あり（source_of_truth 整合）

## 影響課題

廃止済み REQ への現行所有者参照により、読者が起動環境障害の正しい規範（REQ-052-014/015）に到達できない。前回（2026-10-04）intake item 2026-10-04-retired-req087-092-093-wave3-remaining-refs-cleanup で捕捉されたが 10-05 の intake-promote → backlog-review で RU 化対象外（RU-0001〜0018 に REQ-093/087 系 0 件、5fd9fe9c で実証）のまま実体残存。再検出として新規起票。

## 対応候補

docs 修正: REQ-095.md:27 の REQ-093 参照を REQ-052-014/015 へ付け替え、または「旧 REQ-093 から REQ-052 へ移管済み」の廃止注記を追加。

## 既存要件関連

retired/REQ-093.md:9-11（移管宣言）、REQ-052-014/015（現行所有者）。

## 統合注記（backlog-review での統合判定候補）

F-02（REQ-102:24 同型参照）・F-04/F-05（crosswave keep 残置）と同根の retired 反映漏れファミリー。docs 修正 RU への束ね候補。
