# REQ-103 内部品質: AC 判定対象数の不整合と作業記録の混入

- 出所: inspect-docs 20261008T025952Z F-01・F-02（backlog-auto stage 1）
- 種別: 表現是正（文書修正）
- 対象 REQ: REQ-103

## F-01: AC 判定対象数の内部不整合（AC-25 vs AC-26）

- target: `docs/requirements/REQ-103.md:49`、`REQ-103.md:53`、`REQ-103.md:82`
- evidence: REQ-103-031（:49）は「受け入れ条件対応節に定義のある AC-01 から AC-25 までを…個別に判定し」と宣言する一方、受け入れ条件対応節前置き（:53）は「受け入れ条件 AC-01〜AC-26 を個別に判定する」と宣言し、対応表（:82）は AC-26（= REQ-103-031（判定規則）／TS-017）を実際に定義する。判定対象集合の定義が REQ 内で 2 通りに矛盾し、完了判定の集計閉包（25 か 26 か）が一意に確定しない。
- severity: high / confidence: high
- source_of_truth: 現行 REQ-103-031 自身
- 処置方針: どちらかに統一。AC-26 が判定規則そのものを指す自己言及除外の意図なら :53 の「AC-01〜AC-26」が誤り、AC-26 を判定対象に含めるなら :49 の「AC-25 まで」が誤り。
- 注意: REQ-103 は Case #3530 の AC 判定完遂済みの扱いのため、修正時に完了訂正経路（判定記録側の集計への影響確認）を含む判断が必要。req-define 壁打ちで処置解を確定すること。
- docs-check route: REQ 内 AC 範囲記述（「AC-01 から AC-NN まで」型）と AC 表定義の一致機械検査 — 新規 IR 候補。

## F-02: REQ-103 への作業記録・作業経緯の混入

- target: `docs/requirements/REQ-103.md:53`（RU-0181）、`REQ-103.md:104`（session-supervisor 取り下げ経緯）、`REQ-103.md:46`（REQ-103-028 baseline tag 具体値）
- evidence: (1) :53「RU-0181 および要件ドラフトの消費後も…一意に再構成できる」— RU 番号（一時成果物由来の作業記録識別子）が REQ 本文に残存（REQ-008-002 と緊張）。(2) :104「ユーザーの最新指示により並行作業は取り下げ。本要件の全面再評価の評価対象からは除外しない」— 作業経緯・指揮系統の記述が適用範囲節に混入。(3) REQ-103-028 の baseline tag 具体値 `baseline-v4-canonical-convergence-20261007` は移行結果・リリース証跡寄り（差分検証可能性の契約としての側面あり）。
- severity: low〜medium / confidence: medium（(1)(2) は high 寄り、(3) は low）
- source_of_truth: document-model.md（REQ 内容契約、cleanup 対象カテゴリ）、REQ-008-002
- 処置方針: RU-0181 は「当該 Definition の受け入れ条件対応節」への置換、:104 は対象外節の現在像として再表現、(3) baseline tag は差分検証契約の側面を考慮して留保。

## 統合・関連指示

- learning/intake promoted との重複なし（ REQ-103 内部品質を扱う成果物は他系統に存在しない）。
- F-03（REQ-103×REQ-096 統合論点）は別成果物 `finding-20261008-req103-req096-duplicate.md` として分離済み。本成果物の修正と F-03 の構造整理は req-define 壁打ちで同時進行可能。

## review 検証記録（adversarial-review 2026-10-08）

- Stream A・Stream B ともに :49/:53/:82/:104/:46 の行引用を実測検証し一致を確認（反証不成立、分類 promote 支持）。
