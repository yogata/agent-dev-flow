# IR-018: REQ 範囲表記鮮度

| Field | Value |
|-------|-------|
| rule_id | IR-018 |
| description | AGENTS.md、SPEC、guides の REQ 範囲表記が実際の 現行 REQ 数と一致すること |
| severity | heuristic |
| category | document-drift |
| detection_method | N件、through 等の表記と glob 結果の照合 |
| affected_artifacts | [AGENTS.md, SPEC, guides] |
| related_req | [REQ-0108-140] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 中。表記揺れの判定に注意 |
| regression_test | (手動確認) |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 表記を実際の REQ 数に更新 |
| last_verified | 2026-06-06 |
