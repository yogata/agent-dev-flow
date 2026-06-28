---
status: accepted
---

# IR-008: Skill references/ 存在

| Field | Value |
|-------|-------|
| rule_id | IR-008 |
| description | SKILL.md が参照する references/ ファイルが存在すること |
| severity | strict |
| category | broken-reference |
| detection_method | SKILL.md 内のパス抽出 → 存在確認 |
| affected_artifacts | [skills, skill references] |
| related_req | [REQ-0108-110, 115-120] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 中。裸参照の解決ルールに注意 |
| regression_test | check_reference_paths.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 参照先を作成または参照を修正 |
| last_verified | 2026-06-06 |
