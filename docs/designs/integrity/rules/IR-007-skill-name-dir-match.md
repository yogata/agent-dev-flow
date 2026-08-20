---
title: "IR-007: Skill frontmatter name ↔ dir"
status: accepted
created: 2026-08-20
updated: 2026-08-20
---

# IR-007: Skill frontmatter name ↔ dir

| Field | Value |
|-------|-------|
| rule_id | IR-007 |
| description | .opencode/skills/{dir}/SKILL.md の frontmatter name が {dir} と一致すること |
| severity | strict |
| category | document-drift |
| detection_method | directory 名と frontmatter name の比較 |
| affected_artifacts | [skills] |
| related_req | [REQ-010] |
| related_design | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低 |
| regression_test | lint_skills.test.ts |
| finding_route | intake |
| triage_action | frontmatter name または directory 名を修正 |
| last_verified | 2026-06-06 |
