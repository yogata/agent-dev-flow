---
status: accepted
---

# IR-019: Guide 要件定義、契約記述検出

| Field | Value |
|-------|-------|
| rule_id | IR-019 |
| description | Guide ファイルが要件本文または契約本文を保持していないこと（REQ-0101）。語彙ベースの検出ではなく、guide が REQ/ADR/SPEC の責務を侵害する内容を保持していないかを検査する |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | Guide 内の要件定義表、契約記述、REQ 相当の振る舞い定義の検出。語彙ベースの判定ではなく構造的判定を主とし、強制条件表現は補助シグナル |
| affected_artifacts | [guides] |
| related_req | [REQ-0108-138, REQ-0101] |
| related_spec | [document-model.md] |
| gate_level | full-audit |
| false_positive_risk | 中。引用、メタ文の除外に注意 |
| regression_test | (手動確認) |
| baseline_status | resolved |
| finding_route | intake+learning |
| triage_action | guide から要件本文、契約本文を削除し、REQ/ADR/SPEC への参照に置き換える |
| last_verified | 2026-06-06 |
