---
status: accepted
---

# IR-043: retired-readme-coverage

| Field | Value |
|-------|-------|
| rule_id | IR-043 |
| description | retired/README.md が全 廃止 REQ のエントリを含むこと |
| severity | strict |
| category | document-drift |
| detection_method | 廃止 REQ ファイル一覧と retired/README.md のエントリを双方向差分で照合 |
| affected_artifacts | [廃止 REQ, retired README] |
| related_req | [REQ-0108-083, REQ-0101] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低。ファイル一覧とエントリの差分 |
| regression_test | (未実装) |
| baseline_status | new |
| finding_route | intake |
| triage_action | retired/README.md に欠落する 廃止 REQ エントリを追加 |
| last_verified | 2026-06-17 |
