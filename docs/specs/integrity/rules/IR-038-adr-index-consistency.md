# IR-038: ADR-index-consistency

| Field | Value |
|-------|-------|
| rule_id | IR-038 |
| description | 承認済み ADR（`docs/adr/ADR-*.md`）と 廃止 ADR（`docs/adr/retired/ADR-*.md`）の index（`docs/adr/README.md`）整合性を検査すること（REQ-0108-251）。Current Baseline View に承認済み ADR が過不足なく記載され、Retired View に 廃止 ADR が過不足なく記載されていること |
| severity | strict |
| category | document-drift |
| detection_method | `docs/adr/README.md` の Current Baseline View / Retired View と実 ADR ファイル一覧の双方向差分を検出 |
| affected_artifacts | [ADR, ADR index] |
| related_req | [REQ-0108-251, REQ-0112-047, REQ-0112-048] |
| related_spec | [integrity-contracts.md, document-model.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 低。ファイル一覧と index の差分は確実 |
| regression_test | (未実装) |
| baseline_status | new |
| finding_route | intake |
| triage_action | README.md の該当 View に ADR を追加/削除 |
| last_verified | 2026-06-16 |
