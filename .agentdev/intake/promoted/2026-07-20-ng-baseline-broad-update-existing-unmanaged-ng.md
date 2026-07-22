# ng-baseline 広範囲取込 — 既存未管理NG（mapping-table-completeness 等）の実修復検討

## 観測内容

- 由来 PR #1634（retired 文書物理削除）、Issue #1633。発生局面は実装（PR #1634 retired 文書物理削除、IR-055 baseline 更新）。
- PR #1634 に付随して `ng-baseline.json` を更新した際、retired 削除由来の新規 NG 95件（broken-req-ref 71件、broken-adr-ref 22件、adr-req-crossref 11件、adr-readme-index 1件）に加え、既存未管理 NG（runtime-unresolved-reference、mapping-table-completeness 58件等）も一括で baseline に取り込まれた。
- case-run 実行担当サブエージェントが ng-baseline 更新時の diff を確認し、retired 由来以外の既存 NG も含まれていることを検知。
- 根本原因: `--update-ng-baseline` は全体再生成方式であり、現状の全 NG を再列挙して baseline 化する。そのため「特定由来（retired 削除等）」のみを精密に取り込めず、既存未管理 NG も巻き込む。

## 影響

中。baseline 運用の精密化（IR-055 運用改善）に関わる。mapping-table-completeness 58件などの実 NG が baseline に取り込まれ「解決済み」と誤認されるリスク。要修復対象が baseline に埋もれる。

## 課題

複数サブ課題が混在する:

1. `--update-ng-baseline` の全体再生成方式により、由来ラベル付きの差分追加ができない（ツール側の構造的問題）。
2. 既存未管理 NG（mapping-table-completeness 58件等）の実修復が未対応（docs 側の個別不整合）。

## 既存要件・仕様との関連

- IR-055: baseline 運用。本件は IR-055 運用改善の一環。ツール方式（全体再生成）と運用要件（由来精密化）のギャップ。

## 対応方針の方向性

サブ課題が混在するため分割を前提とする:

1. mapping-table-completeness 58件の実修復（`docs/requirements/mapping-table.md` のカバレッジ欠損解消）— 別途 inspect/docs-check で扱う候補。
2. runtime-unresolved-reference の実修復。
3. `--update-ng-baseline` を「由来ラベル付き差分追加」方式へ改修し、将来の広範囲取込を予防（`check_integrity.ts` 改修）。
4. baseline に取り込まれた既存未管理 NG を「要修復」として別途トラッキング。

優先度 medium。baseline 運用の精密化は IR-055 運用改善の一環。
