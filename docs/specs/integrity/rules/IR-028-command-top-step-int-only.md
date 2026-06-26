# IR-028: Command 最上位 Step 整数化

| Field | Value |
|-------|-------|
| rule_id | IR-028 |
| description | Command の最上位 Step 見出し、参照が整数のみであり、`Step N.M` 形式の小数 Step が残存していないこと |
| severity | strict |
| category | obsolete-structure |
| detection_method | `src/opencode/commands/agentdev/*.md` を対象に `Step \d+\.\d+` を検出。projection 側または integrity rule 内の旧語検出用文字列は REQ-0119-021 により除外 |
| affected_artifacts | [commands, command projection, integrity rules] |
| related_req | [REQ-0119-005, REQ-0119-007, REQ-0119-021] |
| related_spec | [artifact-contracts.md, workflow-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 中。旧語検出用の正規表現文字列と projection 側の残存確認文は除外が必要 |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | intake |
| triage_action | 小数 Step を整数 Step または N-M 形式のサブステップへ置換 |
| last_verified | 2026-06-12 |
