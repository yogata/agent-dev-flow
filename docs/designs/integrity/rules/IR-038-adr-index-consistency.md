---
title: "IR-038: Decision-index-consistency"
status: accepted
created: 2026-08-20
updated: 2026-08-20
---

# IR-038: Decision-index-consistency

| Field | Value |
|-------|-------|
| rule_id | IR-038 |
| description | 承認済み Decision（`docs/decisions/DEC-*.md`）と 廃止 Decision（`docs/decisions/retired/DEC-*.md`）の index（`docs/decisions/README.md`）整合性を検査すること。Current Baseline View に承認済み Decision が過不足なく記載され、Retired View に 廃止 Decision が過不足なく記載されていること |
| severity | strict |
| category | document-drift |
| detection_method | `docs/decisions/README.md` の Current Baseline View / Retired View と実 Decision ファイル一覧の双方向差分を検出 |
| affected_artifacts | [Decision, Decision index] |
| related_req | [REQ-001-047, REQ-001-048] |
| related_spec | [integrity-contracts.md, document-model.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 低。ファイル一覧と index の差分は確実 |
| regression_test | (未実装) |
| finding_route | intake |
| triage_action | README.md の該当 View に Decision を追加/削除 |
| last_verified | 2026-06-16 |
