---
title: "IR-049: Command file format violation"
status: accepted
created: 2026-08-20
updated: 2026-08-22
---

# IR-049: Command file format violation

| Field | Value |
|-------|-------|
| rule_id | IR-049 |
| description | command 定義ファイル（`src/opencode/commands/agentdev/*.md`、`.opencode/commands/repo/*.md`）が `docs/designs/authoring/command-file-format.md` のフォーマット規約に適合すること（v2:REQ-0143）。検出項目: 公開 command の `### Step N` 見出し残存、`## workflow` セクションの表形式（前出出力検証表）欠落、G01 形式以外のガードレール番号（Issue #2373 で現行 checker 実装へ整理） |
| severity | strict |
| category | document-drift |
| detection_method | `check_command_format.ts` により command 定義ファイルを走査。公開 command の `### Step` 見出し、`## workflow` セクションの表行、ガードレール番号行（`- G\d+:`）を正規表現で検出し、command-file-format.md の規約と照合 |
| affected_artifacts | [commands] |
| related_req | [v2:REQ-0143, REQ-010] |
| related_design | [command-file-format.md, integrity-contracts.md] |
| gate_level | full-audit, delta-guard |
| false_positive_risk | 低。正規表現による機械的検出。公開/repo-local ディレクトリ判定、ガードレール行の形式照合により誤検知リスクを最小化 |
| regression_test | check_command_format.test.ts |
| finding_route | intake |
| triage_action | 対象 command ファイルのフォーマット違反を修正（`### Step N` 見出し → 前出出力検証表へ記述替え、`## workflow` 表欠落 → 表の追加、非 G01 ガードレール番号 → G01 形式） |
| last_verified | 2026-08-22 |
