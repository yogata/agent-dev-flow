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
| detection_method | SKILL.md 内のパス抽出 → 存在確認。パス成分を囲む Markdown backtick（インラインコード修飾）はパス解決前に除去する（REQ-0144-020） |
| affected_artifacts | [skills, skill references] |
| related_req | [REQ-0108-110, 115-120, REQ-0144-020] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 中。裸参照の解決ルールに注意。backtick 囲みパス成分は code formatting として扱いパス解決前に除去するため、backtick 起因の偽陽性は発生しない（REQ-0144-020） |
| regression_test | check_reference_paths.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 参照先を作成または参照を修正 |
| last_verified | 2026-07-03 |
