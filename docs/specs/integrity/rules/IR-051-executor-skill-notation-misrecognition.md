# IR-051: 実行主体の skill 表記誤認検出

| Field | Value |
|-------|-------|
| rule_id | IR-051 |
| description | docs/SPEC/command/skill で 既知 command 名（`/agentdev/*`、`/ulw-loop` 等）、既知 harness 名（oh-my-openagent 等）、既知 subagent 名（Sisyphus-Junior 等）が「スキル」「skill」と表記されていることを検出すること（REQ-0108-261）。実行主体の分類（command / skill / subagent / harness）は `docs/specs/responsibilities/document-type-responsibilities.md`「実行主体分類の査読基準」に定義される |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | 既知 command 名、harness 名、subagent 名（語彙レジストリ `.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md` 参照）の出現位置から一定文字距離内（同一段落、同行、隣接リスト項目等）の「スキル」「skill」表記を検出。コードブロック内の例示、IR ルール本文中のパターン説明、誤認説明の否定文脈（「skill ではない」等）は除外対象 |
| affected_artifacts | [REQ, SPEC, guides, commands, skills] |
| related_req | [REQ-0108-261, REQ-0140-027, REQ-0125-010] |
| related_spec | [integrity-contracts.md, document-type-responsibilities.md] |
| gate_level | full-audit |
| false_positive_risk | 高。文脈判断が必要（例: 「agentdev-doc-writing skill」は正当、「ulw-loop skill」は誤認）。意味判断を要する境界ケースは inspect-skills（REQ-0125-010）、doc-writing（REQ-0140-027）が意味的診断を担う。本ルールは機械的パターンマッチングで判定可能な範囲（既知名 + 近接 skill 表記）に限定 |
| regression_test | (未実装)。既知 true positive として OU-001 修正前の ulw-loop 委譲契約バグ周辺の skill 表記を回帰テストで検証 |
| baseline_status | new |
| finding_route | intake |
| triage_action | command/harness/subagent 名の「スキル」「skill」表記を正しい分類名（command / harness / subagent）に修正 |
| last_verified | 2026-06-22 |
