---
status: accepted
---

# IR-014: reference/ 残存検出

| Field | Value |
|-------|-------|
| rule_id | IR-014 |
| description | .opencode/skills/**/reference/ (単数形) ディレクトリが残存していないこと |
| severity | strict |
| category | obsolete-structure |
| detection_method | glob で reference/ ディレクトリ検索 |
| affected_artifacts | [skills] |
| related_req | [REQ-0103-013, 039, REQ-0108-039, 040, 094] |
| related_spec | [artifact-responsibilities.md] |
| gate_level | full-audit |
| false_positive_risk | なし |
| regression_test | lint_skills.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | reference/ を references/ にリネーム |
| last_verified | 2026-06-06 |
