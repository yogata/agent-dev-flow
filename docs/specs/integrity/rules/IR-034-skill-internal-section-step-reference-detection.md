# IR-034: Skill 内部 section / protocol / Step 参照検出

| Field | Value |
|-------|-------|
| rule_id | IR-034 |
| description | command から skill 内部の protocol 名、Step 名、Section 名、見出し名への参照、自然言語ラベルから存在しないファイル名を推測させる参照、skill 側に command 固有 Step 番号を一次情報として保持する記述を検出すること |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | command 定義本文、SKILL.md 本文から skill 内部 section 名、protocol 名、Step 名への直接参照パターンを検出 |
| affected_artifacts | [commands, skills] |
| related_req | [REQ-0108-244] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 中。検出パターン例示、検査ルール自体の記述は対象外 |
| regression_test | (未実装) |
| baseline_status | new |
| finding_route | req-define |
| triage_action | 参照先を正規の公開 API（SKILL.md description / USE FOR）に置き換える |
| last_verified | 2026-06-14 |
