# document-model.md の intra-file 重複（AG-004 対象外）

## 観察

Phase B（PR #1316 / Issue #1310）で `document-model.md` と `document-type-responsibilities.md` 間の本文重複を解消した（AG-004）。しかし `document-model.md` 内に intra-file 重複が残存: 「文書間投影規則」と末尾「用語: 原本、配置先」が同一内容を再掲（ファイル内で "同一内容の再掲" と明記済み）。本 PR の AG-004 範囲（両ファイル間重複削減）には含まれないため未対応。

## 修正されなかった理由

AG-004 スコープは「両ファイル間の重複削減」に限定。intra-file 重複は別軸のため、将来の inspect-docs / backlog で個別対応候補とした。

## 課題

- `document-model.md` の「文書間投影規則」と末尾「用語: 原本、配置先」の統合可否
- ファイル内での正本・写しの分離方針（写しを削除するか、相互参照へ切り替えるか）

## 根拠

PR #1316 本文（Findings / Capture候補）より引用:

> document-model.md 内の intra-file 重複（AG-004 対象外）: 「文書間投影規則」と末尾「用語: 原本、配置先」が同一内容を再掲（ファイル内で "同一内容の再掲" と明記済み）。本 PR の AG-004 範囲（両ファイル間重複削減）には含まれないため未対応。将来の inspect-docs / backlog で個別対応候補

## 観測元

- PR #1316
- Issue #1310
- Epic #1308（Phase B, Wave 1）
