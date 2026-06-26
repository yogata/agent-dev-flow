# IR-032: delegation_type/on_result 必須 envelope 禁止

| Field | Value |
|-------|-------|
| rule_id | IR-032 |
| description | `delegation_type` / `on_result` がサブエージェント委譲の必須 envelope として扱われず、必要な場合のみ参考ラベルまたは親側の扱いとして記述されていること |
| severity | strict |
| category | canonical-conflict |
| detection_method | `delegation_type` / `on_result` 周辺文脈を検出し、必須 envelope 表現ではなく任意、参考分類の表現であることを確認 |
| affected_artifacts | [commands, SPEC, skills] |
| related_req | [REQ-0119-017, REQ-0119-018] |
| related_spec | [workflow-contracts.md, artifact-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 中。taxonomy 定義、任意ラベル説明、旧語検出用文字列は許容 |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | intake |
| triage_action | 必須 envelope 表現を削除し、inputs / side_effect_boundary / output_contract / capture_handoff 中心の契約に更新 |
| last_verified | 2026-06-12 |
