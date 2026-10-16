# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

---

## case-auto 実装実行委譲の起動不能時のインライン自己適用実績（baseline: main @ 273c1510・2026-10-16・計測範囲: Case #3758 実行）

- **問題事象**: backlog-auto stage 5（case-auto）の case-run 実装実行委譲において、実行担当サブエージェント起動 API（実装委譲向け）が実行ハーネスで利用不能だった
- **発生局面**: 実装（Case #3758 stage 3・9 Issue 実行）
- **検知方法**: 委譲起動手段の存在確認（実行ハーネスの起動 API 一覧照合）
- **根本原因**: 実行ハーネスの一般サブエージェント起動手段が研究系（explore / librarian）に限定され、実装実行委譲の起動経路が未提供
- **自律対応内容**: 親指示（分断逐次化禁止・完走指示）に従い、委譲工程をインライン自己適用で実施。case-run 委譲契約の 4 状態 result・3 点ゲート・worktree 隔離・PR 本文証跡は準用し、実行主体の正直記録を Root Case と完了報告へ記録
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: REQ-031 / REQ-034 の委譲起動不能時契約（delegation-unavailable 報告・インライン切替禁止）と本実績の乖離の再評価候補
- **横展開観点**: 同一ハーネスでの e2e 実行は同様の自己適用になる可能性
- **再発条件**: 同一ハーネス（実装委譲起動 API 不在）で case-auto を実行した場合
- **予防策候補**: harness-delegation reference の起動手段表と実行ハーネス実態の突合を case-auto 起動時に実施する観点
- **想定反映先**: 委譲契約 Design・case-run 委譲契約の観測記録
- **関連**: Case #3758、PR #3775
- **タグ**: #case-auto #委譲 #e2e

## 配布依存境界 checker の実行コンテキスト差によるスキャン集合差異（baseline: main @ 273c1510・2026-10-16・計測範囲: Case #3758 STEP-3 最終 gate 実測）

- **問題事象**: 配布依存境界 checker（source profile）のスキャン集合が worktree cwd 実行時 434 ファイル・main root 実行時 482 ファイルとなり、worktree 事前 gate が concrete-id 違反を検出せず main 最終 gate で検出した
- **発生局面**: 検証（Case #3758 case-close STEP-3）
- **検知方法**: 最終 gate の failures 1 件（[concrete-id] REQ-052）と事前 gate pass の突合
- **根本原因**: 実行 cwd（junction 伝播状態・スキャン対象解決）により検査対象集合が変動し得る経路の存在
- **自律対応内容**: test-fix ループで違反文を修正（PR #3775）し最終 gate 通過。検出平面差を実行記録へ記録
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし
- **横展開観点**: 配布依存境界 checker を worktree で実行する gate の実行 cwd 規律の確認観点
- **再発条件**: worktree cwd での checker 実行が main root 実行と異なるスキャン集合に解決される場合
- **予防策候補**: checker 実行 cwd・scanned 数の gate 記録への必須記載観点
- **想定反映先**: 配布依存境界 Design・checker 実行契約
- **関連**: PR #3775（Findings に同一記録）
- **タグ**: #配布依存境界 #gate #e2e

## case-ready canonical-and-cleanup の ff-only merge が squash merge 後の分岐で失敗（Case #3776）

- **問題事象**: case-ready STEP-7 の工程別 script（accept_definition_checks.ts、phase: canonical-and-cleanup）が pr_merge（squash）直後の main で「git fetch origin main → merge --ff-only origin/main」を実行したが、ローカル main に case-open 由来の draft 永続化 commit（未 push、5abf6f06）が残っていたため分岐（Diverging branches）となり ff-only merge が失敗した（baseline: main HEAD bb6b7e0c の直前、Case #3776、2026-10-16、Case #3776 の case-ready 実行）
- **発生局面**: case-ready STEP-7（canonical 再取得と draft/RU 削除）
- **検知方法**: script 報告 JSON の canonical-reacquisition step が fail（exit 1、stderr に「Diverging branches can't be fast-forwarded, aborting」）
- **根本原因**: case-open が draft 永続化 commit をローカル main に積んだまま設計PR（squash merge）を作成するため、squash merge 後の origin/main とローカル main は常に分岐する構造になっている。canonical-and-cleanup の ff-only 経路はこの分岐を想定していない
- **自律対応内容**: agentdev-git-worktree の squash merge 後分岐ハンドリング手順（git-common-procedures.md 手順 8）で重複分析（ローカル先行 commit の draft ファイルと squash commit の docs 9ファイルの重複なし＝独立変更）を実施した後、git rebase origin/main でローカル先行 commit を再適用し canonical 同期を成立させた（重複ゼロのため conflict なしで自動解決）
- **ユーザー確認有無**: なし
- **Decision/REQ/spec影響**: なし（正規手順の適用で解消。script の ff-only 経路と自工程 merge method（squash）の構造不整合という改善余地の記録のみ）
- **横展開観点**: case-revise 由来の設計修正PR squash merge 後の case-ready 再実行、および同一 Case での draft 永続化 commit 残存の全ケースで同一条件が再現し得る
- **再発条件**: ローカル main に未 push の commit がある状態で pr_merge（squash）を完了し、case-ready の canonical-and-cleanup（removalPaths の有無にかかわらず）を呼び出した場合
- **予防策候補**: canonical-and-cleanup script への分岐検出時の rebase フォールバック組込み、または case-ready 手順の script 呼出前に分岐ハンドリング手順 8 を前置する運用規律の明記
- **想定反映先**: agentdev-workflow-case-ready scripts（accept_definition_checks.ts）、case-ready workflow skill references（readiness-and-cleanup.md）
- **関連**: Case Issue #3776、src/common/skills/agentdev-workflow-case-ready/scripts/src/accept_definition_checks.ts、src/common/skills/agentdev-git-worktree/references/git-common-procedures.md（手順 8）
- **タグ**: #git-workaround #case-ready #squash-merge
