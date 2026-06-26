# IR-025: 廃止 ADR path 規則

| Field | Value |
|-------|-------|
| rule_id | IR-025 |
| description | 旧番号帯 ADR（ADR-0001〜0099）が `docs/adr/retired/` に配置されていること。`docs/adr/` 直下に旧番号帯 ADR が残存していないこと（REQ-0112-047, 048） |
| severity | strict |
| category | obsolete-structure |
| detection_method | `docs/adr/ADR-0*.md`（ADR-0000〜ADR-0099）の存在確認 |
| affected_artifacts | [ADR] |
| related_req | [REQ-0112-047, REQ-0112-048] |
| related_spec | [integrity-contracts.md, document-model.md] |
| gate_level | full-audit |
| false_positive_risk | なし。番号帯マッチングは確実 |
| regression_test | (未実装) |
| baseline_status | known |
| finding_route | intake |
| triage_action | 旧番号帯 ADR を `docs/adr/retired/` に移動 |
| last_verified | 2026-06-08 |
