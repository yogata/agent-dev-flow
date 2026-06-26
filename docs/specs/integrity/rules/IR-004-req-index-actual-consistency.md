# IR-004: REQ index ↔ 現行 REQ 一致

| Field | Value |
|-------|-------|
| rule_id | IR-004 |
| description | docs/requirements/README.md の 現行 REQ 一覧と実際の REQ ファイルが一致すること |
| severity | strict |
| category | document-drift |
| detection_method | README から REQ ID 抽出 → glob 結果と照合 |
| affected_artifacts | [REQ index, 現行 REQ] |
| related_req | [REQ-0108-003] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低 |
| regression_test | commands_structure.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | README に REQ 追加/削除 |
| last_verified | 2026-06-06 |
