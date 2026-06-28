---
status: accepted
---

# IR-030: Subagent verbatim 条件付き返却

| Field | Value |
|-------|-------|
| rule_id | IR-030 |
| description | Subagent 返却契約で、成果物本文のみ verbatim とし、判定結果、調査過程、中間ログ、読解メモへ一律 verbatim を要求していないこと |
| severity | strict |
| category | canonical-conflict |
| detection_method | Command/SPEC/skill references 内の `verbatim` 周辺文脈を確認し、成果物本文条件付き表現か、一律 verbatim 禁止の検出用文字列かを判定 |
| affected_artifacts | [commands, skills, SPEC, integrity rules] |
| related_req | [REQ-0119-013, REQ-0119-021] |
| related_spec | [workflow-contracts.md, artifact-contracts.md, artifact-responsibilities.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 高。検出用文字列、REQ本文、旧語説明、成果物本文の正当な verbatim 指示を文脈判定する必要がある |
| regression_test | (未実装) |
| baseline_status | new |
| finding_route | intake+learning |
| triage_action | 一律 verbatim 指示を、成果物本文のみ verbatim、その他は要約/根拠/capture候補へ圧縮する表現に更新 |
| last_verified | 2026-06-12 |
