# docs-check RuntimeReference カテゴリの baseline (REQ-055) との delta がノイズを発生させる

## 観測内容

PR #1347 の docs-check 実行時、RuntimeReference カテゴリで New violation (delta) が多数報告された。今回の修正（`references/contracts.md` → `agentdev-gh-cli/references/contracts.md`）により baseline (REQ-055) との齲齒が生じたため。本来は今回の変更と無関係な既存の baseline 由来の問題が delta として表面化した。

## 影響

- docs-check 実行時に RuntimeReference カテゴリで New violation (delta) が多数報告される
- delta 通知がノイズとなり、今回の変更と無関係な既存問題が表面化する

## 課題

- docs-check の RuntimeReference baseline (REQ-055) を現在の docs/src 状態へ更新すべきか
- delta 通知の閾値・除外設定を見直すべきか
- baseline 更新を誰が・どのタイミングで実施するかの運用ルール明確化

## 既存要件との関連

- REQ-055: docs-check RuntimeReference baseline
- AG-001 / AG-002: PR #1347 で機械的修正完了

## 観測元

- PR #1347
- Issue #1342
