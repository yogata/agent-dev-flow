# v51 Design の削除済み一時成果物（RU）現在形参照の付け替え

- 出所: inspect-docs 20261013T090730Z DS09（backlog-auto stage 1）
- 種別: 表現是正（一時成果物 RU への現在形参照・所有宣言の解消。横断是正候補）
- 対象: docs/designs/workflows/v51-phase-driven-collaboration-model.md:70、docs/designs/workflows/v51-phase-transition-and-coexistence-model.md:54,60

## DS09: 一時成果物 RU への現在形参照・所有宣言。参照解決不能リスク

- category: Design（一時成果物 RU への現在形参照・所有宣言。参照解決不能リスク）
- target: `docs/designs/workflows/v51-phase-driven-collaboration-model.md:70`、`docs/designs/workflows/v51-phase-transition-and-coexistence-model.md:54,60`
- evidence: v51-phase-driven:70「工程駆動ルートの経路別所有境界とDesignのdraftからacceptedへの昇格は、RU-0002 が所有する v4-standard-lifecycle 更新と整合させる」。v51-phase-transition:54「RU-0002 の B01〜B16 と B16 能力群対応表、および TS-001〜TS-014 を検証時参照として用いる」、:60「RU-0001からの統合接続」。一方で `.agentdev/backlog/req-units/` は空（実確認）、REQ-008-010 により RU-0001/RU-0002 は case-ready 成功後の削除済み正当状態。accepted Design が削除済み一時成果物を現在形の所有者・検証時参照として指し、リポジトリ内で解決できない。
- severity: medium
- confidence: high（RU 不在・削除契約は事実）/ medium（Case Issue #3654 等への内容退避の意図の可能性）
- source_of_truth: REQ-008-010、REQ-008-011、v4-standard-lifecycle:69-71（RU-0002 由来の更新は既に本体へ反映済み）
- recommended_route: 表現是正候補。所有・参照先を永続成果物（v4-standard-lifecycle 本体、v4-v5-crosswalk、Decision 承認記録）へ付け替え、RU は出所の履歴注記に留める。
- ng_classification: 今回修正対象候補（v51 Design 2件は今回 delta の新規 accept）。
- notes: 同型の参照は checker-execution-contracts.md:22（RU-0004/RU-0007、背景説明で影響小）、design-health-metrics.md:55（RU-0001 AG-002、pre-existing の出所注記型）にも存在。横断是正として育成する価値がある。

## 処置方針

1. v51 Design 2件の RU-0001/RU-0002 参照を、永続成果物（v4-standard-lifecycle 本体〔RU-0002 由来の更新は既に反映済み〕、v4-v5-crosswalk、Decision 承認記録）への参照へ付け替える
2. RU は出所の履歴注記（「本規定は RU-0002 由来」等）に留める
3. 同型の横断是正対象: checker-execution-contracts.md:22（RU-0004/RU-0007）、design-health-metrics.md:55（RU-0001 AG-002）を同時整理の候補として含める

## 処置判断の根拠（inspect-promote 2026-10-13）

- `.agentdev/backlog/req-units/` が空であることを実確認（RU-0001/RU-0002 は REQ-008-010 に従い case-ready 成功後に削除済みの正当状態）
- v51-phase-driven-collaboration-model.md:70 の「RU-0002 が所有する v4-standard-lifecycle 更新」参照を現物実読確認
- 削除済み一時成果物への現在形参照は参照解決不能であり、accepted Design の永続性契約と不整合。横断是正の価値あり

## review 検証記録（adversarial-review 2026-10-13）

- Stream B: v51 Design :70 現物実読と req-units/ 空確認で参照解決不能を再確認。
- Jev 評価: promote（0.56）で最終判断と一致（観測 20261013T094827Z-5dc0 d8）。
