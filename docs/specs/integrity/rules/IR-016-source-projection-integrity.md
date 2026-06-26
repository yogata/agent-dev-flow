# IR-016: Source/projection 整合性

| Field | Value |
|-------|-------|
| rule_id | IR-016 |
| description | src/opencode/ と .opencode/ (projection) の間に divergence がないこと |
| severity | strict |
| category | canonical-conflict |
| detection_method | sync-opencode.ps1 -Mode check 相当の比較 |
| affected_artifacts | [commands, skills, templates] |
| related_req | [REQ-0103-048-052, REQ-0108-143-144] |
| related_spec | [system.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 低。ジャンクション（junction）破損は確実な NG |
| regression_test | (sync script で検証) |
| baseline_status | known |
| finding_route | intake |
| triage_action | sync-opencode.ps1 -Mode apply を実行 |
| last_verified | 2026-06-06 |
