---
description: intake/learning inbox の自動トリアージ（3ルート自動振り分けとサマリー出力）
---

# Intake トリアージ（自動消化）

`.agentdev/intake/inbox/` と `.agentdev/learning/inbox/` に蓄積した項目を人手を介さず高速消化する軽量自動トリアージコマンドである。
3ルートへ自動振り分けし、各ルートの即時実行と処理結果サマリーの報告まで行う。

## 入力

- なし（`.agentdev/intake/inbox/*.md` と `.agentdev/learning/inbox/*.md`〔.gitkeep 除外〕を durable state から解決する）

## 出力

- 処理結果サマリー（Route A 解決件数、Route B 破棄件数、Route C 昇格件数、残件 0 件の確認）
- Route C 生成物: `.agentdev/backlog/req-units/` への要件ユニット（要件ユニット採番の規律行を適用）

## workflow

本コマンドは workflow 実装本体を `agentdev-workflow-intake-triage` スキルへ委譲する（責務3層分化と1:N分割原則）。
一括走査・クラスタリング、3ルートの振り分け判定、各ルートの即時実行、サマリー報告の工程制御は同スキルが所有する。

## 不変条件

- Route A（即時決済）は設計判断を伴わず1〜2ファイルで完結する軽微修正に限定し、その場で対象ファイルを直接修正して処理済み inbox ファイルを削除する
- Route B（即時破棄）は理由を記録せず即座に削除し、破棄はサマリー件数で把握する（未処理 inbox 項目の即時トリアージ処分は、測定待ち案件スコープの狭義解釈の適用外とする）
- Route C（バックログ昇格）はクラスタ単位で統合した要件ユニットを `.agentdev/backlog/req-units/` に生成し、元の inbox ファイルを削除する。採番は現状と git 履歴検査による未使用番号の規律を適用する
- 残件 0 件を確認してサマリーを報告する（処理後に inbox 配下へ `.gitkeep` 以外が残っていてはならない）

## ガードレール

- 本コマンドの対象外: intake-promote の分類・評価・HITL、backlog-review の統合判定、learning-promote の評価、adversarial-review
- Route C の RU 生成はバックログ昇格のみであり、req-define や case-auto を直接起動しない
- inbox 項目の内容を元の意図を超えて変形せず、振り分け判定の根拠（クラスタリングの対応関係）をサマリーで伝える
