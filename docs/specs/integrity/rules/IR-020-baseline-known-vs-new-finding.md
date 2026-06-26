# IR-020: 基準既知（baseline-known）と新規 finding の区別

| Field | Value |
|-------|-------|
| rule_id | IR-020 |
| description | 基準（`.agentdev/integrity/baseline.json`）に記録された known finding と新規 finding が区別されていること |
| severity | heuristic |
| category | integrity-rule-gap |
| detection_method | baseline.json の known_findings と現行 finding の比較 |
| affected_artifacts | [baseline, integrity reports] |
| related_req | [REQ-0108-145, 148] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit, impact-guard |
| false_positive_risk | 中。基準（baseline）の陳腐化判定に注意 |
| regression_test | (手動確認) |
| baseline_status | resolved |
| finding_route | none |
| triage_action | 基準（baseline）を更新 |
| last_verified | 2026-06-06 |
