# IR-027: 廃止 ADR 現行根拠引用検出

| Field | Value |
|-------|-------|
| rule_id | IR-027 |
| description | 現行 docs 内で 廃止 ADR（`docs/adr/retired/`）が現行根拠として引用されていないこと。履歴参照には廃止パス（`retired/`）と [retired] 注記を必須とする（REQ-0112-048） |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | 現行 docs 内の 廃止 ADR 参照検出、コンテキスト判定 |
| affected_artifacts | [REQ, SPEC, guides] |
| related_req | [REQ-0112-048, REQ-0112-050] |
| related_spec | [integrity-contracts.md, document-model.md] |
| gate_level | full-audit |
| false_positive_risk | 中。履歴参照の文脈判定に注意 |
| regression_test | (手動確認) |
| baseline_status | known |
| finding_route | intake |
| triage_action | 参照に [retired] 注記を追加、または現行 ADR へ更新 |
| last_verified | 2026-06-08 |
