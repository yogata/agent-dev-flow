# Intake Item: req-health-metrics AUTOGEN 計測例テーブルの retired REQ 行残存

## 発生源

- PR: #2173 (Issue #2164 / OU-007, Epic #2162 Wave 1)
- 発生 phase: case-run 検証（TS-007-OU007 residual grep）
- capture 分類: intake（AUTOGEN 再生成対象の記録）

## 問題

docs/specs/quality/req-health-metrics.md の AUTOGEN 計測例テーブル（req-metrics-measurement-example）に REQ-022 行が残存している（REQ-013、REQ-023、REQ-024 行も同様に残存）。この staleness が check_integrity の retired-req-primary-ref warning 4件および IR-061 index-generation-consistency ng の原因である。

## 推奨対応

generate_indexes.ts による再生成は Issue #2167（OU-010、Wave 2）の担当 scope。本 PR（#2173）の変更（docs/README.md +1行）は同テーブルの入力（REQ ファイル群）に影響しないため、委譲条件上の自己再生成要件（入力への直接影響 + check_integrity 検出）を満たさず見送った。#2167 実行時に本項を解消確認の対象とする。

## 関連

- Issue: #2164 (CLOSED), Epic: #2162
- PR: #2173 (Findings / Capture候補 セクション intake 1件目)
- 再生成担当: #2167（OU-010）。既知の「generate_indexes.ts 起動不能」intake（intake-2026-08-16-ou006-generate-indexes-docmap-deadfn-exit.md）の解消後に実行可能
