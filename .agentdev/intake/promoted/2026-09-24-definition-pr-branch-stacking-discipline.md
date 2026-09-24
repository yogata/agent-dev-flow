# 並行 case-open 由来の Definition PR branch スタック構造（case-auto stage-2 で実観測）

## 観測内容

case-auto stage-2（case-ready 並行実行 4/7、Case #3089）において、自 Case の Definition PR #3092（branch `definition/issue-3089`）が兄弟 Case の Definition commit を含むスタック構造であることを実観測した。

- branch 構成: `definition/issue-3089` = origin/main(4452d7ca) + cb59cb4e（Case #3088 由来） + 907a081e（Case #3087 由来） + b9678628（Case #3089 自身）。各 commit は git log で実在確認済み。GitHub の pr_changed_files は REQ-001.md / REQ-018.md を含む 9 ファイルを報告した一方、親 orchestrator の事前 overlap 分析は「#3091=REQ-001.md、#3090=REQ-018.md、#3092 は README AUTOGEN のみ、重複なし」を前提としており、乖離があった。
- 実際の merge 順序: 兄弟 #3090（f67217d8）→ #3091（efca2e4d）が先に squash merge 済みであったため、#3092 の実効 squash diff は自 Case 分（7 ファイル）のみで収まり、二重取り込み・競合は発生しなかった（merge は MERGEABLE 確認後 1 回で成功、main 4524c9f9）。
- リスク: スタック底の PR が最後に merge された場合、後続 merge の PR diff が空（nothing to merge）または README AUTOGEN 等の同一領域競合になり得る。親の並行 merge 競合指示（rebase 1 回・blocked 報告）で救済されるが、原因は stage-1 の branch 作成時点のベース選択にある。

## 影響

空 diff による nothing to merge、README AUTOGEN 等同一領域の競合、pr_changed_files と overlap 分析の乖離による親の誤判断。

## 課題

- stage-1 並行委譲時の Definition branch 作成を、各 branch が origin/main HEAD から独立に作成する規律として明記する、または stage-2 merge 前に親がスタック構造を検出・解消（rebase）する手順を明記する。
- pr_changed_files の親への事前報告と overlap 分析の突合検査（宣言された変更ファイル集合と GitHub 実報告の差分検査）。

処分区分候補: edge_case（中優先度）。

## 既存要件との関連

REQ-083 は Definition branch の命名のみを規定。REQ-032-010/011 は merge 失敗後の事後救済（rebase）のみを規定し、スタック構造の予防段階は未被覆。
