---
title: worktree 内 checker 検出と main 側解消状況の突合規律（pre-existing 陳腐化の帰属判定）
created: 2026-09-29
updated: 2026-09-29
---

## 知識内容

worktree で check_integrity full 走査等を実行する Case では、分岐以降に main 側で解消済みの pre-existing 違反が worktree 側に残留し得る。worktree 側検出を main 側の解消状況（並行 Case のマージ）と突合し、pre-existing（分岐前に由来し main で未解消）と解消済み（main 側で修正済み）を区別する。worktree 側で安易に再生成・修復すると並行マージ済み修正と競合し得るため、帰属判定を経てから処置する。

## 適用条件

- worktree 上で integrity checker（AUTOGEN 鮮度・req-health-metrics 計測日等）の full 走査を実行し、自 Case 変更範囲外の違反を検出した場合
- 分岐以降に origin/main へ並行 Case のマージが入っている可能性がある場合

## 適用対象

- docs-check 判定・worktree 検証運用（case-close QG 実測、check_integrity full 走査）
- AUTOGEN 再生成・修復対応の可否判断

## 根拠

- Case #3190（PR #3205）の Capture 回収。検出 4 件（docs/decisions/README.md 系 3 件・req-health-metrics 計測日 1 件）は PR #3207（merge 1fd42e08）で解消済み、merge 後 main（1084358d）の check_autogen_freshness 再実行 0 件を機械確認
- learning inbox #3211 IR-055 エントリ（host main 同一実測で pre-existing を証明する手順）と同型の帰属判定知見

## 関連知識

- [qg4-baseline-detached-worktree-reproduction.md](qg4-baseline-detached-worktree-reproduction.md)
- QG-4 checker 実測の merge 直前 HEAD 実施・baseline provenance 検査（backlog-review 2026-09-29 で RU 化済みの方針）