---
title: QG-4 で baseline object が参照不能な integrity suite fail は detached worktree 再現の3点確認で pre-existing 分類する
created: 2026-09-27
updated: 2026-09-27
---

# QG-4 で baseline object が参照不能な integrity suite fail は detached worktree 再現の3点確認で pre-existing 分類する

## 知識内容

QG-4 で baseline 再現を要する integrity suite fail の由来分類では、delta 比較の基準 commit object がクローン内に存在しない場合（fatal: bad object）、比較が参照可能な範囲で動作し、検出件が当該変更と無関係の既存状態になり得る。この場合、次の3点確認により pre-existing（由来不明 0 件）と分類する:

1. (i) 単独再実行: 当該テストを単独で再実行し同一 fail を確認する
2. (ii) baseline detached worktree 再現: PR 分岐点の baseline commit の detached worktree（stash 不使用の標準手順・ワークツリー変更ゼロを維持）で同一テストを再現する
3. (iii) main root 確認: base と同一 commit の main root（変更ゼロ）でも確認する

merge 判断の blocker からの除外は、由来不明 0 件の確認後とする。QG-4 fail 全件由来分類・由来不明 0 件の機械受理基準は agentdev-quality-gates が所有する。

## 適用条件

- case-close QG-4 で integrity suite の delta baseline commit object がワークツリーから参照不能（fatal: bad object）な場合
- delta 比較テストが PR 変更対象外ファイル由来の検出を報告し、由来分類を要する場合

## 適用対象

- case-close QG-4 で baseline 再現を要する integrity suite fail 全般
- agentdev-quality-gates の QG-4 fail 由来分類手順
- 対象外: delta baseline commit object の永続化・ラベリング方針（別途 intake 起票済み）

## 根拠

- Case #3158（case-close STEP-2、QG-4 フル suite 正規形）: IR-055 runtime-unresolved-reference delta 回帰テストが 1件 fail。baseline object `bac3ca4b...` が参照不能な一方テストは継続動作し、PR 変更対象外ファイル由来の検出 2件を報告。3点確認で pre-existing と分類し、QG-4 停止報告 1回のユーザー確認（再開条件充足と merge 継続指示）を経て merge 判断から除外した（PR #3160、check_integrity.test.ts、Issue #1782〔IR-055〕）。

## 関連知識

- agentdev-quality-gates SKILL からの実践例参照は未実施（配布反映候補は 2026-09-27 ユーザー承認で棄却）
- [Windows PowerShell の一括読み書きによる UTF-8 ファイル破壊リスク](windows-powershell-bulk-io-corruption.md)（検証環境 Windows のファイル I/O 標準手段）
