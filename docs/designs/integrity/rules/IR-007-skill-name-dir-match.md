---
title: "IR-007: Skill frontmatter name ↔ dir"
status: accepted
created: 2026-08-20
updated: "2026-11-18"
detection_method_class: machine-check
implementation_path: src/common/skills/repo-agentdev-integrity/rules/ir-007.ts
verification_path: [src/common/skills/repo-agentdev-integrity/scripts/rules/rules.test.ts, src/common/skills/repo-agentdev-integrity/scripts/tests/lint_skills.test.ts]
---

# IR-007: Skill frontmatter name ↔ dir

| Field | Value |
|-------|-------|
| rule_id | IR-007 |
| description | .opencode/skills/{dir}/SKILL.md の frontmatter name が {dir} と一致すること |
| severity | strict |
| category | document-drift |
| detection_method | ディレクトリ名と frontmatter の name の比較 |
| affected_artifacts | [skills] |
| related_req | [REQ-010] |
| related_design | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低 |
| regression_test | lint_skills.test.ts |
| finding_route | intake |
| triage_action | frontmatter name または directory 名を修正 |
| last_verified | 2026-06-06 |
