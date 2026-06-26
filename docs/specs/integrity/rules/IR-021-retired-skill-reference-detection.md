# IR-021: 廃止済み skill 参照検出

| Field | Value |
|-------|-------|
| rule_id | IR-021 |
| description | agentdev-workflow-reporting 等の廃止済み skill への参照が残存していないこと |
| severity | strict |
| category | obsolete-structure |
| detection_method | 正規表現で廃止 skill 名検出 |
| affected_artifacts | [commands, skills, SPEC] |
| related_req | [REQ-0108-126-128] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低 |
| regression_test | commands_e2e.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 廃止 skill 参照を削除 |
| last_verified | 2026-06-06 |
