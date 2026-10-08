# ADF-COVERS(design) 宣言と本文対応節の不一致（4 Design）

- 出所: inspect-docs 20261008T025952Z F-08（backlog-auto stage 1）
- 種別: 表現是正（宣言と本文の整合。対応節追記または宣言削減）
- 対象: 4 Design

## F-08: ADF-COVERS(design) 宣言のみで本文に対応節・参照を欠く 4 Design

- target:
  - (1a) `docs/designs/foundations/v4-operating-model.md:8`（REQ-103-020/021）
  - (1b) `docs/designs/foundations/v4-migration-and-release.md:8`（REQ-103-026）
  - (1c) `docs/designs/responsibilities/artifact-contracts.md:8`（REQ-103-024/025）
  - (1d) `docs/designs/foundations/document-model.md:12`（REQ-103-023）
- evidence: REQ-103 の 11 Design のうち 4 Design が `ADF-COVERS(design)` 宣言のみで本文に対応節・参照を欠く。他の Design（v4-quality-gate-model、v4-runtime-execution-model、v4-durable-state-and-recovery、v4-responsibility-boundaries 等）は専用節で対応しており、本文に REQ 行を明示するのが本 Wave の確立パターン。
- severity: (1a)(1b) medium / (1c)(1d) low / confidence: (1a) medium-high、(1b)(1c) medium、(1d) low
- source_of_truth: REQ-103 受け入れ条件対応表、artifact-responsibilities.md ADF-COVERS 配置先カタログ「正規所有 Design の該当節」

## 処置方針

- 各 Design について対応節の追記または宣言の削減（(1a) は所有者重複解消を含む）。
- (1a) の論点詳細（review による証拠精度化）: REQ-103-020/021 は **v4-operating-model.md 本体内では** :8 の宣言行にのみ出現。docs/designs/ 全体では v3-v4-crosswalk.md:28 に REQ-103-020 の言及（歴史語彙保持の根拠参照であり design 対応節ではない）、:65 に REQ-103-020/021 の verification 割当明記（IR-015/IR-040/IR-041 所有）が存在する。design 対応の所有形態としては crosswalk:28 は「二重宣言」と評価しない（歴史語彙の根拠参照）。是正判断時はこの区別を維持すること。
- (1c) の論点拡張（review 追加発見）: artifact-responsibilities.md:9 に REQ-103-024 の `ADF-COVERS(implementation)` 宣言があり、REQ-103-024 は artifact-contracts（design）と artifact-responsibilities（implementation）の 2 Design で宣言が存在する。design/implementation の役割分担として正当か、宣言重複かを是正判断に含める。

## review 検証記録（adversarial-review 2026-10-08）

- Stream A: 4 Design とも宣言行のみで本文出現 0 件（宣言行除去 grep）を確認。REQ-103-021 は IR-040/IR-041 の verification 宣言（rules/IR-040:8・IR-041:8）が担う点も確認。
- Stream B: (1a) 証拠文の精度化（crosswalk:28/:65 の位置づけ）と (1c) の artifact-responsibilities.md:9 重複発見を指摘（本成果物に反映済み）。
