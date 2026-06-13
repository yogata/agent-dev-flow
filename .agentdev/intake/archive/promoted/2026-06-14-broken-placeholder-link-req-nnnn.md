# REQ-0108 に存在しない `REQ-NNNN.md` プレースホルダリンクが残存

## 観測

`docs/requirements/REQ-0108.md` 内に `REQ-NNNN.md` へのリンクが存在するが、該当ファイルは存在しない（未採番プレースホルダの放置）。

### 対象箇所

- `docs/requirements/REQ-0108.md`（`REQ-NNNN.md` リンク）
- 件数: NG 1（`broken-file-link`）

## 影響

解決不能なリンクとなり、docs の一貫性検査で継続的に NG となる。

## 推奨対応

`REQ-NNNN.md` プレースホルダを正規の REQ ID へ置換する、または該当リンクを削除する。

## 分類

- finding category: broken-reference
- route: intake
- 原因: 確認済

## 根拠

- 検査: `broken-file-link`（strict）
