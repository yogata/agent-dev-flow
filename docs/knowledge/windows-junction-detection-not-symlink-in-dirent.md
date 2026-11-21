---
title: Windows の Node.js Dirent 種別判定は junction を symlink として報告しない
created: 2026-11-21
updated: 2026-11-21
---

# Windows の Node.js Dirent 種別判定は junction を symlink として報告しない

## 知識内容

Windows の junction は `readdirSync` 等の Dirent 種別判定では symlink として報告されない実装差がある。`Dirent.isSymbolicLink()` の戻り値はプラットフォーム・Node 版数依存であり、本実行環境（Node v26.12.1）では実在する junction に対して false を返すことを実観測した。

Dirent ベースの列挙で「対象 0 件」を正常系として扱う実装は Windows で静かに失敗する（誤検知ゼロ判定・復元スキップ）。本件は pre-push Step 1 鮮度チェックの失敗という別経路の失敗で初めて検知された静かな失敗であり、検知が失敗経路に依存する構図自体がリスクである。

取り扱いの規約:

1. Windows 環境での junction 判定・列挙は `Dirent.isSymbolicLink()` を使わず、PowerShell `Get-Item` の `LinkType -eq 'Junction'` または Node `fs.lstatSync` ベースの判定へ統一する。
2. junction 列挙・復元系スクリプトには期待件数突合（0 件を異常扱いする fail-fast）を持たせる。
3. Dirent 種別に依存する判定を使う場合は、対象環境・Node 版数での実挙動を実観測で確認してから採用する。

## 適用条件

- Windows 環境で Node.js の readdir / Dirent 種別により junction・リンクを判定・列挙する実装を書く・検査する場面。
- worktree の junction 復元・投影検査・ファイル走査系 checker・スクリプトの実装・見直し場面。

## 適用対象

- Windows ＋ Node.js のファイル走査・リンク検出全般。
- 配布 skill 参照（worktree-operations.md）への手順補記は本知識のシステム変更部分であり、req-define 経路（backlog-review で RU-20261121-09 として要件化済み）で扱う。
- Linux/macOS 環境の symlink 判定、junction 構造自体の変更は対象外。

## 根拠

- Epic #4167（REQ-123 構造スリム化）Wave-4（Case #4172・PR #4176）で、junction 復元スクリプトの Dirent ベース実装が実在 55 件を 0 件と誤判定。PowerShell `Get-Item` の `LinkType -eq 'Junction'` による再判定で 55 件を正しく検出・復元した（成果物変更なし）。
- 既存の worktree-operations.md と docs/knowledge/ に Dirent / isSymbolicLink / LinkType の該当記述なし（grep 実測・2026-11-21 時点）。`Dirent.isSymbolicLink()` の挙動は Node 版数・プラットフォーム依存であり、将来の版数で変わり得る。

## 関連知識

- [worktree 環境の fail 由来分類](worktree-environment-fail-classification.md)（worktree で投影・junction・node_modules 等の git 管理外資産が伝播しない前提の由来分類）
- [bun テスト実行形態ドリフトのシグナル](bun-test-execution-form-drift-signals.md)（worktree 環境での junction projection 挙動と環境ラベル記録）
