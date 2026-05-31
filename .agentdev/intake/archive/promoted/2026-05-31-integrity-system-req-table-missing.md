# system.md REQ構成テーブルに REQ-0109 が欠落

## 観測

`docs/specs/system.md` L214-225 の「新基準REQ群構成」テーブルが REQ-0101〜REQ-0108 の8行で、REQ-0109（REQ再構成運用）が欠落。他の README / DOC-MAP には REQ-0109 が掲載済み。

## 影響

system.md を単体参照した際に REQ-0109 の存在が把握できない。REQ体系の完全な把握には README や DOC-MAP の参照が必要になる。

## レビューで決めること

- L214-225 のテーブルに REQ-0109 の行を追加する

## 根拠

- 検出元: integrity-check F-03 (2026-05-31)
- 分類: document-drift
- 対象ファイル: `docs/specs/system.md:214-225`
