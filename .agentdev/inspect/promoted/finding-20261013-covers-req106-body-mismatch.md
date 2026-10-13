# v4-traceability-model の REQ-106/107 covers 注記と本文実体の乖離

- 出所: inspect-docs 20261011T033142Z DS01（backlog-auto stage 1）
- 種別: 表現是正（covers 宣言と本文実体の整合）
- 対象: docs/designs/foundations/v4-traceability-model.md:10-11、docs/designs/skills/agentdev-traceability.md:9,11、docs/designs/commands/case-revise.md:9

## DS01: Design 宣言と本文実体の乖離、責務境界の観察

- category: Design 宣言と本文実体の乖離、責務境界の観察
- target: `docs/designs/foundations/v4-traceability-model.md:10-11`、`docs/designs/skills/agentdev-traceability.md:9,11`、`docs/designs/commands/case-revise.md:9`
- evidence: v4-traceability-model の implementation covers 注記は REQ-106/107 の構成実体を同 Design の v5 語義更新節が所有するとする。しかし REQ-106 の差分影響設計は agentdev-traceability の impact 拡張節に、利用側接続は case-revise に記述される。各ファイルの design covers には scope 修飾がない。
- severity: medium
- confidence: high（本文実体の所在）、medium（意図的な多面所有の可能性）
- source_of_truth: REQ-106、REQ-107、REQ-103-014
- recommended_route: 表現是正候補。covers の REQ-106 範囲を本文実体に合わせるか、設計面の分担を明示する。
- ng_classification: 今回修正対象候補（関連 covers 宣言は今回の delta で追加された）。
- notes: 複数 edge の存在だけを責務重複の根拠にしていない。主根拠は REQ-106 implementation 宣言の注記と実際の本文所在の乖離。scope を明記した複数 edge は本リポジトリの通常パターンであり、重複と断定しない。

## 処置方針

1. v4-traceability-model.md の REQ-106/107 implementation covers 注記の範囲を、本文実体の実際の所在（agentdev-traceability impact 拡張節・case-revise 利用側接続）に合わせて修正する
2. または、設計面（v5 語義更新節）と構成実体面（agentdev-traceability・case-revise）の分担を covers 注記に明示する

## 処置判断の根拠（inspect-promote 2026-10-13）

- v4-traceability-model.md:11 に「REQ-106-001〜009, REQ-107-001〜008（v5 変更影響・追跡品質検証の設計・構成実体は本 Design 本文の v5 語義更新節が所有する）」注記が実在（現物実読確認）
- 対象 covers 群の中で本文実体の所在が現物確認済みで是正方向が確定しているのは本件のみ（DS02〔RA-007 実在未確認〕・DS03〔様式改善〕・DS04〔redirect 対象範囲判断未了〕は defer）
- covers 系の様式整備（scope 注記付与基準）は DS02〜DS04 の再評価時に同時確認

## review 検証記録（adversarial-review 2026-10-13）

- Stream B: v4-traceability-model.md:8-11 の covers 宣言実在を現物実読で再確認。
- Jev 評価: promote（0.61）で最終判断と一致（観測 20261013T094553Z-2a11 d4）。
