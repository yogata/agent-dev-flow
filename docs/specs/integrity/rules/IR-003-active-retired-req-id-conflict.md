# IR-003: Active/廃止 REQ ID 重複

| Field | Value |
|-------|-------|
| rule_id | IR-003 |
| description | 現行 REQ と 廃止 REQ の間で ID 重複がないこと |
| severity | strict |
| category | canonical-conflict |
| detection_method | ID set の intersection 確認 |
| affected_artifacts | [現行 REQ, 廃止 REQ] |
| related_req | [REQ-0108-082] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | なし |
| regression_test | commands_structure.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 重複 ID を解消 |
| last_verified | 2026-06-06 |
