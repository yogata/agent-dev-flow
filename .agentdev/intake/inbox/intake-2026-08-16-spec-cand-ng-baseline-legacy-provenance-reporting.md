# Intake Item: SPEC確定候補 — NG baseline 運用手順の報告分類（legacy provenance 承認追加の位置づけ）

## 発生源

- PR: #2151 (Issue #2136 / OU-002, Epic #2134 Wave 2)
- 発生 phase: case-close Step 3-2 SPEC 確定フロー（パターン (c) 見送り、後続へ委ねる記録）
- capture 分類: intake（SPEC 更新候補。`## SPEC確定候補` 由来。`## Findings / Capture候補` とは区別）

## 問題

integrity-contracts SPEC「NG baseline 運用手順」の報告分類では、provenance が `legacy` の承認済み追加 entry は報告上「承認済み追加分」ではなく「baseline-known」へ集計される（`applyNgBaseline` の分類ロジック由来）。由来ラベル `legacy` を承認追加に使う場合の報告上の位置づけが明確でない。

## 推奨対応

integrity-contracts SPEC で由来ラベルと報告分類の対応を明確化する。

## 関連

- Issue: #2136 (CLOSED), Epic: #2134
- PR: #2151 (SPEC確定候補 セクション 2)
