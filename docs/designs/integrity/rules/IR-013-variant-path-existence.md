---
title: "IR-013: 完了報告種別実在"
status: accepted
created: 2026-08-20
updated: "2026-11-18"
detection_method_class: machine-check
implementation_path: src/common/skills/repo-agentdev-integrity/rules/ir-013.ts
verification_path: src/common/skills/repo-agentdev-integrity/scripts/rules/rules.test.ts
---

# IR-013: 完了報告種別実在

| Field | Value |
|-------|-------|
| rule_id | IR-013 |
| description | Command 定義が参照する種別パス（variant path）が実在すること |
| severity | strict |
| category | broken-reference |
| detection_method | command 本文から種別パス（variant path、`completion-reports/<segment>/<file>.md` 形式）抽出 → 索引基準ディレクトリからの存在確認（`checkVariantPathExistence`・results 統合へ接続、Case #4079）。パス成分を囲む Markdown backtick（インラインコード修飾）はパス解決前に除去する（REQ-036-008） |
| affected_artifacts | [commands, templates] |
| related_req | [REQ-036-008] |
| related_design | [integrity-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 低。backtick で囲まれたパス成分はコード書式として扱い、パス解決の前に除去するため、backtick 起因の偽陽性は発生しない（REQ-036-008） |
| regression_test | check_integrity.test.ts（IR-013 専用 fixture 試験） |
| finding_route | intake |
| triage_action | 種別（variant）を作成または参照を修正 |
| last_verified | 2026-11-16 |
