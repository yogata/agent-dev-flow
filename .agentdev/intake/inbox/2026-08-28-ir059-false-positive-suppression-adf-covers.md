# IR-059 detector の ADF-COVERS 宣言検出（誤検出抑制未整備）の扱い

## 観測

配布依存境界 最終 gate（check_distribution_boundary.ts、source profile）が、配布物内の ADF-COVERS 宣言・対応参照コメント（REQ-053 / REQ-052-011 / DEC-023 / DEC-016 等）を concrete-id 違反として検出する。Issue 2444 の case-close 最終 gate で新設 plugin 配下 3 ファイルが対象になった。検出された行は REQ-012 トレーサビリティ契約が要求する対応宣言であり、除去すると traceability check が fail する（両契約が同一表記を要求・禁止する衝突構造）。

IR-059 の exemption 節は「検査対象を説明するためのパターン定義と検査対象path宣言」を許容するが、detector 実装には ADF-COVERS 宣言の誤検出抑制（false-positive suppression）が未整備である（distribution-boundary.md は誤検出抑制を検出器の挙動として個別承認例外と分離して定義）。

## 今回扱わない理由

当該 Case の gate 判定としては concrete_path_hits: 0、fixed_url_hits: 0 であり consumer 解決不能参照の実質違反は存在せず、検出は無効分類として処理済み。detector の suppression 実装整備と配布物の concrete-id 一括抽象化は既存 intake item（2026-08-25-src-opencode-concrete-id-baseline10.md）と連動する別整備の性質を持つ。

## 影響

配布物に対応宣言を置くすべての Case で、配布依存境界 最終 gate が正規の ADF-COVERS 宣言を concrete-id として検出し続ける。triage_action（generic 表記へ是正）を機械的に適用すると traceability 契約と衝突するため、Case ごとに無効分類の判断コストが継続する。

## レビューで決めること

- detector への ADF-COVERS 宣言 suppression 実装を追加するか（IR-059 exemption 節の趣旨に沿った検査対象宣言の機械的識別）
- 追加する場合の suppression 対象範囲（宣言行のみか、対応参照コメントを含むか）
- 既存 intake item（src-opencode-concrete-id-baseline10）の抽象化整備と一本化するか分離するか

## 根拠

- Issue 2444 case-close 対応記録コメント（配布依存境界 最終 gate finding 詳細、無効分類）
- docs/designs/integrity/rules/IR-059-distribution-reference-boundary.md（exemption 節、finding_route: intake、triage_action）
- docs/designs/integrity/distribution-boundary.md（誤検出抑制の位置づけ）
