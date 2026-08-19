---
title: "IR-024: Command README ↔ 実体"
status: accepted
created: 2026-08-20
updated: 2026-08-20
---

# IR-024: Command README ↔ 実体

| Field | Value |
|-------|-------|
| rule_id | IR-024 |
| description | .opencode/commands/agentdev/README.md の一覧と実際のコマンドファイルが一致すること |
| severity | strict |
| category | document-drift |
| detection_method | README からコマンド名抽出 → glob と照合 |
| affected_artifacts | [command README, commands] |
| related_req | [REQ-001-026, REQ-010-003] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低 |
| regression_test | commands_structure.test.ts |
| finding_route | intake |
| triage_action | README にコマンド追加/削除 |
| last_verified | 2026-06-06 |
