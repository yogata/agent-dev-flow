# IR-001: 現行 REQ frontmatter id ↔ ファイル名

| Field | Value |
|-------|-------|
| rule_id | IR-001 |
| description | 現行 REQ の frontmatter id とファイル名（REQ-NNNN.md）が一致すること |
| severity | strict |
| category | document-drift |
| detection_method | frontmatter id 抽出 → ファイル名と照合 |
| affected_artifacts | [現行 REQ] |
| related_req | [REQ-0108-001, REQ-0101] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低。id/ファイル名 の不一致は確実な NG |
| regression_test | commands_structure.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | frontmatter id またはファイル名を修正 |
| last_verified | 2026-06-06 |
