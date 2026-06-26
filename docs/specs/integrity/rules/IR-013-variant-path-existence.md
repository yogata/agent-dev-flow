# IR-013: 完了報告種別実在

| Field | Value |
|-------|-------|
| rule_id | IR-013 |
| description | Command 定義が参照する種別パス（variant path）が templates/ に実在すること |
| severity | strict |
| category | broken-reference |
| detection_method | command 本文から種別パス（variant path）抽出 → 存在確認 |
| affected_artifacts | [commands, templates] |
| related_req | [REQ-0108-089-091] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 低 |
| regression_test | commands_structure.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 種別（variant）を作成または参照を修正 |
| last_verified | 2026-06-06 |
