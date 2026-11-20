---
id: learn-20261121-ir044-phase-wording-blocks-definition-commit
created_at: 2026-11-21
source: case-open deviation capture (Root Case #4167)
status: inbox
---

# 合意済み REQ 行の Phase 番号表記が IR-044 ゲート（pre-commit・pre-push）で機械ブロックされ設計PR commit が完結しない

- 問題事象: case-open STEP-4 機械工程（prepare_definition_pr.ts、Root Case #4167）で、合意済み draft（req-draft-structural-slimming-refactor、ACT-REQ-001）を node writeFileSync で worktree 配置した後の明示パス commit が、pre-commit hook の cli.ts --changed で IR-044 warning 3件（REQ-123-003 行「Phase 1」、REQ-123-004 行「Phase 1〜4」、REQ-123-005 行「Phase 1〜4」）により終了コード 1 となり物理ブロックされた。cli.ts 標準モードは warning も終了コード 1（--fail-level は --workflow モード専用）、pre-push の cli.ts 全量実行も同一条件でブロックするため、内容修正なしに設計PRを作れる機械的経路が存在しない
- 発生局面: case-open STEP-4 機械工程の stage-and-commit（worktree .worktrees/4167-definition、branch definition/issue-4167、base origin/main=d95d032b2）
- 検知方法: pre-commit hook の物理ブロック。prepare_definition_pr 報告 JSON の stage-and-commit step stderr に IR-044 違反詳細と終了コード 1（機械工程 script は commit 失敗で以降のゲートを抑止）
- 根本原因: req-define が産出した合意済み REQ 行は Phase 番号（IR-044 の「Phase number」シグナル /\bPhase\s*\d+\b/）を含むが、req-define と case-open はいずれも docs 整合性検査を実行しない（case-open Design「case-open が使用する検査ツール: なし」）。REQ-122-008/009（DEC-066 ローカル Git Hook ゲート、2026-11-18 以降）で warning もコミット・push を物理ブロックするようになり、IR-044 finding_route=req-define の検出が初めてコミットゲートで表面化した。既存 corpus（例: REQ-122）は「第1〜第4フェーズ」表記で数字が前置されるためパターン不一致で通過している
- 自律対応内容: 本文改変（段階名参照への置換）・--no-verify・ルール緩和はいずれも契約違反のため行わず、fail-closed で停止し設計PRは作成しなかった。Root Case #4167 は作成済み・open で冪等再利用可能。worktree・branch・REQ-123.md 配置（未commit）と generate_indexes 派生物（docs/README.md・docs/requirements/README.md、未commit）は再開用に維持
- ユーザー確認有無: あり（停止報告と処置選択肢の提示。該当行の表記修正は req-define 再合意を要するため利用者判断）
- Decision/REQ/spec 影響: REQ-001-049（REQ 行は機能名・フェーズ名で参照し番号を直接参照しない）、IR-044（triage: 段階名参照への置換。前例 REQ-006-099）、REQ-122-008/009（Git Hook ゲートの warning 扱い）、req-define の draft 産出時整合検査の不在
- 横展開観点: 合意済み REQ 行に「Phase N」「Step N」「手順 N」等の IR-044 シグナル語を含む draft は、req-define を通過しても case-open の commit ゲートで必ずブロックされる。draft 合意時の事前チェック（IR-044 シグナル語の走査）で予防可能
- 再発条件: artifact_actions の REQ create/update content が要件テーブル行に /\bPhase\s*\d+\b|フェーズ\s*\d+|\bStep\s*\d+\b|ステップ\s*\d+|手順\s*\d+/ を含む場合
 - 予防策候補: (a) req-define の draft 組立時に IR-044 シグナル語の事前走査と表記ガイダンス適用、(b) IR-044 warning の Phase number シグナルの exemption/前例整備（Phase 番号が実行計画語彙として合意されている場合の扱い）の利用者判断、(c) ゲート側の warning 扱い変更。いずれも利用者判断と別件対応が必要
 - 想定反映先: req-define（draft 組立検査）、IR-044 ルール Design（exemption 条件）、case-open（停止理由分類への記録）
 - 関連: Case #4167、draft req-draft-structural-slimming-refactor（ACT-REQ-001）、REQ-122-003 行（/Phase/ 不一致の対照例）、前例 learn-20261119-definition-pr-preshcheck-rejects-merged-line（case 4162 同型構図）
 - タグ: 機械工程、fail-closed、IR-044、コミットゲート、req-define 差し戻し
