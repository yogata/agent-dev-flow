---
status: accepted
---

# IR-005: ADR ↔ REQ 相互参照存在

| Field | Value |
|-------|-------|
| rule_id | IR-005 |
| description | ADR の Related REQ セクションの REQ ID と、REQ の ADR index からの参照が双方向に存在すること |
| severity | strict |
| category | broken-reference |
| detection_method | ADR から REQ ID 抽出 → 存在確認、逆方向も確認 |
| affected_artifacts | [ADR, REQ, ADR index] |
| related_req | [REQ-0108-005] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 中。廃止 REQ 参照は別 rule で判定 |
| regression_test | check_integrity.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 参照を追加/修正 |
| last_verified | 2026-06-06 |
