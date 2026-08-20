---
title: "IR-053: gh 直接記述検出"
status: accepted
created: 2026-08-20
updated: 2026-07-25
---

# IR-053: gh 直接記述検出

| Field | Value |
|-------|-------|
| rule_id | IR-053 |
| description | command と skill の定義に埋め込まれた gh CLI 呼出しを検出する。GitHub I/O は `agentdev-gh-cli` の公開手続きへ委譲し、定義本文から直接呼び出さない。 |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | `src/opencode/commands/agentdev/*.md` と `src/opencode/skills/agentdev-*/**/*.md` から `gh (issue|pr) (create|edit|view|comment|merge|close|list|status)` を検出する。`agentdev-gh-cli` の標準手続き参照は I/O 境界の実装として除外する。 |
| affected_artifacts | [src/opencode/commands/agentdev/*.md, src/opencode/skills/agentdev-*/**/*.md] |
| related_req | [REQ-011] |
| related_design | [integrity-rule-catalog.md, integrity-contracts.md, ../../skills/agentdev-gh-cli.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 中。`agentdev-gh-cli` の標準手続き参照を除外しないと、正規の I/O 実装を違反として検出する。 |
| regression_test | gh 直接呼出しを含む fixture を検出し、標準手続き参照を検出しない検証を実施する。 |
| finding_route | intake |
| triage_action | 検出箇所を `agentdev-gh-cli` の公開手続きへの委譲へ置き換える。 |
| last_verified | 2026-07-25 |
