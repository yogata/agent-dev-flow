# NG baseline 運用手順の報告分類（legacy provenance 承認追加の位置づけ、SPEC確定候補）

## 観測内容

integrity-contracts SPEC「NG baseline 運用手順」の報告分類では、provenance が `legacy` の承認済み追加 entry は報告上「承認済み追加分」ではなく「baseline-known」へ集計される（`applyNgBaseline` の分類ロジック由来）。由来ラベル `legacy` を承認追加に使う場合の報告上の位置づけが明確でない。

## 影響

- baseline 運用報告の集計値が由来ラベルによって直感とずれ、承認済み追加の監査証跡が読み取りにくい

## 課題

integrity-contracts SPEC で由来ラベルと報告分類の対応を明確化する。

## 既存要件・成果物との関連

- SPEC: integrity-contracts「NG baseline 運用手順」
- 実装: applyNgBaseline の分類ロジック

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2151 (Issue #2136 / OU-002, Epic #2134 Wave 2) SPEC確定候補 セクション 2
- 元 item: intake-2026-08-16-spec-cand-ng-baseline-legacy-provenance-reporting.md
