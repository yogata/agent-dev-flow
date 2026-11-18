---
id: learn-20261118-capture-commit-unpushed-canonical-divergence
created_at: 2026-11-18
source: case-run deviation capture (Root Case #4150)
status: inbox
---
# case-ready 前回実行の capture commit が未 push のまま残存し設計PR merge 後の canonical 再取得が分岐で失敗した

- 問題事象: case-ready 前回実行が deviation capture を main へ commit（783bade11、learning inbox +16 行）した際に push を行わず、その後の設計PR squash merge（90eb18ba1）で main が分岐し、canonical 再取得の ff-only merge が失敗した。重複分析は重複なしの独立変更であり、自動 rebase・自動 reset を行わずユーザー判断を要求する契約に従って停止した
- 発生局面: case-ready STEP-2 の canonical 再取得（Case #4150、PR #4152 squash merge 直後の再実行）
- 検知方法: canonical-and-cleanup script の分岐検出（ahead 1 / behind 1、aheadCommits / behindCommits 一覧付き）と git diff origin/main HEAD --name-status の重複分析
- 根本原因: capture commit を push せずローカル main に残した状態で設計PR merge が先行した。capture 側の push タイミングまたは canonical 再取得前の分岐前置確認が手順に明示されていない
- 自律対応内容: 分岐検出事実の確認、重複分析（独立変更）、ユーザー判断要求（rebase 推奨・reset --hard 代替の選択肢提示）と再開条件を Root Case へ記録した
- ユーザー確認有無: あり（独立変更分岐のユーザー判断要求契約による停止。対応選択肢を提示中）
- Decision/REQ/spec 影響: REQ-061（case-ready 実行契約）、agentdev-workflow-case-ready references/readiness-and-cleanup.md、agentdev-git-worktree references/git-common-procedures.md（Squash merge 後分岐ハンドリング手順）
- 横展開観点: case-close も同型の分岐ハンドリング手順を参照するため、実装 PR merge 後に未 push の capture commit が残ると同様の停止が発生し得る。capture commit は merge 判定より前に push するか、canonical 再取得前に分岐前置確認を行う運用へ統一すべき
- 再発条件: main への capture commit が未 push の状態で Case の PR が merge され、その後に canonical 再取得（ff-only）を実行する場合
- 予防策候補: capture commit の git 永続化手順へ push の明示を追加、または canonical-and-cleanup 実行前の分岐前置確認（fetch と rev-list --left-right --count）を手順に前置する
- 想定反映先: agentdev-workflow-case-ready references/readiness-and-cleanup.md（capture 永続化と canonical 再取得の順序規律）
- 関連: Case #4150、PR #4152、commit 783bade11・90eb18ba1
- タグ: 分岐、canonical 再取得、capture 副作用、停止系
