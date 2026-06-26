# IR-042: hardcoded-req-count

| Field | Value |
|-------|-------|
| rule_id | IR-042 |
| description | docs 内の REQ 件数、範囲の固定表記が実際の 現行 REQ ファイル数と一致すること |
| severity | heuristic |
| category | document-drift |
| detection_method | N件、範囲表記（REQ-0101〜0NNN 等）抽出 → glob による実際の 現行 REQ ファイル数と照合 |
| affected_artifacts | [SPEC, guides, AGENTS.md] |
| related_req | [REQ-0108-140, REQ-0101] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 中。表記揺れ、retired 除外の判定に注意 |
| regression_test | (手動確認) |
| baseline_status | new |
| finding_route | intake |
| triage_action | 固定表記を実際の REQ ファイル数、範囲に更新 |
| last_verified | 2026-06-17 |
