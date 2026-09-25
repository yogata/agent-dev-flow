---
intake_type: workflow-observation
source_case: "#3139"
source_workflow: case-open
observed_at: 2026-09-25T17:40:00+09:00
status: unclassified
---

# 観測: check_integrity --json の stdout に report 保存先通知行が混在し JSON 機械解析が失敗（Case #3139 STEP-4 branch HEAD 実測で実観測）

## 観測内容

case-open STEP-4 の branch HEAD 実測（Definition PR #3140 の検査期待値確定）で `check_integrity.ts --profile source --root <worktree> --json` を node の JSON.parse へパイプしたところ、JSON 本文の末尾に非 JSON 行（`Report written to: <report-path>`）が混在し `SyntaxError: Unexpected non-whitespace character after JSON at position ...` で解析が失敗した。

- 該当実行: `bun run .worktrees/3139-definition/.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts --profile source --root .worktrees/3139-definition --json`（2026-09-25・Case #3139）
- JSON 本文自体は先頭部分で正常に出力されており、末尾の report 保存先通知行（人間向け案内）が stdout に混入しているのが原因
- 同一検査の tail によるサマリ読取（`new unmanaged NG 12 件` 等）は正常に動作し、本 Case の増分判定（baseline origin/main 46046763 と同値・増分 0）には影響なし

## 候補改善（要判断）

- check_integrity.ts の `--json` モードで stdout を純 JSON に限定する修正（report 保存先通知を stderr へ分離、または JSON モードでは通知を抑制）
- 他の checker スクリプト（check_autogen_freshness.ts 等）で同様の stdout 混在（人間向け通知と機械出力の共存）がないかの棚卸し

## 関連

- Case #3139 / PR #3140（definition/issue-3139、commit 3c610a57、2026-09-25）
- 対象スクリプト: .opencode/skills/repo-agentdev-integrity/scripts/check_integrity.ts
- 同一観測の learning item: .agentdev/learning/inbox.md「check_integrity --json の stdout に report 保存先通知行が混在し機械解析が壊れる」（Split Rule による分割記録）
- 入力源: case-open 自工程 deviation capture（2026-09-25）
