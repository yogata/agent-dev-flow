# project-docs-and-specs.md の REQ 範囲記載が REQ-0153 追加で陳腐化

## 発生源

- Issue: #1155
- PR: #1159 (merged, squash 6e61425f)
- 発生日: 2026-06-25
- route: intake

## 観測

`docs/guides/project-docs-and-specs.md` L26 は「現行 REQ は REQ-0101 から REQ-0152 までの 44 件」と記載している。しかし commit dd11ba91 が REQ-0153 を追加した際、本ファイルの range 記載と件数が更新されなかった。実際の `docs/requirements/REQ-*.md` の最終番号は REQ-0153（45 件目、廃止分を除外した現行件数は要再集計）。

## 今回扱わない理由

Issue #1155 のスコープは「`standard-procedures.md` Write 是正 + AGENTS.md 常時ルール追記」であり、`project-docs-and-specs.md` の REQ 範囲記載は別課題。dd11ba91（REQ-0153 追加、case-auto B4）時点で既存の陳腐化であり、#1155 とは独立したドキュメント整合性課題。case-run の check_integrity で NG「req-range-staleness」として検出済み（サマリ OK 210 / NG 1 の NG 1件、dd11ba91 由来、本 Issue 由来ではない）。

## 影響

- `docs/guides/project-docs-and-specs.md` の読者が現行 REQ 範囲を誤認する（REQ-0153 が存在しないかのように見える）
- 同ファイルの件数記載「44 件」も実際より 1 件少ない
- docs-check の NG「req-range-staleness」として継続検出される（check_integrity サマリの NG 1件）

## レビューで決めること

- `project-docs-and-specs.md` L26 の REQ 範囲を「REQ-0101 から REQ-0153 まで」へ更新し、件数を再集計するか（廃止 REQ-0111/0115/0116/0117/0118/0120/0121/0122 を除く現行件数）
- REQ 追加時のガイド類 range 自動更新仕組み（SPEC/integrity rule）を新設するか、それともドキュメント整備の都度手動更新で運用するか
- 同種の range 記載が他のガイド/SPEC に散在しないかの横断確認

## 根拠

- PR #1159 本文 `## Findings / Capture候補` セクション
- `docs/guides/project-docs-and-specs.md` L26（REQ-0101 から REQ-0152 までの 44 件）
- `docs/requirements/REQ-0153.md` の存在（dd11ba91 で追加）
- check_integrity NG「req-range-staleness」（dd11ba91 由来、OK 210 / NG 1）
