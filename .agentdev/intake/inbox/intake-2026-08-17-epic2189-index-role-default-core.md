# Intake Item: 標準コアの索引・集約成果物の取扱い — デフォルト node_types 3種制約との整合再検討

## 発生源

- PR: #2198 (Issue #2190 / OU-0001, Epic #2189 Wave 1)
- 発生 phase: case-run 検証（Findings / Capture候補）
- capture 分類: intake（設計判断候補）

## 問題

デフォルト3 node_types（requirement / decision / specification）を AG SPEC 検証観点「デフォルト node_types 3種のみ」との整合で維持した結果、索引・集約成果物は augmentation の role 宣言による識別となり、デフォルト設定だけでは README 等が索引構造問い合わせの対象にならない（specification ルールの README 除外パターンが名称ベースで残る）。

## 推奨対応

TIM 語彙カタログ SPEC（docs/specs/foundations/traceability-model.md、PR #2196 で実体整備済み）の「索引・集約成果物の役割識別」との整合を踏まえ、索引・集約成果物のデフォルトコアでの扱い（専用 node_type 追加の要否）を再検討する。カタログ側は役割識別を「名称ではなく役割」と定義しており、実装の role 宣言方式と方向は一致している。

## 関連

- Issue: #2190 (CLOSED), Epic: #2189
- PR: #2198 (merged f4ac8d70)
- SPEC: docs/specs/foundations/traceability-model.md「索引・集約成果物の役割識別」
