---
intake_type: workflow-observation
source_case: "#3089"
source_workflow: case-ready
observed_at: 2026-09-24T01:30:00+09:00
status: unclassified
---

# 観測: 並行 case-open 由来の Definition PR branch スタック構造（case-auto stage-2 で実観測）

## 観測内容

case-auto stage-2（case-ready 並行実行 4/7、Case #3089）において、自 Case の Definition PR #3092（branch definition/issue-3089）が兄弟 Case の Definition commit を含むスタック構造であることを実観測した。

- branch 構成: `definition/issue-3089` = origin/main(4452d7ca) + cb59cb4e（Case #3088 由来） + 907a081e（Case #3087 由来） + b9678628（Case #3089 自身）。GitHub の pr_changed_files は REQ-001.md / REQ-018.md を含む 9 ファイルを報告した一方、親 orchestrator の事前 overlap 分析は「#3091=REQ-001.md、#3090=REQ-018.md、#3092 は README AUTOGEN のみ、重複なし」を前提としていた。
- 実際の merge 順序: 兄弟 #3090（f67217d8）→ #3091（efca2e4d）が先に squash merge 済みであったため、#3092 の実効 squash diff は自 Case 分（7 ファイル）のみで収まり、二重取り込み・競合は発生しなかった（merge は MERGEABLE 確認後 1 回で成功）。
- リスク: スタック底の PR が最後に merge された場合、後続 merge の PR diff が空（nothing to merge）または README AUTOGEN 等の同一領域競合になり得る。親の並行 merge 競合指示（rebase 1 回・blocked 報告）で救済されるが、原因は stage-1 の branch 作成時点のベース選択にある。

## 候補改善（要判断）

- stage-1 並行委譲時の Definition branch 作成は、各 branch を origin/main HEAD から独立に作成する規律、または stage-2 merge 前に親がスタック構造を検出・解消（rebase）する手順の明記。
- pr_changed_files の親への事前報告と overlap 分析の突合（宣言された変更ファイル集合と GitHub 実報告の差分検査）。

## 関連

- Case #3087 / #3088 / #3089（stage-1 並行委譲 4/7、stage-2 start 2026-09-24T01:11:30+09:00）
- 参考実績: 本観測の範囲では #3092 の merge は成功済み（main 4524c9f9）。REQ-092 の新規要件（issue_list search 併用規律）に基づく未クローズ Case 検出も search + state 指定で上限到達なしに成功した。
