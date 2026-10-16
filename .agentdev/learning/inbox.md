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
