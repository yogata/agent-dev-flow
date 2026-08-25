# traceability check の missing-implementation 検出の棚卸し（REQ 行対応宣言の未登録群）

## 観測

`agentdev-traceability` check（`--root .`）が missing-implementation を検出する: REQ-010-064〜070、REQ-032-022、REQ-045-001〜009、REQ-046-001〜010、REQ-047-001〜008。コーパス全体の既存状態であり特定 PR 起因ではない。REQ-010-069/070 は Wave 2（Issue #2383、PR #2395）で実装済みだが ADF-COVERS 宣言は Design 側に未登録（REQ-032-022 も同様、別 item 参照）。REQ-045〜047 系は ADF-COVERS(implementation) 行の追記または verification-scope-catalog.md 任意行登録の要否が個別に未整理。

## 今回扱わない理由

対応宣言の登録は Design ファイル編集を伴い design-save 系手続きの責務。進行中の Epic #2378 Wave との対応関係（実装済み/未実装の区別）を踏まえた整理が必要なため本 case-close では棚卸し記録のみ。

## 影響

QG-4 のトレーサビリティ独立再検査（fail-open 運用）で対応欠落が報告され続け、実装済み要件の完了判定ノイズになる。

## レビューで決めること

- 検出 REQ 行ごとの対応付け方針: ADF-COVERS(implementation) 行追記、verification-scope-catalog.md 任意行登録、恒常的検証手段の新設のいずれか
- REQ-045〜047 系（横断正規化・不変条件・規則所有権）の実装対応の正規成果物上の表現方法

## 根拠

- PR #2394 本文「Findings / Capture候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2394 ）
- PR #2392 本文「Findings / Capture候補」（REQ-032-022 個別、回収元: https://github.com/yogata/agent-dev-flow/pull/2392 ）
