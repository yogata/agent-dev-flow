# IR-006: Command frontmatter 許可フィールド

| Field | Value |
|-------|-------|
| rule_id | IR-006 |
| description | Command frontmatter に description と agent のみが存在すること。pattern, workflow_route, branch_type, labels は禁止 |
| severity | strict |
| category | document-drift |
| detection_method | frontmatter field 列挙 → 許可リストと照合 |
| affected_artifacts | [commands] |
| related_req | [REQ-0103-015, REQ-0108-046, 095-099, 108, 124, 129] |
| related_spec | [integrity-contracts.md, artifact-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 低 |
| regression_test | command_fixtures.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 禁止 field を frontmatter から削除 |
| last_verified | 2026-06-06 |
