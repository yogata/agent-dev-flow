---
title: QG-4 で baseline object が参照不能な場合は原因調査3確認を前置し対策3系統から選定して解消する（detached worktree 再現の3点確認による pre-existing 分類を含む）
created: 2026-09-27
updated: 2026-09-27
---

# QG-4 で baseline object が参照不能な場合は原因調査3確認を前置し対策3系統から選定して解消する（detached worktree 再現の3点確認による pre-existing 分類を含む）

## 知識内容

QG-4 で baseline 再現を要する integrity suite fail の由来分類では、delta 比較の基準 commit object がクローン内に存在しない場合（fatal: bad object）、比較が参照可能な範囲で動作し、検出件が当該変更と無関係の既存状態になり得る。この事象に対しては、まず「baseline commit 参照不能時の原因調査前置（3確認）」で原因クラスを特定し、「対策3系統の選定」に基づき対策を実施した上で、由来分類が必要な場合は「pre-existing 分類の3点確認」を行う。

### baseline commit 参照不能時の原因調査前置（3確認）

baseline commit 参照不能を検知した場合は、対策を選定する前に次の3確認を実施し、原因クラスを特定する:

1. (i) gc 到達性確認: 検証環境と main root の双方で baseline commit の到達性を確認する。object 存在は `git cat-file -e <sha>^{commit}`、到達経路は `git reflog` と `git log -g --all` で確認する。HEAD・reflog は worktree ごとに独立して保持されるため、per-worktree HEAD・reflog を含めて検証環境 worktree と main root の双方で確認する
2. (ii) shallow / partial clone 状態確認: `git rev-parse --is-shallow-repository` と `.git/shallow` の有無で shallow clone かを確認する。partial clone は `git config extensions.partialclone` と `git config remote.origin.promisor` の設定有無で確認する
3. (iii) fetch / refspec 反映状態確認: `git config remote.<remote>.fetch` の refspec が baseline commit を取得対象に含むかを確認し、fetch 実行前後で `git rev-parse --verify <sha>^{commit}` の成否変化を確認して、baseline commit が fetch 未反映かを判別する

### 対策3系統の選定

原因調査の結果に基づき、次の3系統から単独または組合せで対策を選定する。baseline commit 参照不能のまま、黙って参照可能な範囲で delta 比較を継続してはならない:

| 系統 | 内容 | 適する原因クラス |
|---|---|---|
| (1) fetch + refspec による明示的取得 | `git fetch <remote> <sha>` による明示的取得、または refspec 調整後の fetch で baseline commit を取得する | (iii) fetch 未反映・refspec 除外 |
| (2) baseline commit へのタグ付与による恒久化 | タグ付与で baseline commit の到達性を ref として保護する。命名・保管・削除は「タグ運用手順」節に従う | (i) gc による到達性喪失（ref 削除・reflog 期限切れ）の解消と予防 |
| (3) 他環境での対照実行または警告付き skip | baseline commit 参照可能な他環境（main root・別 clone 等）で当該テストを対照実行するか、原因記録と選定根拠を明示した警告付きで該当比較を skip する | (1)(2) を適用できない環境制約（shallow boundary 越えの取得不能等） |

選定した対策（単独または組合せ）の実施結果と選定根拠を合格記録に含める。

### タグ運用手順（命名・保管・削除）

対策 (2) のタグ付与は次の運用手順に従う:

- 命名: `qg4-baseline/<12桁短縮sha>` 形式とする（例: `qg4-baseline/bac3ca4b1234`）
- 保管: リポジトリローカルに作成し、remote へ push しない（参照保証の対象は検証環境と main root のローカルリポジトリに限定する）
- 削除: baseline 比較の検証完了後に `git tag -d <tag>` で削除し、`git tag --list 'qg4-baseline/*'` で残留タグがないことを確認する

### pre-existing 分類の3点確認

対策実施後も比較継続が不能な場合、または対策実施後の検出件の由来分類では、次の3点確認により pre-existing（由来不明 0 件）と分類する:

1. (i) 単独再実行: 当該テストを単独で再実行し同一 fail を確認する
2. (ii) baseline detached worktree 再現: 対策で取得・保護した baseline commit の detached worktree（stash 不使用の標準手順・ワークツリー変更ゼロを維持）で同一テストを再現する
3. (iii) main root 確認: base と同一 commit の main root（変更ゼロ）でも確認する

merge 判断の blocker からの除外は、由来不明 0 件の確認後とする。QG-4 fail 全件由来分類・由来不明 0 件の機械受理基準は agentdev-quality-gates が所有する。

## 適用条件

- case-close QG-4 で delta 比較の baseline commit object がワークツリーから参照不能（fatal: bad object）な場合
- delta 比較テストが PR 変更対象外ファイル由来の検出を報告し、由来分類を要する場合

## 適用対象

- case-close QG-4 で baseline 再現を要する integrity suite fail 全般
- agentdev-quality-gates の QG-4 fail 由来分類手順
- baseline commit 参照不能時の原因調査前置と対策選定（fetch + refspec による明示的取得、baseline commit へのタグ付与、他環境での対照実行・警告付き skip を含む。REQ-007-013）

## 根拠

- REQ-007-013（baseline 比較に用いる baseline commit が検証環境から参照不能となる事象への原因調査前置と対策3系統選定）
- Case #3158（case-close STEP-2、QG-4 フル suite 正規形）: IR-055 runtime-unresolved-reference delta 回帰テストが 1件 fail。baseline object `bac3ca4b...` が参照不能な一方テストは継続動作し、PR 変更対象外ファイル由来の検出 2件を報告。3点確認で pre-existing と分類し、QG-4 停止報告 1回のユーザー確認（再開条件充足と merge 継続指示）を経て merge 判断から除外した（PR #3160、check_integrity.test.ts、Issue #1782〔IR-055〕）。

## 関連知識

- agentdev-quality-gates SKILL からの実践例参照は未実施（配布反映候補は 2026-09-27 ユーザー承認で棄却）
- [Windows PowerShell の一括読み書きによる UTF-8 ファイル破壊リスク](windows-powershell-bulk-io-corruption.md)（検証環境 Windows のファイル I/O 標準手段）
