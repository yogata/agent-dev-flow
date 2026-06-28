---
status: accepted
---

# IR-048: generated_by 識別子整合性

| Field | Value |
|-------|-------|
| rule_id | IR-048 |
| description | ローカル版生成物に `generated_by: local-opencode-transform` 識別情報が付与されていること（REQ-0141-011）。同名ファイル上書きは識別子が一致する場合のみ許可され、識別子不在、異なる識別子のファイルを上書きしてはならないこと（REQ-0141-012, 013） |
| severity | strict |
| category | canonical-conflict |
| detection_method | `.opencode/commands/agentdev/**/*.md` と `.opencode/skills/agentdev-*/**/*.md` から frontmatter またはメタ識別子中の `generated_by` を抽出し、`local-opencode-transform` と一致することを確認。同名ファイル上書き時の識別子整合性はローカル版生成プロセスが `## 変換仕様` ガードレールで検証 |
| affected_artifacts | [.opencode/commands/agentdev/, .opencode/skills/agentdev-*/] |
| related_req | [REQ-0141-011, REQ-0141-012, REQ-0141-013] |
| related_spec | [local-generation.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 中。生成物への識別子付与方式（frontmatter vs ヘッダコメント）の揺れ、AgentDevFlow 本体原本（識別子なし）との混同に注意 |
| regression_test | (未実装) |
| baseline_status | new |
| finding_route | intake |
| triage_action | 識別子付与方式を `local-generation.md` の定義に統一。競合ファイルは手動マージまたは識別子付与後に再生成 |
| last_verified | 2026-06-20 |
