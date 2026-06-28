---
status: accepted
---

# IR-026: ADR 誤分類兆候検出

| Field | Value |
|-------|-------|
| rule_id | IR-026 |
| description | 現行 ADR に技術判断不在、REQ/SPEC 相当内容の混入、ADR-0103 適合外、文書種別不一致の兆候がないこと（REQ-0112-043） |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | ADR 本文の内容分析（技術判断の有無、REQ/SPEC 相当キーワード検出） |
| affected_artifacts | [current ADR] |
| related_req | [REQ-0112-043, REQ-0112-031, REQ-0112-032, REQ-0112-033] |
| related_spec | [integrity-contracts.md, document-model.md] |
| gate_level | full-audit |
| false_positive_risk | 高。意味判断が必要なため observation として報告 |
| regression_test | (手動確認) |
| baseline_status | known |
| finding_route | req-define |
| triage_action | ADR 誤分類兆候を確認し、必要に応じて REQ/SPEC 移管を検討 |
| last_verified | 2026-06-08 |
