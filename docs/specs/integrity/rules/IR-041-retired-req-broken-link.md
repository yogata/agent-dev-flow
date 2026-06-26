# IR-041: retired-req-broken-link

| Field | Value |
|-------|-------|
| rule_id | IR-041 |
| description | 廃止 REQ ファイルへのリンクが `retired/` パス接頭辞を使用すること |
| severity | strict |
| category | broken-reference |
| detection_method | Markdown リンク `[REQ-0NNN](../requirements/REQ-0NNN.md)` から 廃止 REQ への直接パス（retired/ なし）を検出 |
| affected_artifacts | [REQ, SPEC, guides, ADR] |
| related_req | [REQ-0108-070, REQ-0101-063] |
| related_spec | [integrity-contracts.md] |
| gate_level | full-audit |
| false_positive_risk | 低。廃止 REQ ID 集合とリンク先パスの照合 |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | intake |
| triage_action | 廃止 REQ へのリンク先を `retired/` パスに修正 |
| last_verified | 2026-06-17 |
