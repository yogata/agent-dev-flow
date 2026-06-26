# IR-017: DOC-MAP ↔ 実体整合性

| Field | Value |
|-------|-------|
| rule_id | IR-017 |
| description | DOC-MAP が参照するファイルが存在すること |
| severity | strict |
| category | broken-reference |
| detection_method | DOC-MAP 内のリンク抽出 → 存在確認 |
| affected_artifacts | [DOC-MAP] |
| related_req | [REQ-0108-003] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低 |
| regression_test | check_integrity.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | DOC-MAP エントリを更新 |
| last_verified | 2026-06-06 |
