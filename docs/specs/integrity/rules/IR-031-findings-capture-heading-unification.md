---
status: accepted
---

# IR-031: Findings / Capture候補 見出し統一

| Field | Value |
|-------|-------|
| rule_id | IR-031 |
| description | 現行 docs/source の Findings/Intake 系見出しが `Findings / Capture候補` に統一され、旧語は projection 側または integrity rule の検出目的に限って残存していること |
| severity | heuristic |
| category | obsolete-structure |
| detection_method | `Findings`, `Capture候補`, `Intake` 周辺の見出しを検出し、current/source の見出し統一と REQ-0119-021 の検出目的例外を判定 |
| affected_artifacts | [commands, command projection, SPEC, integrity rules] |
| related_req | [REQ-0119-014, REQ-0119-020, REQ-0119-021] |
| related_spec | [workflow-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 高。通常語としての findings、旧語検出パターン、projection 側の比較対象を除外する必要がある |
| regression_test | (未実装) |
| baseline_status | new |
| finding_route | intake |
| triage_action | 見出しを `Findings / Capture候補` に統一し、保存判断は親エージェントへ保持する |
| last_verified | 2026-06-12 |
