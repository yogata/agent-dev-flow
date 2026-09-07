---
title: "IR-053: gh 直接記述検出"
status: accepted
created: 2026-08-20
updated: 2026-09-08
---

# IR-053: gh 直接記述検出

| Field | Value |
|-------|-------|
| rule_id | IR-053 |
| description | command と skill の定義に埋め込まれた gh CLI 呼出しを検出する。GitHub I/O は Custom Tool `agentdev_gh` の操作契約へ委譲し、定義本文から直接呼び出さない。 |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | `src/opencode/commands/agentdev/*.md` と `src/opencode/skills/agentdev-*/**/*.md` から `gh (issue|pr) (create|edit|view|comment|merge|close|list|status)` を検出する。Custom Tool `agentdev_gh` の操作契約参照は I/O 境界の正規経路として除外する。スキャン対象と除外対象の詳細は Custom Tool 操作契約 Design（responsibilities/custom-tool-contracts.md）「迂回防止」が所有する。 |
| affected_artifacts | [src/opencode/commands/agentdev/*.md, src/opencode/skills/agentdev-*/**/*.md] |
| related_req | [REQ-011] |
| related_design | [integrity-rule-catalog.md, integrity-contracts.md, ../../responsibilities/custom-tool-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 中。Custom Tool `agentdev_gh` の操作契約参照を除外しないと、正規の I/O 実装を違反として検出する。 |
| regression_test | gh 直接呼出しを含む fixture を検出し、Tool 操作契約参照を検出しない検証を実施する。 |
| finding_route | intake |
| triage_action | 検出箇所を Custom Tool `agentdev_gh` の操作契約への委譲へ置き換える。 |
| last_verified | 2026-07-25 |
