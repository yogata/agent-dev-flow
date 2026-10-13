# glossary・v4-standard-lifecycle の Wave 定義と DEC-055 の不一致現行化

- 出所: inspect-docs 20261011T033142Z DS06/GR01（backlog-auto stage 1）
- 種別: 表現是正（用語の現行性乖離の解消）
- 対象: docs/guides/glossary.md:75、docs/designs/workflows/v4-standard-lifecycle.md:24,73

## DS06/GR01: Wave 用語の現行性乖離

- category: Wave 用語の現行性乖離
- target: `docs/designs/workflows/v4-standard-lifecycle.md:24,73`、`docs/guides/glossary.md:75`
- evidence: v4-standard-lifecycle と glossary は Wave を「実行スケジューリング単位」と現在形で記述する。DEC-055 は Wave を意味的な依存関係のまとまりとする。glossary は上位 Decision の置換内容と不一致であり、v4-v5-crosswalk は lifecycle の用語統合を後続処理として記録している。
- severity: medium
- confidence: medium
- source_of_truth: DEC-055、REQ-108-008、v4-v5-crosswalk の REQ-035-006 処遇記録
- recommended_route: 表現是正候補。glossary を現行化するか移行期注記を付し、lifecycle の残存語彙は crosswalk の棚卸しと同期する。
- ng_classification: glossary は今回修正対象候補、lifecycle の語彙は pre-existing（crosswalk 管理下）。
- notes: REQ-108-012 の移行期実行契約維持により、用語定義の更新時期には判断余地がある。DS05 の制御矛盾とは別の対象である。

## 処置方針

1. glossary.md:75 の Wave 定義を DEC-055 の定義（意味的な依存関係のまとまり）へ現行化する。または移行期の注記（v4 実行スケジューリング単位としての旧定義 → v5 で DEC-055 が再定義）を付す
2. v4-standard-lifecycle.md:24,73 の Wave 語彙は v4-v5-crosswalk の REQ-035-006 処遇記録（棚卸し対象）と同期して更新する

## 処置判断の根拠（inspect-promote 2026-10-13）

- glossary.md:75 に「Wave | Epic 内の依存関係と並列実行可能性を表す実行スケジューリング単位。Epic Issue 本文から読み取る内部構造である（REQ-035-006）」が現物実在（grep 実確認）
- glossary 側は上位 Decision（DEC-055）との直接不一致であり索引陳腐化として明確。lifecycle 側語彙は crosswalk 管理下の意図的管理のため是正要求の対象を glossary 現行化に主置きする

## review 検証記録（adversarial-review 2026-10-13）

- Stream B: glossary.md:75 の現物実読で「実行スケジューリング単位」の現在形記述を再確認。
- Jev 評価: promote（0.51）で最終判断と一致（観測 20261013T094553Z-2a11 d9）。
