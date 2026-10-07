---
title: ADF v4 標準ライフサイクル（語彙直交性・公開 UX・req-define 入口・継続コラボレーションループ）
status: accepted
created: 2026-09-18
updated: 2026-10-08
---
<!-- ADF-COVERS(design): REQ-001-053, REQ-001-054, REQ-004-018, REQ-004-054, REQ-004-055, REQ-005-001, REQ-005-005, REQ-005-006, REQ-005-007, REQ-005-008, REQ-005-010, REQ-005-011, REQ-005-029, REQ-006-114, REQ-030-016, REQ-031-031, REQ-032-028, REQ-034-001, REQ-034-039, REQ-061-036, REQ-062-009 -->
<!-- ADF-COVERS(design): REQ-103-014, REQ-103-015, REQ-103-030（REQ-103 のライフサイクル責務単一所有・Wave 語彙・領域別並列化の設計対応面） -->
<!-- ADF-COVERS(implementation): REQ-103-030（REQ-103 領域別並列化の Wave 実行面。実行記録の正は Epic Issue 本文の実行構成表と各 Wave の PR 群） -->

# ADF v4 標準ライフサイクル（語彙直交性・公開 UX・req-define 入口・継続コラボレーションループ）

位置づけ: 本 Design は ADF v4 モデルの定義である。本 Design の規定が v3 accepted Design と衝突する場合、当該 v3 Design の処遇実行段階（v3-v4-crosswalk のreferences/crosswalk-inventory.md 実行段階列）までは v3 を正とする。当該段階での置換実行をもって権威は本 Design へ移行する。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は後続 Sequence で段階的に実施する。

## work_type / scale / Epic / Wave の v4 意味モデル

各語彙の責務定義と直交性（work_type は Issue 正規契約から除外、scale は構成判断のみ、Epic は協調管理、Wave は実行スケジューリング）、大規模 bugfix 等の表現、v3 の work_type+scale -> workflow_route 結合からの分離。

- work_type: 変更の性質。Issue 本文の正規契約項目とせず、人間の検索・整理のための任意ラベル（物理ラベル運用）としてのみ扱う。req-define は完了報告種別選定のための内部値として用いる。Decision の必要性だけを理由に work_type を別種へ変換しない
- scale: 変更・実行・協調の規模。実行構成の判断に必要な場合だけ用い、構成確定後に保存しない。特定 work_type に限定しない
- Standard / Epic / Child / Wave 所属は実際の Issue 構造から取得する
- Epic: 複数 execution unit の協調管理が必要な変更。子 Issue、Wave、意味的依存、子状態は Epic の実行構成（一つの表）が所有する
- Wave: Epic 内の依存関係と並列実行可能性を表す実行スケジューリング単位
- 大規模 bugfix 等も scale/Epic/Wave の対象になり得る。用語名は、意味モデルの一貫性を改善する明確な理由がある場合のみ見直してよい（その場合も概念責務を失わない）

## 公開 UX と内部 lifecycle の分離

2 中心フロー（req-define -> case-auto、backlog-auto -> req-define -> case-auto）の定義、case-open/case-ready/case-run/case-close/case-revise の内部 lifecycle 状態への回収、内部状態遷移の全体像（状態機械の詳細）。

- 内部状態遷移を利用者が正しい順に手動実行する UX を標準としない

## req-define の入力意味と要件化責務

入力種別一覧（自然言語要求、bug report、エラー/ログ/障害、外部課題、RU、設計/調査メモ、finding）、エラー・障害入力時の現象理解 -> 原因分析 -> 期待状態 -> 影響分析 -> 要求化の評価経路。

- req-define は requirements-driven entry point として、エラー・障害入力では現象理解、原因分析、期待状態、影響範囲、要求化の必要性を評価して REQ/Decision/Design へ接続する

## 継続コラボレーションループ

Observe -> Intake/Learning -> Backlog -> req-define -> REQ/Decision/Design -> case-auto -> Execute -> Verify -> Integrate -> Observe/Learn の循環定義、Intake と Learning の責務、Learning 評価結果の振り分け先（Knowledge/Decision/Project Policy/Design update/REQ update/Intake-Backlog/記録終了）と寿命に基づく判定。

- Intake は未処理の開発需要の受容、Learning は実行経験から得た再利用可能な知識の評価を担う
- Learning の評価結果は寿命と内容に応じて 7 系統（Knowledge、Decision、Project Policy、Design update、REQ update、Intake/Backlog、一時的記録の終了）へ振り分ける
- Loop 詳細（循環の各段責務、Observe と Integrate の責務定義、Learning 評価結果 7 系統の詳細、昇格ガード、.agentdev/ 状態領域の整合、v3 backlog-artifact-lifecycle Design からの吸収）は v4-collaboration-loop Design が所有する
- Observe = 検出と回収（inspect 系コマンドの検出、クローズ済み GitHub 成果物からの回収（intake-from-github）、case-close における PR 本文 Capture 回収）。新規コマンドを増設しない
- Integrate = 検証結果の統合と正規成果物の確定（case-close における PR マージ、docs 確定、Close 処理）

## 主要責務の正規所有者一覧（REQ-103-014）

主要責務の正規所有者は次のとおり一意である。同一責務を複数工程が現行責務として所有しない。

| 主要責務 | 正規所有者 | 契約所在 |
|---|---|---|
| Root Case 確立 | case-open | REQ-030、commands/case-open.md |
| Definition 受入 | case-ready | REQ-061、commands/case-ready.md |
| REQ/Decision/Design 保存 | case-ready / case-revise（Definition 保存内部責務。Capability Skill 委譲） | REQ-061、REQ-062、各 file-manager skill Design |
| execution contract 確定 | case-ready | REQ-061 |
| Standard / Epic 構成 | case-ready | REQ-061 |
| Child Issue 構成 | case-ready | REQ-061 |
| Wave / 依存 DAG | 構成確定: case-ready、実行制御: case-auto orchestration stage 3 | REQ-061、REQ-034、workflows/references/execution-unit-construction.md |
| 実装実行 | case-run（実行担当サブエージェントへ委譲 1 件。委譲内の実装・検証・PR 作成は委譲側の実行） | REQ-031、skills/agentdev-case-run-execution-adapter.md |
| Verification / QG | 各配置点の Gate（QG-1〜QG-4 と工程内 gate 群） | quality/v4-quality-gate-model.md |
| merge / close | case-close | REQ-032、commands/case-close.md |
| revise / resume | revise: case-revise、resume: case-auto（Root Case 指定入口） | REQ-062、REQ-034、v4-lifecycle-state-machine |

## Wave、意味的依存、実行並列上限、競合情報の一意定義（REQ-103-015）

4 概念を混同しない。各概念の正規責務と決定方法は次のとおり一意である。

| 概念 | 定義 | 正規責務の所有 | 決定方法 |
|---|---|---|---|
| Wave | Epic 内の依存関係と並列実行可能性を表す実行スケジューリング単位 | Epic の実行構成表（一つの表）が所有 | 意味的依存 DAG からのトポロジカルレベル割当（決定的導出。最小性成立: 同一深さ同一 Wave） |
| 意味的依存 | 子 Issue 間の成立順序の依存（必須依存のみを辺とする DAG） | Epic の実行構成表が所有 | 意味的依存関係の確定は判断（確定権限に従う）、確定後の依存グラフ・循環検出・Wave 構成導出は決定的処理（REQ-096-016） |
| 実行並列上限 | 同時に active にできる Issue task 数の論理上限 | ADF 契約（数値の所有は case-auto Design。DEC-041、DEC-051） | 構成判断（確定済み契約からの導出）。harness の同時起動制限は adapter・実装制約であり論理上限の根拠としない |
| 競合情報 | Wave 割当時の依存ヒント交差の決定的比較結果（重複許容・衝突リスクの情報） | Epic の実行構成確定時に生成し、case-run へ引き渡す | 交差検出は決定的比較。衝突時の解消判断（該当ファイルの最新取得・直列化・rebase）は実行担当の委譲された裁量 |

Wave 状態は保存せず Wave 内子Issue 状態から導出する（v4-lifecycle-state-machine）。実行並列上限と Wave は別概念であり、並列上限は Wave 内実行と横断補充の両方に適用される実行安全境界である。競合情報は依存ヒント粒度の粗さに由来する実行・統合時のリスク情報であり、Wave 割当や依存関係の定義そのものではない。
