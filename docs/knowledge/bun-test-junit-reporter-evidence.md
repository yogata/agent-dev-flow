---
title: bun test の fail 証跡は junit reporter で構造化取得する
created: 2026-09-13
updated: 2026-09-14
---

# bun test の fail 証跡は junit reporter で構造化取得する

## 知識内容

bun test の進捗表示は CR（キャリッジリターン）上書き + ANSI カラーコード前提の形式で出力されるため、非 TTY（リダイレクト）環境で log ファイルへ保存すると、上書き前の fail 行が実質残らない場合がある。fail 差分分離が必要な検証では、次の手順で構造化証跡を取得する。

1. `--reporter=junit --reporter-outfile` オプション付きで bun test を実行し、junit XML を出力する。
2. XML を機械的に解析（ElementTree 等）し、fail ケース名を抽出して差分分離を行う。
3. 実行コマンド列（reporter オプション付き）を証跡に併記し、再実行可能性を保つ。

標準出力の tail 集計行（pass/fail 数のサマリ）だけを証跡としない。fail ケース単位の同定が不可能なためである。junit XML の読み取りは目視で行わず機械解析に限定する。

## 適用条件

- 非 TTY 環境（リダイレクト先 log ファイル）で bun test の標準出力を証跡保存に使う場合。
- base と現行の fail 差分分離が必要な検証（fail 行が log 上に残らないため目視分離が不能な場合）。

## 適用対象

- bun test の結果を証跡として保存する全検証工程（case-run / case-close の QG 検証、CI 代替のローカル検証）、fail 差分分離。
- checker CLI の stdout 証跡は対象外（別現象。関連知識を参照）。

## 根拠

- case 2777: base 2486 pass/4 fail/4 errors と変更後 2488 pass/4 fail/4 errors の差分分離が必要な場面で、保存 log に fail 行がなかった。junit reporter + XML 解析で fail ケース名を機械抽出し、差分 0 を確認した観測（inbox 2026-09-12）。

## 関連知識

- [checker CLI の stdout 証跡が Windows + bun で失される問題と安定実行経路](checker-cli-stdout-loss-on-windows-bun.md)（別現象の判別。checker CLI は process.exit flush・cp932 再解釈起因、本知識は bun test runner 出力の CR/ANSI 上書き起因）。
- [Windows + bun test の spawn timeout 由来分類と単独再実行手順](windows-bun-test-spawn-timeout-classification.md)（fail の由来分類・記録手順）。
- [bun test 実行形態逸脱の検知条件と判別観点](bun-test-execution-form-drift-signals.md)（実行形態逸脱（repo root 外 cwd・`./` なしパス指定）由来の fail・0 件実行の判別。fail 証跡取得前の実行形態確認）。
