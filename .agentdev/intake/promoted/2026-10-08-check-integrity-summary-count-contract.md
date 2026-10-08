# check_integrity の new unmanaged NG 集計とレポート本文件数の突合契約を明記する

統合元: 2026-10-08-case-3537-check-integrity-new-unmanaged-ng-count-mismatch.md

## 観測内容

Case 3537（Wave 2-5）の case-run 実行で、check_integrity の stderr サマリの「8 new unmanaged NG」表記に対し、レポート本文の NG 行が 7 行など、new unmanaged NG 集計（stderr サマリ）とレポート本文の NG 件数が乖離する表示があることを確認した（PR 3544 本文 Findings 記録）。

2026-10-08 再検証時の状況:

- 乖離現象自体は現時点で非再現（再実行で new unmanaged NG 0 件のため乖離表示が発生しない。乖離は new unmanaged NG 1 件以上の実行でしか観測できない）。Case 3537 実行時の一次レポートは .agentdev/integrity/reports/（git 管理外・非永続）由来で再現検証不可
- 一方、別の出力契約の汚れは現行でも再現: check_integrity は exit 0 を返しながら stderr に `fatal: path '...' exists on disk, but not in '<commit>^'` を 40 行超出力する（新規ファイルの diff 前状態参照失敗が毎回発生）。stderr を集計根拠として使う運用（件数突合・由来分類）では stderr が常時汚染される

## 影響

由来分類（既知欠陥・本変更起因）の件数突合で集計基準が曖昧になり、case-close の由来分類判定で証跡照合の手間が増える。誤分類や見過ごしのリスク。stderr の fatal 汚染はエラー通知との区別を困難にする。

## 課題（backlog-review → req-define 向け）

1. check_integrity の new unmanaged NG 集計基準（stderr サマリとレポート本文の件数の対応関係）を一致させ、集計定義を checker 実行契約（docs/designs/responsibilities/custom-tool-contracts.md または checker-execution-contracts.md）へ明記する
2. 乖離が再発した場合に比較可能なよう、再現条件（new unmanaged NG 1 件以上の実行で stderr サマリ件数とレポート本文 NG 行数を突合する手順）を解決条件に含める
3. stderr の fatal 出力（新規ファイルの親コミット参照失敗）を WARN 系の stdout へ分離するか抑制するかの出力契約整理を含める

## 既存成果物との関連

learning promoted「existing-measure-update-verification-diff-checker-mandatory-elements.md」（PR 本文検証差分セクションの checker 別必須要素化）と同型の「集計と明細の突合可能性」問題クラスだが所有が異なる: 本件は checker 自身の出力契約、learning 側は PR 本文検証差分の記録様式（v4-durable-state-and-recovery の記録契約）。統合せず、backlog-review で「checker 出力側 / 記録様式側」の区分を保って相互参照すること。

## 元 observation（参照）

- https://github.com/yogata/agent-dev-flow/pull/3544（Wave 2-5・Issue 3537 Findings）
