# prepare_definition_pr.ts の extractFreshnessTargets が REQ ファイルの freshness 報告形式を捕捉できない修正候補

## 概要

case-open STEP-4 機械工程 script（`src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts`）の `extractFreshnessTargets` は、check_integrity の req-updated-freshness 報告から対象パスを `/for ((?:docs|src|scripts)[^\s:]*\.md):/g` で抽出する。check_integrity の REQ freshness 報告は REQ ファイルを `for REQ-105.md:` 形式（`docs/requirements/` プレフィックスなしのファイル名のみ）で報告するため一致せず、REQ ファイルの frontmatter updated 補正が script 内 measurement-convergence step で完結せず、script が fail 終了する。実測: Case #3910（PR #3912）の初回 check_integrity で REQ-105.md を含む 5 件の NG を報告し、convergence の frontmatterUpdatedTargets は design 4 ファイルのみで REQ-105.md が欠落、手動 contingency（明示パス指定補正 commit 20a6eb9e8 + 新 HEAD での check_integrity・traceability check 完了）で救済した。

## 根拠

- 観測元: Case #3910（Root Case Issue #3910）case-open STEP-4 実行記録、PR #3912 本文検証欄
- 対象報告（初回 check_integrity stdout の該当行）: `- **[NG]** req-updated-freshness: frontmatter updated (2026-10-09) does not match the last content-change commit date (2026-11-04) for REQ-105.md: ... (docs/requirements/REQ-105.md) → route: intake`
- 正規表現の実装箇所: `src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts` `extractFreshnessTargets`（`/for ((?:docs|src|scripts)[^\s:]*\.md):/g`）
- 修正候補: REQ ファイルの報告形式（ファイル名のみ）への対応追加と、NG 報告対象と補正適用対象の差分検査（補正漏れ検出）の script 組込み。恒久修正は REQ-117 系（機械工程の堅牢化）との突合を推奨
- baseline: main HEAD e10d9e8c0fd9656e8ee1aba6b218bba4f297f6d7、観測 2026-11-04、対象は本 script の Case #3910 実行 1 回の報告 JSON と worktree `.worktrees/3910-definition` の check_integrity 報告
