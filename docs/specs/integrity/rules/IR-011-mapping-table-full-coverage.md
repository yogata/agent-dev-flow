# IR-011: Mapping table 全件記録

| Field | Value |
|-------|-------|
| rule_id | IR-011 |
| description | 全 廃止 REQ が mapping-table.md に記録されていること |
| severity | strict |
| category | document-drift |
| detection_method | 廃止 REQ ファイル一覧と mapping-table の照合 |
| affected_artifacts | [廃止 REQ, mapping-table] |
| related_req | [REQ-0108-083-088] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低 |
| regression_test | commands_structure.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | mapping-table にエントリ追加 |
| last_verified | 2026-06-06 |
