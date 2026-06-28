---
status: accepted
---

# IR-049: Command file format violation

| Field | Value |
|-------|-------|
| rule_id | IR-049 |
| description | command 定義ファイル（`src/opencode/commands/agentdev/*.md`、`.opencode/commands/repo/*.md`）が `docs/specs/authoring/command-file-format.md` のフォーマット規約に適合すること（REQ-0143）。検出項目: Step 0 使用、非連番 Step 番号、ゼロ起点サブステップ（Step N-0）、numbered list 主手順、G01 形式以外のガードレール番号 |
| severity | strict |
| category | document-drift |
| detection_method | `check_command_format.ts` により command 定義ファイルを走査。`## 手順` 配下の Step 見出し、参照、numbered list、ガードレール番号を正規表現で検出し、command-file-format.md の規約と照合 |
| affected_artifacts | [commands] |
| related_req | [REQ-0143, REQ-0108] |
| related_spec | [command-file-format.md, integrity-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 低。正規表現による機械的検出。`## 手順` 配下判定、ガードレール行（`- G\d+:`）の形式照合により誤検知リスクを最小化 |
| regression_test | check_command_format.test.ts |
| baseline_status | resolved |
| finding_route | intake |
| triage_action | 対象 command ファイルのフォーマット違反を修正（Step 0 → Step 1、numbered list → ### Step N 見出し、ゼロ起点サブステップ → Step N-1、非 G01 ガードレール番号 → G01 形式） |
| last_verified | 2026-06-22 |
