---
status: accepted
---

# IR-010: ADR status 正規化

| Field | Value |
|-------|-------|
| rule_id | IR-010 |
| description | ADR status が正規形式であること。旧形式 superseded-by:[ADR-XXXX] を検出 |
| severity | strict |
| category | obsolete-structure |
| detection_method | frontmatter status field 検査 |
| affected_artifacts | [ADR] |
| related_req | [REQ-0108-121] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低 |
| regression_test | check_integrity.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | ADR status を正規形式に更新 |
| last_verified | 2026-06-06 |
