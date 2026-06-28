---
status: accepted
---

# IR-053: gh 直接記述検出

| Field | Value |
|-------|-------|
| rule_id | IR-053 |
| description | command/skill 定義中の gh CLI 直接呼出し（gh issue/pr create/edit/view/comment/merge/close/list/status 等）を検出すること（REQ-0152-001）。gh CLI 直接記述は `agentdev-gh-cli` 手続き委譲基盤（REQ-0149）経由を原則とし、command/skill 定義への直接埋め込みを禁止する。検出パターン・除外対象の詳細は inspect-skills 診断観点 gh-direct-invocation-leak（PR #1107）と整合する（REQ-0152-002） |
| severity | heuristic |
| category | canonical-conflict |
| detection_method | 対象ファイル（src/opencode/commands/agentdev/*.md, src/opencode/skills/agentdev-*/**/*.md）から gh CLI 直接呼出しパターン（gh (issue|pr) (create|edit|view|comment|merge|close|list|status)）を正規表現で検出。除外対象（src/opencode/skills/`agentdev-gh-cli`/references/standard-procedures.md、REQ-0149-003 許容ファイル）を適用後に報告する |
| affected_artifacts | [src/opencode/commands/agentdev/*.md, src/opencode/skills/agentdev-*/**/*.md] |
| related_req | [REQ-0152-001, REQ-0152-002, REQ-0149-003] |
| related_spec | [integrity-rule-catalog.md, integrity-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 中。`agentdev-gh-cli` 許容ファイル（standard-procedures.md）を除外対象に含めない場合 false positive が発生する。除外リストの厳密な適用で抑制する |
| regression_test | (未実装)。gh 直接記述を含むテストデータ（fixture）で検出されること、standard-procedures.md で検出されないことを検証する |
| baseline_status | new |
| finding_route | intake |
| triage_action | 検出された gh 直接記述を `agentdev-gh-cli` 手続き委譲に置き換える。除外対象外の正当な gh 記述（standard-procedures.md 内）はそのまま |
| last_verified | (新規登録時) |
