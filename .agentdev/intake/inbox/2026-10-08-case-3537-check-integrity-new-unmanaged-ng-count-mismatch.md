# check_integrity の new unmanaged NG 集計とレポート本文件数の乖離表示を一致させる

## 内容

Case 3537（Wave 2-5）の case-run 実行で、check_integrity の stderr サマリの「8 new unmanaged NG」表記に対し、レポート本文の NG 行が 7 行など、new unmanaged NG 集計（stderr サマリ）とレポート本文の NG 件数が乖離する表示があることを確認した（PR 3544 本文 Findings 記録）。

## 影響

由分類（既知欠陥・本変更起因）の件数突合で集計基準が曖昧になり、case-close の由来分類判定で証跡照合の手間が増える。誤分類や見過ごしのリスク。

## 提案

check_integrity の new unmanaged NG 集計基準（stderr サマリとレポート本文の件数の対応関係）を一致させ、集計定義を checker 実行契約へ明記する。

## 根拠

Case 3537 の PR 3544 本文「Findings / Capture候補」intake 節。

https://github.com/yogata/agent-dev-flow/pull/3544
