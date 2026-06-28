---
status: accepted
---

# IR-012: Template 必須セクション

| Field | Value |
|-------|-------|
| rule_id | IR-012 |
| description | Template ファイルに frontmatter と必須セクション（<!-- 【必須】 -->）が存在すること |
| severity | strict |
| category | document-drift |
| detection_method | template ファイルの構造検証 |
| affected_artifacts | [templates] |
| related_req | [REQ-0108 (workflow template 構造)] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 低 |
| regression_test | check_templates.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 必須セクションを追加 |
| last_verified | 2026-06-06 |
