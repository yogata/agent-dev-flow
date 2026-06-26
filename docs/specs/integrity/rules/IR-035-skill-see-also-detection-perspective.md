# IR-035: Skill See Also 検出観点

| Field | Value |
|-------|-------|
| rule_id | IR-035 |
| description | skill の `See Also` に実行判断材料（委譲先、責務境界、禁止条件、停止条件）が含まれている、`DO NOT USE FOR` と `See Also` の重複、skill が全コマンド一覧等の別 SSoT 管理対象を保持していることを検出すること |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | SKILL.md の `See Also` セクションから実行判断材料、DO NOT USE FOR 重複、別 SSoT 一覧を検出 |
| affected_artifacts | [skills] |
| related_req | [REQ-0108-245] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 中。補助導線として必要な参照は許容 |
| regression_test | (未実装) |
| baseline_status | new |
| finding_route | req-define |
| triage_action | 実行判断材料を SKILL.md 本文に移動、See Also を関連スキルへの導線のみに整理する |
| last_verified | 2026-06-14 |
