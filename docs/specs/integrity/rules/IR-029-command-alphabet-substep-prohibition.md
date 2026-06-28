---
status: accepted
---

# IR-029: Command 英字サブステップ禁止

| Field | Value |
|-------|-------|
| rule_id | IR-029 |
| description | Command の Step 見出し、参照に `10a` / `11c` などの英字サブステップが残存せず、必要なサブステップは `N-M` 形式で表記されていること |
| severity | strict |
| category | obsolete-structure |
| detection_method | `src/opencode/commands/agentdev/*.md` を対象に Step 文脈の `[0-9][a-z]` を検出し、N-M 形式への統一を確認 |
| affected_artifacts | [commands, command projection, integrity rules] |
| related_req | [REQ-0119-006, REQ-0119-021] |
| related_spec | [artifact-contracts.md, workflow-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 中。一般語、旧語検出用文字列、projection 側の確認文は除外が必要 |
| regression_test | (未実装) |
| baseline_status | new |
| finding_route | intake |
| triage_action | 英字サブステップを N-M 形式へ置換 |
| last_verified | 2026-06-12 |
