---
id: v4-collaboration-loop
title: ADF v4 継続コラボレーションループ
created: 2026-09-20
status: accepted
---

# ADF v4 継続コラボレーションループ

## 位置づけ

本 Design は v4-standard-lifecycle「継続コラボレーションループ」節の定義（循環・
Intake/Learning 責務・7 系統列挙・昇格ガード）を受けて、その詳細を所有する。
循環の状態遷移の側は v4-lifecycle-state-machine が、永続状態の配置は
v4-durable-state-and-recovery が所有する。

## 循環の各段責務

- Observe: 開発環境とプロセスの観測。inspect 系コマンドの検出、クローズ済み
  GitHub 成果物からの回収（intake-from-github）、case-close における PR 本文
  Capture 回収を実現手段とする。
- Intake: 未処理開発需要の受容。受領した観測結果を inbox に蓄積する。
- Learning: 実行経験からの再利用可能知識の評価。評価結果は 7 系統へ振り分けられる。
- Backlog: 採用済み需要の統合と要件単位（RU）化。
- req-define / case-auto: 要求の合意と実現（case-* 内部 lifecycle を含む）。
- Verify / Integrate: 検証と統合。case-close が PR マージ・docs 確定・Capture 回収を担う。
- Observe/Learn: 次周回の観測へ戻る。

### Observe と Integrate の責務定義

Observe は検出と回収の起点であり、単一の専有コマンドを持たない。inspect-docs・
inspect-skills・intake-from-github・case-close の Capture 回収が実現手段である。
Integrate は case-close における PR マージ・正規成果物の確定・Close 処理である。
いずれも新規コマンドを増設しない。

### 実現手段対応表

| 循環段 | 実現手段（既存コマンド・スキル） |
|---|---|
| Observe | inspect-docs / inspect-skills / intake-from-github / case-close Capture 回収 |
| Intake | intake-capture / intake-from-github / intake-promote |
| Learning | learning capture（case-close・ワークフロー内） / learning-promote |
| Backlog | backlog-review / backlog-auto |
| req-define・case-auto | req-define / case-auto |
| Verify・Integrate | case-run / case-close |

## Learning 評価結果の 7 系統

Learning 評価結果は次の 7 系統へ振り分けられる。7 系統はループ全体の集計ビュー
（最終振り分け先）であり、learning-promote の処分区分（局所判定）とは別の軸である。

1. Knowledge: docs/knowledge への再利用可能知識（処分区分 4 に対応）
2. Decision: 恒久契約候補として Decision 化（処分区分 2 に対応）
3. Project Policy: プロジェクト運用方針への反映（独立の処分区分は存在せず、
   下流の req-define で実現先を選択する）
4. Design update: 既存 Design の更新（処分区分 3 に対応）
5. REQ update: 既存 REQ の更新（処分区分 1 に対応）
6. Intake/Backlog: 未処理需要としての再投入（capture 時点の Split Rule により
   実現される。learning-promote 時点の振替経路は現行の処分区分に存在しない）
7. 一時的記録の終了: 評価終了（処分区分 7 rejected・duplicate・prune 対象に対応）。
   deferred は振り分け先ではなく、未評価 Observation として living pool に滞留する。
   終了は情報寿命の終結であり、8 寿命のいずれにも分類されない。

7 系統・処分区分・8 寿命の三方対応表の正は agentdev-learning-pipeline の処分区分
スキーマ参照ファイルが所有する。

先送り記録: Project Policy と Intake/Backlog に処分区分の対応カテゴリが存在しない語彙的欠落は本 Design の注記で埋める。REQ 級で 7 系統を正式に所有する場合は、将来段階で REQ-038 の行変更が別途必要である（本段では REQ 行文言を不変とする）。

## 昇格ガード

Learning と Observation は無条件に REQ へ昇格しない（v4-operating-model 情報寿命モデル）。
昇格は恒久契約候補のみが backlog-review の承認と req-define の合意を経て実現する
多段構造である。

## .agentdev/ 状態領域の整合

| 実ディレクトリ・ファイル | durable state 5 分類 | 8 寿命 |
|---|---|---|
| .agentdev/intake/inbox/ | repo 内正規状態 | 未評価 Observation |
| .agentdev/intake/promoted/ | repo 内正規状態 | 未評価 Observation（採用済み・RU 化待ち） |
| .agentdev/learning/inbox.md | repo 内正規状態 | 未評価 Observation |
| .agentdev/learning/promoted/ | repo 内正規状態 | 未評価 Observation（採用済み） |
| .agentdev/learning/deferred.md | repo 内正規状態 | 未評価 Observation（living pool） |
| .agentdev/inspect*/promoted/ | repo 内正規状態 | 未評価 Observation（採用済み） |
| .agentdev/backlog/req-units/ | repo 内正規状態 | Change/Case lifetime（要件化後は Requirement lifetime） |

## ループ図の読み方

v4-standard-lifecycle の循環において req-define → REQ/Decision/Design → case-auto の
線形配置は、正規成果物の確定が case-auto 内部（case-ready）で起こる Definition 確定
境界の単純化である。Backlog → req-define の縁は人間起点の承認境界であり、循環は
自動継続しない。

## v3 backlog-artifact-lifecycle Design からの吸収

本 Design は v3 backlog-artifact-lifecycle Design のうちループ統合系（RU 生成・合流・
検出事項の入力経路・追跡Issue からの要件化経路）と one-time 成果物ライフサイクル
（一時成果物は昇格または破棄によって終結する一般契約）を引き継ぐ。他の節の正規所有は
次のとおり再接続する。バックログドラフトプロトコルは commands/intake-from-github Design、
検出事項プロトコルは capture-boundaries Design、inspect-promote の分類確定状態再構成規則は
commands/inspect-promote Design、REQ ファイル整合性検査・README 索引影響規則は
agentdev-req-file-manager・agentdev-artifact-validation の各 Design、RU・draft の状態と
削除契約は v4-lifecycle-state-machine と v4-durable-state-and-recovery（削除トリガーの実行契約は
commands/case-ready Design 参照）、artifact_actions
ベース工程分岐は commands/req-define Design が所有する。

<!-- ADF-COVERS(implementation): REQ-008-013, REQ-008-015, REQ-008-016, REQ-008-017 -->

## 用語表記

7 系統の「Intake/Backlog」表記に統一する（Intake-Backlog 表記は使用しない）。

