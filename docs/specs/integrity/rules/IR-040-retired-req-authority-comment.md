---
status: accepted
---

# IR-040: retired-req-authority-comment

| Field | Value |
|-------|-------|
| rule_id | IR-040 |
| description | 現行 docs の HTMLコメント（出典標識: provenance marker 含む）が 廃止 REQ ID を単独参照しないこと。検出範囲は HTMLコメントのみに限定し、本文の意味解析は対象外（REQ-0101-063） |
| severity | strict |
| category | canonical-conflict |
| detection_method | `<!-- ... REQ-0NNN ... -->` 形式の HTMLコメントから 廃止 REQ ID を抽出し、後継 現行 REQ への併記がないか検出 |
| affected_artifacts | [REQ, SPEC, guides, ADR] |
| related_req | [REQ-0101-063, REQ-0108-070] |
| related_spec | [integrity-contracts.md, document-model.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 低。HTMLコメント構文に限定した機械的検出 |
| regression_test | (未実装) |
| baseline_status | new |
| finding_route | intake |
| triage_action | 廃止 REQ の HTMLコメント参照を後継 現行 REQ へ置換 |
| last_verified | 2026-06-17 |
