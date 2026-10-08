# 完了事象の現在形記述の時制是正（v3 supersede・Wave 進行）

- 出所: inspect-docs 20261008T025952Z F-11・F-13（backlog-auto stage 1）
- 種別: 表現是正（陳腐化参照の時制訂正）
- 対象: v4-responsibility-boundaries.md・v4-quality-gate-model.md

## F-11: Wave 進行の現在形記述・後継 Decision 非言及

- target: `docs/designs/foundations/v4-responsibility-boundaries.md:133-136`
- evidence: 「処遇判定…は Wave 2-5 が実行する」（完了後も未実施の現在形。Wave 2-5 は a9535e6a で closure 済み、処遇判定は RA-005〔aafcfa16〕で確定済み）、「DEC-044 決定3 の後継 Decision は Wave 2-1」（後継 Decision は既に DEC-052 として存在するが非言及）。
- severity: low / confidence: medium
- source_of_truth: DEC-052、REQ-103-029（有限完了）
- 処置方針: DEC-052 参照の確定 + 完了形への訂正。

## F-13: 廃止済み v3 Design への現在形言及

- target: `docs/designs/quality/v4-quality-gate-model.md:93`
- evidence: 「v3 quality/quality-gates.md は本 Design により supersede される。」— 当該 v3 ファイルは現存せず（実体削除済み、docs/designs/quality/ 配下に不在を確認）、「supersede される」の未完了現在形が陳腐化。
- severity: low / confidence: medium
- source_of_truth: crosswalk-inventory.md（supersede 実行済み行・第6段 executed）
- 処置方針: 「supersede した（吸収完了）」への時制訂正。

## 統合指示（旧 defer 項目の解消）

- DS-19（20260928T145126Z:47-55 defer 残置「v4-quality-gate-model.md の executed supersede の未遂形記述」、target :90 → 行シフトで :93）は F-13 と同一対象。本成果物の promote に伴い DS-19 は統合解消とする。20260928T145126Z ファイル側に統合注記を追記済み。
- DS-19 の旧 recommended_route「KNOWN DS-03 と同一バッチでの時制整理時に併合判断」のうち DS-03（旧 defer・別対象）は 20260928 ファイルの defer を継続する。時制整理の実施タイミングは backlog-review → req-define 側で判断する。

## review 検証記録（adversarial-review 2026-10-08）

- Stream A: F-13 と DS-19 の同一対象性（行シフト :90→:93）を指摘（統合指示に反映）。:133-136 の現在形と Wave 2-5 完了（a9535e6a）・RA-005 確定（aafcfa16）・DEC-052 実在（docs/README.md:154）の対比を実測確認。
- Stream B: v3 quality-gates.md の実体不在（glob 確認）と F-11/F-13 の証拠一致を確認。
