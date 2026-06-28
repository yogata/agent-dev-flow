---
status: accepted
---

# IR-002: 現行 REQ 必須 frontmatter fields

| Field | Value |
|-------|-------|
| rule_id | IR-002 |
| description | 現行 REQ に id, title, created, updated が存在すること |
| severity | strict |
| category | document-drift |
| detection_method | frontmatter field 存在確認 |
| affected_artifacts | [現行 REQ] |
| related_req | [REQ-0108-001] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低。必須 field 欠落は確実な NG |
| regression_test | commands_structure.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 欠落 field を追加 |
| last_verified | 2026-06-06 |
