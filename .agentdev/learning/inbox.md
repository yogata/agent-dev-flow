# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## prepare_definition_pr.ts 計測日収束が既存 IR-072 NG ファイルへ当日日付を設定し収束残す

- **問題事象**: Root Case #4071 の設計PR 機械工程（prepare_definition_pr.ts）で check_integrity が失敗し、内蔵の計測日収束 step が req-updated-freshness NG 対象ファイル（docs/designs/local/adf-simplification-deferred-records.md）の frontmatter updated を当日（2026-11-15）へ進行させた。当該ファイルの内容最終変更 commit は 2026-11-14（origin/main 由来）のため、IR-072 の一致判定は解消せず NG が残った。
- **発生局面**: 実装（case-open STEP-4 機械工程・worktree での check_integrity 実行）
- **検知方法**: script 報告 JSON の check_integrity step 失敗と、収束後の check_integrity 再実行で NG 1 件が残存したことによる検出
- **根本原因**: 収束 step の補正値が「当日日付（commitDate）」で固定されており、PR の変更対象ではなく内容変更日が過去日の既知 NG ファイル（delta 未登録）に対しては、checker が要求する正確な収束値（内容最終変更日）とずれる
- **自律対応内容**: 当該ファイルの updated を内容最終変更日（2026-11-14）へ補正する明示パス commit を追加し、check_integrity の未管理 delta を main 実測（3 件）から 1 件（OU-009 管轄の IR-053 warning）へ減らして収束させた
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（REQ-119-002・REQ-010-081 の運用枠内の補正。収束 step の補正値算出の改良案が積み残し候補）
- **横展開観点**: 機械工程 script が checker 報告を解釈して自動補正する他箇所（close_mechanical_steps 等）でも、補正値を「報告が要求する値」と「実行日」のどちらから導くかを区別する必要がある
- **再発条件**: PR 変更対象外かつ IR-072 の ng-baseline 未登録ファイルが corpus に残存した状態で機械工程を実行した場合
- **予防策候補**: 収束 step が req-updated-freshness 報告から対象ファイルの内容最終変更日（author date）を抽出して補正値とする
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts（runMeasurementDateConvergence）
- **関連**: Issue #4071・PR #4072・docs/designs/integrity/rules/IR-072-req-updated-freshness.md
- **タグ**: `#ci` `#機械工程` `#worktree`

## 機械工程の stagePaths 外に generate_indexes 再生成出力が残置する

- **問題事象**: 同機械工程で generate_indexes が .opencode/skills/repo-agentdev-integrity/data/skill-projection-manifest.yaml（generated_at のみ変化）と、収束後再実行で docs/designs/quality/req-health-metrics.md を再生成したが、いずれも stagePaths 指定外のため commit されず作業 worktree に残置した。manifest は起源が worktree 環境のタイムスタンプ更新のみのため破棄し、req-health-metrics.md は追補 commit で確定した。
- **発生局面**: 実装（case-open STEP-4 機械工程・収束 step の generate_indexes 再実行）
- **検知方法**: script 報告 JSON の diff.changedFiles と stagePaths の差分照合、および worktree の git status 確認
- **根本原因**: 収束 step の再実行出力が stage-and-commit step の後で working tree へ書かれる構造であり、stagePaths は呼出側が事前構成するため、再生成物のうち事前予測できなかった分は commit 対象から外れる
- **自律対応内容**: manifest は worktree 環境由来のタイムスタンプのみの変化として checkout で破棄（OU-013 の鮮度整備に委譲）、req-health-metrics.md は明示パスの追補 commit で確定した
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（TS-012(5) と OU-013 が鮮度規律の正を所有）
- **横展開観点**: 報告 JSON の changedFiles と stagePaths の差分は機械工程実行後の常規確認点とできる
- **再発条件**: 収束 step が generate_indexes 再実行を発動する条件（計測日 drift）が成立した場合
- **予防策候補**: 収束 step が再実行後に再生成対象を明示パスで追加 commit する
- **想定反映先**: src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts（runMeasurementDateConvergence）
- **関連**: Issue #4071・PR #4072
- **タグ**: `#機械工程` `#worktree`
