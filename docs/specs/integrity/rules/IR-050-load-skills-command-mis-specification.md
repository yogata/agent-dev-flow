---
status: accepted
---

# IR-050: load_skills command 誤指定検出

| Field | Value |
|-------|-------|
| rule_id | IR-050 |
| description | `load_skills=["..."]` 形式で command 名（`/` 先頭識別子、`/agentdev/*` 等の公開 command 名、`/ulw-loop` 等の外部 command 名、`agentdev-` プレフィックスを持たない command 識別子）が指定されていることを検出すること（REQ-0108-261）。command 名は `load_skills` の対象ではなく委譲 prompt 内で `/ulw-loop` 等の command 指定として扱うべきものであるため、`load_skills` への指定は文書種別責務境界違反である |
| severity | strict |
| category | canonical-conflict |
| detection_method | `load_skills\s*=\s*\["([^"]+)"\]` パターンから各要素を抽出し、各要素が `/` 先頭形式（command 名）であるか、`agentdev-*` プレフィックスを持たない既知 command 名（語彙レジストリ `.opencode/skills/repo-agentdev-integrity/references/vocabulary-registry.md` 参照）であるかを照合。コードブロック内の例示、検出用文字列、IR ルール本文中のパターン説明は除外対象 |
| affected_artifacts | [commands, skills, SPEC] |
| related_req | [REQ-0108-261, REQ-0140-027, REQ-0125-010] |
| related_spec | [integrity-contracts.md, document-type-responsibilities.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 低。`/` 先頭形式は確実な command 名指示。`agentdev-*` プレフィックスを持たない識別子は語彙レジストリとの照合で判定。コードブロック例示、IR パターン説明は除外が必要 |
| regression_test | (未実装)。既知 true positive として OU-001 修正前の `load_skills=["ulw-loop"]` を回帰テストで検証 |
| baseline_status | new |
| finding_route | intake |
| triage_action | `load_skills=["..."]` の command 名を skill 名（`agentdev-*`）に修正、または委譲 prompt 内で command を指定する形式（`prompt="/ulw-loop Implement Issue #N: ..."`）に変更 |
| last_verified | 2026-06-22 |
