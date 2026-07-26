---
status: superseded
---

# IR-011: Mapping table 全件記録（廃止済み）

| Field | Value |
|-------|-------|
| rule_id | IR-011 |
| description | （廃止済み）mapping-table.md の廃止に伴い本ルールは廃止済み。番号維持のためファイルは残置 |
| severity | - |
| category | document-drift |
| detection_method | - |
| affected_artifacts | - |
| related_req | [v2:REQ-0108-083〜088] |
| related_spec | [integrity-contracts.md] |
| gate_level | - |
| false_positive_risk | - |
| regression_test | - |
| baseline_status | superseded |
| finding_route | - |
| triage_action | - |
| last_verified | 2026-06-06 |

## 廃止理由

v3 再構築に伴い `docs/requirements/mapping-table.md` は廃止済み。
本ルールが検査対象としていた mapping-table.md が存在しないため、IR-011 は番号維持のために tombstone として残置する。

## 履歴 ID 参照

`related_req` の `v2:REQ-0108-083〜088` は tag `v2.4.0` における v2 世代の要件 ID であり、現行 v3 の 3 桁 REQ（REQ-001〜REQ-011）には該当しない。
mapping-table 全件記録契約を担っていた v2 要件群の tombstone 参照として記録する。
