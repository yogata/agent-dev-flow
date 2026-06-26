# IR-033: lightweight-delegation primary pattern 禁止

| Field | Value |
|-------|-------|
| rule_id | IR-033 |
| description | `lightweight-delegation` が primary pattern として扱われず、主要な実装分類に重ねる委譲の扱いとして記述されていること |
| severity | strict |
| category | canonical-conflict |
| detection_method | `lightweight-delegation` 周辺文脈を検出し、primary pattern 宣言、frontmatter pattern、実装分類としての扱いがないことを確認 |
| affected_artifacts | [commands, SPEC, skills] |
| related_req | [REQ-0119-015, REQ-0119-016] |
| related_spec | [workflow-contracts.md, artifact-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 中。`primary pattern ではない` という否定表現と検出用文字列は許容 |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | intake |
| triage_action | primary pattern としての記述を削除し、重ねる委譲、manager-orchestrator との差分として説明する |
| last_verified | 2026-06-12 |
