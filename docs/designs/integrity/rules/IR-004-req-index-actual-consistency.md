---
title: "IR-004: REQ index ↔ 現行 REQ 一致"
status: accepted
created: 2026-08-20
updated: 2026-08-20
detection_method_class: machine-check
implementation_path: .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts
verification_path: .opencode/skills/repo-agentdev-integrity/scripts/commands_structure.test.ts
---

# IR-004: REQ index ↔ 現行 REQ 一致

| Field | Value |
|-------|-------|
| rule_id | IR-004 |
| description | docs/requirements/README.md の 現行 REQ 一覧と実際の REQ ファイルが一致すること |
| severity | strict |
| category | document-drift |
| detection_method | README から REQ ID 抽出 → glob 結果と照合 |
| affected_artifacts | [REQ index, 現行 REQ] |
| related_req | [REQ-010-003] |
| related_design | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低 |
| regression_test | commands_structure.test.ts |
| finding_route | intake |
| triage_action | README に REQ 追加/削除 |
| last_verified | 2026-06-06 |
