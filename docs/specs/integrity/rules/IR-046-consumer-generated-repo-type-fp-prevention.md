# IR-046: consumer-generated リポジトリ種別誤検知防止

| Field | Value |
|-------|-------|
| rule_id | IR-046 |
| description | `.opencode/commands/agentdev/` が実ディレクトリ（非ジャンクション）かつ `generated_by: local-opencode-transform` 識別子を含む場合、当該リポジトリを consumer-generated として扱い、IR-016（Source/projection 整合性）の source/projection divergence 対象から除外すること（REQ-0141-007, 011）。ローカル版生成物はジャンクションではなく実ファイル配置であるため、IR-016 の「ジャンクション破損」判定が誤検知となるのを防ぐ |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | `.opencode/commands/agentdev/` がジャンクション、シンボリックリンクでないことを確認後、配下のファイルから `generated_by: local-opencode-transform` 識別子を検出。識別子検出時は consumer-generated と判定し IR-016 を適用除外とする |
| affected_artifacts | [.opencode/commands/agentdev/, .opencode/skills/agentdev-*/] |
| related_req | [REQ-0141-007, REQ-0141-011, REQ-0141-014] |
| related_spec | [runtime-package-boundary.md, local-generation.md] |
| gate_level | full-audit |
| false_positive_risk | 低。ジャンクション検出と `generated_by` 識別子検出の組合せで確実に判定可能 |
| regression_test | (追加予定) |
| baseline_status | new |
| finding_route | intake |
| triage_action | IR-016 を consumer-generated リポジトリでは適用除外とする。識別子不在の場合は IR-016 を通常適用する |
| last_verified | 2026-06-20 |
