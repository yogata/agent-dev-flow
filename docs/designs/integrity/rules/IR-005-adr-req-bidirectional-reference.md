---
title: "IR-005: Decision ↔ REQ 相互参照存在"
status: accepted
created: 2026-08-20
updated: 2026-08-20
---

# IR-005: Decision ↔ REQ 相互参照存在

| Field | Value |
|-------|-------|
| rule_id | IR-005 |
| description | Decision の Related REQ セクションの REQ ID と、REQ の Decision index からの参照が双方向に存在すること。判定対象 ID は現行 `DEC-\d{3}` 命名（`docs/decisions/` 配下）。過去版 `v2:ADR-\d{4}` 参照は AG-010 履歴参照保護対象外（DEC-009） |
| severity | strict |
| category | broken-reference |
| detection_method | Decision から REQ ID 抽出 → 存在確認、逆方向も確認。Decision ID 抽出は `DEC-\d{3}`（`v2:` prefix 除外）。旧 `ADR-\d{4}` 参照が現行 docs に残存する場合は移行漏れ（residual）として検出する |
| affected_artifacts | [Decision, REQ, Decision index] |
| related_req | [REQ-010-005] |
| related_design | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 中。廃止 REQ 参照は別 rule で判定 |
| regression_test | check_integrity.test.ts |
| finding_route | intake |
| triage_action | 参照を追加/修正 |
| last_verified | 2026-08-10 |

## ルール本文

IR-005 は Decision ↔ REQ 双方向参照の存在を検証する（DEC-009 移行後）。
判定対象 ID は現行 `DEC-\d{3}`（`docs/decisions/` 配下、`v2:` prefix 除外）。
旧 `ADR-\d{4}` 形式参照が現行 docs に残存する場合、Decision 移行の漏れ（residual）
として検出する。
履歴参照 `v2:ADR-\d{4}` は AG-010 保護対象であり検出対象外。
