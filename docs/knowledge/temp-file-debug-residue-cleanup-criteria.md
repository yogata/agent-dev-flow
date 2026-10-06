---
title: temp 領域デバッグ残渣の削除基準と provenance 記録
created: 2026-10-07
updated: 2026-10-07
---

# temp 領域デバッグ残渣の削除基準と provenance 記録

## 知識内容

デバッグ・検査目的で temp 領域（非永続領域〔一時ディレクトリ等のリポジトリ外〕・`.agentdev/tmp/`）に作成した一時ファイルは、作成者・作成契機・削除時期が文書化されないまま残存し、後続の worktree 運用・検査で「誰の何のためのファイルか判別不能な残渣」となる。本知識は残渣化を防ぐ削除基準を定める。

### 削除基準

- デバッグ目的の一時ファイルは当該作業セッション終了時（委譲単位の完了・Case の close）に作成者が削除する
- 削除できない事情（失敗調査の進行中等）がある場合は、ファイル名または同梱の provenance メモに由来（作成契機・Case/PR 番号・削除予定条件）を記録する
- 証跡性が求められる内容（失敗出力・検査入力の写し等）は一時領域に置いたままにせず、恒久証跡チャネル（intake item・learning inbox・`.agentdev/` 配下の正規領域）へ退避してから削除する

### 実施契機（記録面の知見）

- 削除の実施契機として case-run の機械工程や case-close への組み込み（自動削除・確認ステップ化）が考えられるが、これは工程変更（機械化）を伴うため本知識文書の範囲外とする。組み込みを検討する場合は変更要求（intake item / RU）として起票する
- 一時配置の規律（配置先の適用範囲限定・`.agentdev/tmp/` の扱い）は worktree-operations.md「退避ファイルの統一配置」節が正であり、本知識は削除基準面のみを担う

## 適用条件

- デバッグ・検査の一時ファイルを temp 領域に作成した場合
- worktree 運用で一時ファイルの残渣が後続検査・削除操作の障害になり得る場合
- 一時ファイルに証跡性のある内容が含まれる場合

## 適用対象

- case-run / case-close の worktree 運用で一時ファイルを作成する全工程
- 検査・lint のための専用本文ファイル（検査後即時削除を前提とするもの）の運用
- `.agentdev/tmp/` に退避した作業ファイルの管理

## 根拠

- temp 領域のデバッグ残渣が削除基準・provenance・保持期間なしに残存した事象の観測（intake item 2026-10-05-temp-debug-residue-cleanup-criteria、backlog-review 2026-10-07 で知識化）
- worktree-operations.md:289-294「退避ファイルの統一配置（.agentdev/tmp/）」の配置規律と、証跡の生存期間問題（同節の指摘）

## 関連知識

- [worktree-environment-fail-classification.md](worktree-environment-fail-classification.md)（worktree 環境差 fail の由来分離と依存前提の実行形態知見）
- worktree-operations.md「退避ファイルの統一配置」節（配置規律の正。本知識は削除基準面を分担）
