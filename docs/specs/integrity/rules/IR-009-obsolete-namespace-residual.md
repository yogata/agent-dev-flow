# IR-009: 旧 namespace 残存

| Field | Value |
|-------|-------|
| rule_id | IR-009 |
| description | 旧コマンド名、旧パス、二重 prefix、bare slash command form が docs/specs/guides に残存しないこと |
| severity | strict |
| category | obsolete-structure |
| detection_method | 正規表現パターンマッチ |
| affected_artifacts | [REQ, SPEC, guides, skills, commands] |
| related_req | [REQ-0108-016] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 中。検出対象外パスの設定に注意 |
| regression_test | commands_e2e.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 旧 namespace を更新 |
| last_verified | 2026-06-06 |
