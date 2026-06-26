# IR-037: retired-ADR-current-baseline-ref

| Field | Value |
|-------|-------|
| rule_id | IR-037 |
| description | 廃止 ADR（`docs/adr/retired/`）が現行基準（current baseline）として参照、案内されていないこと（REQ-0108-250）。Current Baseline View、後継ADRの Related Decisions、REQ/SPEC の現行根拠で 廃止 ADR が現行扱いされていないかを検査する |
| severity | strict |
| category | canonical-conflict |
| detection_method | 廃止 ADR 番号が現行基準文脈（Current Baseline View、現行根拠引用、後継指定なしの参照）に出現していないかを検出 |
| affected_artifacts | [ADR, ADR index, REQ, SPEC] |
| related_req | [REQ-0108-250, REQ-0112-048] |
| related_spec | [integrity-contracts.md, document-model.md] |
| gate_level | full-audit |
| false_positive_risk | 中。履歴参照 `(retired)` 注記付きの言及は除外 |
| regression_test | (未実装) |
| baseline_status | new |
| finding_route | intake |
| triage_action | 廃止 ADR への現行参照を後継 ADR へ更新、または `(retired)` 注記を付与 |
| last_verified | 2026-06-16 |
