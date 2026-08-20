---
title: "IR-039: index-req-title-consistency"
status: accepted
created: 2026-08-20
updated: 2026-08-20
---

# IR-039: index-req-title-consistency

| Field | Value |
|-------|-------|
| rule_id | IR-039 |
| description | 索引文書（requirements/README）の REQ タイトルが各 REQ ファイル frontmatter title と一致すること |
| severity | strict |
| category | document-drift |
| detection_method | 各索引から REQ タイトル抽出 → 対応 REQ ファイル frontmatter title と文字列照合 |
| affected_artifacts | [REQ index, 現行 REQ] |
| related_req | [REQ-010-003, REQ-001-063, REQ-001] |
| related_design | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低。title 文字列の直接比較 |
| regression_test | (未実装) |
| finding_route | intake |
| triage_action | 索引の REQ タイトルを frontmatter title に一致させる |
| last_verified | 2026-06-17 |
