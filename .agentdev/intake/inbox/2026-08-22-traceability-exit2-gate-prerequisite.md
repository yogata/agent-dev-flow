# traceability check の exit code 2 と工程ゲート化の前提整理

## 観測

`agentdev-traceability` check（`--root .`）が missing-implementation / missing-verification 計35 findings（REQ-010-064〜070、REQ-032-022、REQ-045-001〜007 等）を検出し exit code 2 で終わる。Wave 3（PR #2397）時点でも base 由来のまま未解決（PR #2397 では stash による base 状態再実行で findings 増減 0 を確認済み）。検出 REQ 行の棚卸しは別 item（traceability-missing-implementation-inventory）のとおり。check を工程 gate として採用するには非ゼロ exit の取扱い（fail-open 境界、既知 baseline 登録、検証対応必須行のみの計上への切替）の前提整理が必要。

## 今回扱わない理由

対応宣言の登録は Design ファイル編集を伴い design-save 系手続きの責務。Epic #2378 の残 Wave（Wave 4 OU-010 コーパス機械是正）で ADF-COVERS 宣言の追記機会が残るため、本 case-close では前提整理の記録のみ。

## 影響

traceability check を gate 化した場合、未解決 35 findings が gate 不通過として扱われ、check_integrity NG baseline と同種の既知管理仕組みが定義されないままでは恒常ブロックになる。

## レビューで決めること

- exit code 2 の gate における取扱い: fail-open 継続、既知 baseline 登録、検証対応必須行のみの計上への切替のいずれか
- 35 findings の対応宣言登録の実施単位（Wave 4 に合わせるか、独立 case とするか）

## 根拠

- PR #2397 本文「Findings / Capture候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2397 ）
