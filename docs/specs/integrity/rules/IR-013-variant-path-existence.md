---
status: accepted
---

# IR-013: 完了報告種別実在

| Field | Value |
|-------|-------|
| rule_id | IR-013 |
| description | Command 定義が参照する種別パス（variant path）が templates/ に実在すること |
| severity | strict |
| category | broken-reference |
| detection_method | command 本文から種別パス（variant path）抽出 → 存在確認。パス成分を囲む Markdown backtick（インラインコード修飾）はパス解決前に除去する（REQ-0144-020） |
| affected_artifacts | [commands, templates] |
| related_req | [REQ-0108-089-091, REQ-0144-020] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 低。backtick 囲みパス成分は code formatting として扱いパス解決前に除去するため、backtick 起因の偽陽性は発生しない（REQ-0144-020） |
| regression_test | commands_structure.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 種別（variant）を作成または参照を修正 |
| last_verified | 2026-07-03 |
