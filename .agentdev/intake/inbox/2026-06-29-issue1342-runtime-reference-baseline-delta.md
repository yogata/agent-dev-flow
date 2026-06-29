# docs-check RuntimeReference カテゴリの baseline (REQ-055) との delta がノイズを発生させる

## 観察

PR #1347 の docs-check 実行時、RuntimeReference カテゴリで New violation (delta) が多数報告された。今回の修正（`references/contracts.md` → `agentdev-gh-cli/references/contracts.md`）により baseline (REQ-055) との齲齒が生じたため。本来は今回の変更と無関係な既存の baseline 由来の問題が delta として表面化した。

## 修正されなかった理由

本 Issue #1342 のスコープは AG-001/AG-002 の機械的修正のみ。RuntimeReference baseline の更新は別作業（baseline 整理）であり、本 Issue に含めると完了条件の意味が変わる。PR 本文 Findings に記録済み。

## 課題

- docs-check の RuntimeReference baseline (REQ-055) を現在の docs/src 状態へ更新すべきか
- delta 通知の閾値・除外設定を見直すべきか
- baseline 更新を誰が・どのタイミングで実施するかの運用ルール明確化

## 根拠

PR #1347 本文「## Findings / Capture候補」より引用:

> RuntimeReference delta ノイズ: docs-check 実行時、RuntimeReference カテゴリで New violation (delta) が多数報告された。今回の修正（references/contracts.md → agentdev-gh-cli/references/contracts.md）により baseline (REQ-055) との齲齒が顕在化した。本来は既存の baseline 由来の問題が delta として表面化したものであり、今回の変更と無関係。本 Issue の test strategy（TS-001/TS-002）対象外ではあるが、baseline 更新で解消するノイズ。

## 観測元

- PR #1347
- Issue #1342
