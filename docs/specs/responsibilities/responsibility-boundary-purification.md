---
title: 責務境界浄化: 所有/非所有リスト詳細
status: accepted
created: 2026-07-14
updated: 2026-07-15
---

# 責務境界浄化: 所有/非所有リスト詳細

AgentDevFlow 配布物と harness 実行制御の責務境界を、所有対象と非所有対象のリストによって明示化する。原則は REQ-0162 を SSoT とし、本 SPEC は各工程（case-auto, case-run, execution adapter, Project Extensions, タイムスタンプ）ごとの所有/非所有リストの詳細を集約する。判定根拠は ADR-0136（配布物の harness 実行制御分離）。

## 責務境界浄化: 所有/非所有リスト詳細

### ADF標準の所有対象（業務ワークフロー契約）
- 工程目的、入力、前提
- 進行停止条件
- 永続成果物
- 許可/禁止副作用
- QG（品質ゲート）
- 完了再開条件
- 結果契約（completed-pr/blocked/failed/delegation-unavailable）
- ADF可観測壁時計タイムスタンプ

### ADF標準の非所有対象（harness責務）
- 実行エージェント選定
- サブエージェント階層
- 委譲API
- 固定並列数、timeout、retry
- context管理
- queue、heartbeat
- エラー解析
- plan task監査ログ

### case-auto所有/非所有リスト
**所有**: 入力解決、auto_gate確認、artifact_actions基準工程決定、入力引き渡し、永続状態再読込、継続停止再開判定、完了進行未実行報告、壁時計時間計測
**非所有**: 工程内部手順再実装、エージェント選定、スケジューリング、並列数、エラー解析、context圧縮、retry、QG再評価、capture再実装

### case-run所有/分離対象リスト
**所有**: Issue/実行単位解決、worktree branch準備、Issue+worktree root+branch引き渡し、結果受領状態処理、PR停止情報確認、Findings PR本文引き継ぎ、再開可能状態維持、壁時計時間計測
**分離対象**: ADF repo固有検査、repo-local script直接実行、特定ファイル前提grep、固定timeout並列数、実装検証反復アルゴリズム、異常終了解析

### execution adapter最小契約
**入力**: Issue識別子、worktree root、branch、副作用境界
**結果4状態**: completed-pr、blocked、failed、delegation-unavailable
**永続化先**: 成功=PR、blocker失敗詳細=Issueコメント
**禁止事項**: worktree外変更、Issue完了判定、capture直接書込、harness中間成果物のADF永続状態化
**含めない**: エージェント構成、実行command、timeout、retry、並列数、plan

### Project Extensions境界
**宣言データ層**: context、rules、checks、acceptance_gates、must_not
**行わない**: 標準command上書き、実行skillエージェント指定、委譲方法標準契約要求
**分離**: ADF repo固有検査は適用プロジェクト責務

### タイムスタンプ境界
**ADF可観測（所有）**: case-auto全体開始終了停止、構成工程開始終了所要、case-run worktree準備実行依頼結果受領後処理、結果状態確定時刻、停止時点工程別経過
**ADF非管理**: harness内部timeout、サブエージェント内部フェーズ、推論時間、queue待機、retry単位、context圧縮時間、監視間隔

## 関連情報

- **関連REQ**: REQ-0162（配布物の harness 実行制御分離、原則の SSoT）、REQ-0119（コマンド・スキル・サブエージェント責務分界）、REQ-0103（Artifact 責任分界）、REQ-0114（case-auto 最大自走モード）、REQ-0130（case-run 実装パイプライン）、REQ-0139（外部エージェント統合契約）、REQ-0160（Project Extensions 機構と配布物参照境界）、REQ-0151（コンフリクト解消モデルと実行時間観測）
- **関連ADR**: ADR-0136（配布物の harness 実行制御分離、accepted）
