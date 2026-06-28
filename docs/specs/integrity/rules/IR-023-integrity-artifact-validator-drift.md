---
status: accepted
---

# IR-023: Integrity artifact validator drift

| Field | Value |
|-------|-------|
| rule_id | IR-023 |
| description | Integrity scripts/tests/fixtures/SKILL.md/SPEC 間で drift がないこと |
| severity | heuristic |
| category | integrity-rule-gap |
| detection_method | script の検査カテゴリと SKILL.md/SPEC の定義照合 |
| affected_artifacts | [integrity scripts, SKILL.md, SPEC] |
| related_req | [REQ-0108-147] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit, impact-guard |
| false_positive_risk | 中 |
| regression_test | prevention_gates.test.ts |
| baseline_status | resolved |
| finding_route | intake+learning |
| triage_action | drift を解消 |
| last_verified | 2026-06-06 |
