---
title: "IR-016: Source/projection 整合性"
status: accepted
created: 2026-08-20
updated: "2026-11-18"
detection_method_class: machine-check
implementation_path: src/common/skills/repo-agentdev-integrity/rules/ir-016.ts
verification_path: src/common/skills/repo-agentdev-integrity/scripts/rules/rules.test.ts
---

# IR-016: Source/projection 整合性

| Field | Value |
|-------|-------|
| rule_id | IR-016 |
| description | src/opencode/ と .opencode/ (projection) の間に内容の不一致がないこと |
| severity | strict |
| category | canonical-conflict |
| detection_method | self-sync.ps1 -Mode check 相当の比較 |
| affected_artifacts | [commands, skills, templates] |
| related_req | [REQ-002-048-052] |
| related_design | [system.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 低。ジャンクション（junction）破損は確実な NG |
| regression_test | (sync script で検証) |
| finding_route | intake |
| triage_action | self-sync.ps1 -Mode apply を実行 |
| last_verified | 2026-06-06 |
