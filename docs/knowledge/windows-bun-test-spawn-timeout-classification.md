---
title: Windows + bun test の spawn timeout 由来分類と単独再実行手順
created: 2026-09-11
updated: 2026-09-15
---

# Windows + bun test の spawn timeout 由来分類と単独再実行手順

## 知識内容

Windows で integrity suite をフル実行すると、サブプロセス起動（spawn）を伴うテストが bun test の既定 5 秒 timeout で失敗することがある。stdout 途切れによる JSON parse error を含む環境 fail に見えるが、本質は spawn コストに対する timeout 不足である。取り扱いは次のとおりである。

1. 対象テストを `bun test --timeout 120000` 等の十分な timeout で単独再実行する。
2. pass 結果と「環境由来」の根拠（既定 timeout での fail → 延長単独再実行での pass）を QG-4 記録として残す。
3. 延長後も fail が残る場合は環境由来と扱わず、変更起因性を再評価する。timeout 延長だけで fail を無条件に環境由来と扱わない。
4. テスト削除や timeout 無制限化は根拠なく行わない。

timeout 延長・単独再実行で確定できない環境起因が疑われる fail（フル suite 実行時のみ fail する等、suite 全体の負荷が要因の場合）は、main HEAD（PR 変更未適用・working tree clean）で同一テストを再実行する対照実行で再現を確認する。再現する場合は環境起因として記録し、再現しない fail は変更起因として再評価する（環境由来と無条件に扱わない）。環境由来と判定した記録には、対照実行の実行条件（HEAD、working tree 状態、負荷状況）を含める。

対照実行の前提確認として、baseline（main root）は mid-Epic で次子 Issue の manifest 未反映・stale junction 状態により stale になり得るため絶対視しない。対照実行で再現した fail については PR HEAD（worktree）での同一テスト結果を併記し、「main 環境固有で PR HEAD では pass」の環境起因（無効分類）と「baseline で再現する pre-existing」を区別する（前提確認は由来分類の追加条件であり、既存の安全側規定の免除ではない）。

検査対象が別 OU 専属成果物（`.agentdev/extensions/**` 等）を横断検査する構成（配布物削除 Case 等）では、fail の由来分類前に Epic Wave の専属割当を確認し、後続 OU 専属の計画的依存として分類する。QG-4 の fail 由来分類記録に PR HEAD 結果の根拠併記を反映する候補は、要件化経路（req-define）で確定する。

## 適用条件

- Windows（win32）+ bun 環境で、サブプロセスを起動する integrity test が既定 timeout で失敗する場合。
- 高負荷時に spawn を伴うテストが既定 5 秒 timeout で fail し、環境由来か変更起因かの由来分類が必要な場合。
- timeout 延長による単独再実行では対応できない場合（suite 全体の負荷が要因等）に、main HEAD 対照実行による切り分けが必要な場合。
- QG-4 で fail 由来分類を記録する場面。
- mid-Epic 進行中に main root を baseline とする対照実行を行う場合（main root 環境の stale 可能性の確認と PR HEAD 結果の併記）。
- 配布物削除 Case 等、別 OU 専属成果物を横断検査する suite の fail 由来分類を行う場合（専属割当の確認と計画的依存としての分類）。

## 適用対象

- case-run / case-close での integrity suite 実行・由来分類手順。
- `docs/designs/skills/agentdev-quality-gates.md` の QG-4 fail 由来分類・fallback 契約に従う検証手順。
- Windows + bun のサブプロセス起動を伴うテスト全般。

## 根拠

- #12、PR #2749 / #2750: Windows 高負荷時の spawn 伴走テストが既定 5 秒 timeout で失敗し、`--timeout 120000` による単独再実行で pass、由来分類を環境由来として記録した観測。
- QG-4 の fail 由来分類・単独再実行の契約は既存（agentdev-quality-gates）。Windows の既定 5 秒 timeout と延長値の具体例は未整理だったため本知識文書へ整理した。
- inbox 2026-09-12: spawnSync 回帰テスト 4 件が 5 秒タイムアウト fail、main HEAD で再現確認し環境起因と判定（Issue #1782/#2245 由来）。フル suite 時のみ fail する環境依存 staging テストを基底 commit 再現比較で pre-existing 分離した前例（deferred 2026-09-05）と同根の手順を対照実行として統合した（発生3件相当）。
- PR #2817（Issue #2809、case 2805 OU-004、DEL-2809-1）: main root での対照実行が worktree（PR HEAD）より 4 件多い fail を出した観測（mid-Epic の main root が次子 Issue の manifest 未反映 / stale junction 状態が原因。同一テストは PR HEAD worktree では pass）。
- PR #2818（Issue #2810、case 2805 OU-005、DEL-2810-1）: integrity suite が OU-006 専属の `.agentdev/extensions/**` を横断検査し、旧参照残存で本変更側 suite が失敗。専属領域は修正せず Finding として記録し、横断検査 fail を後続 OU 専属の計画的依存として由来分類した観測。

## 関連知識

- [checker CLI の stdout 証跡が Windows + bun で失われる問題と安定実行経路](checker-cli-stdout-loss-on-windows-bun.md)（stdout ロスは別現象。JSON parse error に見える fail の切り分けで関連）。
- [Windows PowerShell の一括読み書きによる UTF-8 ファイル破壊リスク](windows-powershell-bulk-io-corruption.md)（Windows 環境の検証系知識）。
- [bun test の fail 証跡は junit reporter で構造化取得する](bun-test-junit-reporter-evidence.md)（fail の証跡取得・差分分離手法）。
- [bun test 実行形態逸脱の検知条件と判別観点](bun-test-execution-form-drift-signals.md)（実行形態逸脱（repo root 外 cwd・`./` なしパス指定）由来の fail 判別。timeout 由来との切り分け）。
