# IR-055 baseline-known heuristic 52 violations の docs corpus 側 cleanup 判断

## 観測

ir-055-baseline.json 再整備後、heuristic 52 violations が baseline-known として記録されている（docs/designs/ 等参照の既知残存・concrete path 系）。docs corpus 側 cleanup は OU-001 以降の工程で判断される領域とされていたが、残存分の個別判断（cleanup・baseline 維持・検出器調整）は未了。

## 今回扱わない理由

baseline 記録は隠蔽ではなく既知残存の記録として実施されたものであり、個別 violations の cleanup 判断は各OU のスコープ判断が必要。Issue #2508 の対象は baseline 方式の確定・適用まで。

## 影響

heuristic 52 violations が baseline に残存し、docs corpus の現行化完了度の可視性が下がる。

## レビューで決めること

- baseline-known heuristic 52 violations の個別分類（cleanup 対象・恒久 baseline・検出器調整）
- Wave 2（OU-009/OU-010）以降の cleanup スコープへの取り込み要否

## 根拠

- PR #2524 本文「Findings / Capture候補」finding 3（回収元: https://github.com/yogata/agent-dev-flow/pull/2524 ）
