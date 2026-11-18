---
id: learn-20261119-verification-tmp-output-placement-untracked-residue
created_at: 2026-11-19
source: case-run deviation capture (Root Case #4150・PR #4161)
status: inbox
---
# push 出力の退避先を worktree root に置いた結果、退避ファイル自身が untracked-residue 検出で pre-push を自己誘発失敗させた

- 問題事象: pre-push attempt1 で push 出力の退避先を worktree root に置いたところ、退避ファイル自身が untracked-residue 検出に引っかかり pre-push が自己誘発失敗した。退避先を .agentdev/tmp/ へ修正した attempt2 で通過した
- 発生局面: case-run（Issue 4156・Case 4150 Wave-4・PR 4161・pre-push attempt1）
- 検知方法: pre-push Step の untracked-residue 検出（リポジトリ全体の未追跡・gitignore 管理対象外の検出）
- 根本原因: 検証用一時資材の配置先が REQ-118 配置規則（.agentdev/tmp/ 等の管理外領域）に従っていなかった
- 自律対応内容: 退避先を .agentdev/tmp/ へ修正（attempt2 で通過）
- ユーザー確認有無: なし（配置修正のみ）
- Decision/REQ/spec 影響: 特になし（REQ-118 配置規則の遵守に戻した）
- 横展開観点: 検証用一時資材（stdout/stderr 退避・検査入力 JSON 等）の配置は初手から .agentdev/tmp/ 等の管理外領域へ置く。untracked-residue 検出を含む検証の実行中に、検証用資材を worktree root 等へ置くと検証対象が自己参照して失敗する
- 再発条件: untracked-residue 検出を含む検証の実行中に、検証用一時資材を検出対象領域へ配置した場合
- 予防策候補: 検証手順のテンプレートに退避先（.agentdev/tmp/）を明記し、検証実行前に退避先の配置規則適合を前置確認する
- 想定反映先: REQ-118（検証に伴う一時資材の取扱い）、checker 実行契約の stdout 退避形式の配置前置
- 関連: Case 4150、Issue 4156、PR 4161（Findings F7）
- タグ: 一時資材、配置規則、untracked-residue、自己誘発失敗
