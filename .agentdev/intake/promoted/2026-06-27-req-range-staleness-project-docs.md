# project-docs-and-specs.md の REQ 範囲記載が REQ-0153 追加で陳腐化

## 発生源

- Issue: #1155
- PR: #1159 (merged, squash 6e61425f)
- 発生日: 2026-06-25

## 観測内容

`docs/guides/project-docs-and-specs.md` L26 は「現行 REQ は REQ-0101 から REQ-0152 までの 44 件」と記載する。しかし commit dd11ba91 が REQ-0153 を追加した際、本ファイルの range 記載と件数が更新されなかった。実際の最終番号は REQ-0153。

## 影響

- 読者が現行 REQ 範囲を誤認（REQ-0153 が存在しないかのように見える）
- 件数記載「44 件」も実際より 1 件少ない
- docs-check の NG「req-range-staleness」として継続検出される（OK 210 / NG 1）

## 課題

- L26 の REQ 範囲を「REQ-0101 から REQ-0153 まで」へ更新し、件数を再集計するか（廃止 REQ-0111/0115/0116/0117/0118/0120/0121/0122 を除く現行件数）
- REQ 追加時のガイド類 range 自動更新仕組み（SPEC/integrity rule）を新設するか、手動更新で運用するか
- 同種の range 記載が他のガイド/SPEC に散在しないかの横断確認

## 既存要件との関連

- `docs/guides/project-docs-and-specs.md` L26
- `docs/requirements/REQ-0153.md`（dd11ba91 で追加）
- check_integrity NG「req-range-staleness」

## 対応方針候補

- 即時是正: L26 の範囲・件数を更新。横展開で他ガイド/SPEC の range 記載を確認
