---
status: accepted
---

# IR-015: 廃止 REQ 現行参照検出

| Field | Value |
|-------|-------|
| rule_id | IR-015 |
| description | 廃止 REQ が現行要件判断の第一参照として案内されていないこと |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | 現行 docs 内の 廃止 REQ 参照検出、コンテキスト判定 |
| affected_artifacts | [REQ, SPEC, guides] |
| related_req | [REQ-0108-070-074, 136] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 中。mapping-table 等の履歴参照は除外 |
| regression_test | commands_e2e.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 参照に [retired] 注記を追加 |
| last_verified | 2026-06-06 |
