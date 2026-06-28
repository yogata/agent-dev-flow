---
status: accepted
---

# IR-022: REQ 内部整合性

| Field | Value |
|-------|-------|
| rule_id | IR-022 |
| description | 同一 REQ 内で同一実体が一方で要求され他方で禁止されていないこと |
| severity | strict |
| category | canonical-conflict |
| detection_method | REQ 内の強制条件、禁止事項の抽出 → 矛盾検出 |
| affected_artifacts | [現行 REQ] |
| related_req | [REQ-0108-139, 149] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 中。意味判断が必要な場合あり |
| regression_test | (手動確認) |
| baseline_status | resolved |
| finding_route | req-define |
| triage_action | REQ の矛盾を解消 |
| last_verified | 2026-06-06 |
