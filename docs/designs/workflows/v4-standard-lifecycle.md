---
title: ADF v4 標準ライフサイクル（語彙直交性・公開 UX・req-define 入口・継続コラボレーションループ）
status: draft
created: 2026-09-18
updated: 2026-09-18
---

# ADF v4 標準ライフサイクル（語彙直交性・公開 UX・req-define 入口・継続コラボレーションループ）

位置づけ: 本 Design は ADF v4 モデルの定義である。既存 Design 群の本モデルへの準拠更新（置換・廃止を含む）は RU §24 の後続 Sequence で段階的に実施する。

## work_type / scale / Epic / Wave の v4 意味モデル

各語彙の責務定義と直交性（work_type は route 直接決定から分離、scale は work_type 非限定、Epic は協調管理、Wave は実行スケジューリング）、大規模 bugfix 等の表現、v3 の work_type+scale -> workflow_route 結合からの分離。

- work_type: 変更の性質。workflow route を直接決定する責務から分離する。Decision の必要性だけを理由に work_type を別種へ変換しない
- scale: 変更・実行・協調の規模。特定 work_type に限定しない
- Epic: 複数 execution unit の協調管理が必要な変更
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
