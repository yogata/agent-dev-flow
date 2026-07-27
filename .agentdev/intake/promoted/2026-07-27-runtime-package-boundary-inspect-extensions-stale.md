# runtime-package-boundary SPEC の inspect-extensions 残存参照

## 観測内容

ADR-006 により `inspect-extensions` は独立公開 command として廃止された。
配布 command、command SPEC、foundation SPEC、skill SPEC は後継の docs-check、inspect-skills、inspect-promote へ更新済みである。
しかし `docs/specs/local/runtime-package-boundary.md` L306 には、`eq-save, spec-save, case-close, inspect-extensions` が検証スクリプトを呼び出すという列挙が残る。

## 影響

local SPEC が廃止済み command を現行構成として示し、ADR-006 と整合しない。

## 課題

Epic #1833 の主対象外だった local SPEC に stale reference が残り、周辺記述も廃止後の状態を反映しているか未確認である。

## 既存要件、仕様との関連

- `docs/specs/local/runtime-package-boundary.md` L306
- `docs/adr/ADR-006.md`
- Issues #1834、#1835、#1836
- Epic #1833

## 対応方向

列挙から `inspect-extensions` を削除して 3 command へ縮約し、隣接する実行時欠落の記述も必要に応じて更新する。
RU-0028 の付録または独立 RU とするかは backlog-review で判断する。

## 発生源

Epic #1833 Wave 1 の case-close 時に行った stale reference 確認。
