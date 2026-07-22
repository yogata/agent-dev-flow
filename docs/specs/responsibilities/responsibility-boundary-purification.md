---
title: 責務境界浄化: 所有/非所有リスト詳細
status: accepted
created: 2026-07-14
updated: 2026-07-22
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
**所有**: 入力解決、auto_gate確認、artifact_actions基準工程決定、入力引き渡し、永続状態再読込、継続停止再開判定、完了進行未実行報告、壁時計時間計測、Phase 分離（Phase 1 case-open 順次実行、Phase 2 case-run 並列実行、Phase 3 case-close 順次実行、REQ-0114-102）、Phase 2 の固定並列数5（REQ-0114-106）、bg task の状態管理、破棄検知（REQ-0114-105）、状態別回復（commit 済み PR 未作成 / 未コミット変更残存の区別）、Phase 1 と Phase 3 の直列集約ポイント（main push / capture / commit、REQ-0114-104）
**非所有**: 工程内部手順再実装、エージェント選定、スケジューリング、エラー解析、context圧縮、retry、QG再評価、capture再実装、bg task API、実行担当サブエージェント内部の実行制御（推論、context 管理、retry、エラー解析等）、heartbeat、plan task監査ログ

> **用語注記**: 「実行担当サブエージェント内部の実行制御」は、推論、context 管理、retry、エラー解析等を含む上位概念として扱う。line 38 限定注記内の表記と一致させる（語彙揺れ是正）。

> **ADR-0138 による ADR-0136 決定2の限定範囲（REQ-0114-102〜107）**: ADR-0136 決定2「配布物は業務ワークフロー契約のみを記述し、実行制御は harness 責務」に対し、case-auto の Phase 分離、Phase 2 の固定並列数、bg task の状態管理と状態別回復、Phase 1 と Phase 3 の直列集約だけを AgentDevFlow 側の業務ワークフロー契約として規定する。bg task API と実行担当サブエージェント内部の実行制御は harness 側に維持し、決定2の本体を変更しない。

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

## 横断的再評価基準

現行 REQ 群、現行 SPEC 群を新基準（ステークホルダー視点、4妥当性基準、SPEC 5区分論理、関心キー所有、分類根拠伝播）で横断的に再評価する基準を定める（AG-010、RU-20260722-02 合意、ADR-0139）。本節は基準定義までを対象とし、全件再評価の実施は別途 case-open/case-run 工程で行う。

### REQ 再評価基準（ステークホルダー視点、4妥当性基準）

現行 REQ 全件について、REQ-0101-079（ステークホルダー視点、4妥当性基準）に基づく再評価を実施する。要件行単位で次を判定する:

| 評価観点 | 適合基準 |
|---|---|
| 要求元ステークホルダー特定 | 主語または文脈から要求元ステークホルダーを特定できる |
| 観測可能成果 | ステークホルダーが得る成果または回避できる問題を説明できる |
| 内部実装非依存 | 成果物内部を知らなくても達成を観測できる |
| 要求文存立 | 内部構成を変更しても要求文が成立する |

安定契約例外（REQ-0101-069）に該当する要件行は再評価の対象外とする。

### SPEC 再評価基準（主論理区分、正規所有対象、重複責務、実装/履歴混入）

現行 SPEC 全件について、主論理区分、正規所有対象、重複責務、不適切な実装計画または履歴記述の評価を実施する:

| 評価観点 | 適合基準 |
|---|---|
| 主論理区分 | REQ-0155-009 の5区分（挙動SPEC、カタログSPEC、横断契約SPEC、パラメータSPEC、実装詳細SPEC）のいずれかが frontmatter または冒頭宣言節で宣言されている |
| 正規所有対象 | 対象 command、skill、workflow、品質ルール、整合性ルール等の関心キーが宣言されている（REQ-0156-013、REQ-0119-038） |
| 重複責務 | 同一関心キーに対する複数 SPEC の正規所有宣言がない |
| 実装/履歴混入 | 実装計画、マイルストーン、完了履歴が SPEC へ混入していない |

### パターンベース是正の指針

横断的再評価は局所的な文言修正ではなく、同型の責任分界違反を全現行 REQ/SPEC へ横断適用するパターンベース是正とする（AG-010）。同型違反の検出→是正候補のリストアップ→個別 case（Issue/PR）での実施、という流れで行う。

### 後方互換運用

分類メタデータ（主論理区分、正規所有対象、分類根拠）の宣言は段階適用とする（REQ-0136-035）。宣言形式未完了の既存 SPEC は警告モードで経過観察し、欠落により拒否しない（soft-contract、ADR-0124）。既存の採用済み成果物、RU、req_draft を宣言欠落により拒否しない。

## 関連情報

- **関連REQ**: REQ-0162（配布物の harness 実行制御分離、原則の SSoT）、REQ-0119（コマンド・スキル・サブエージェント責務分界）、REQ-0103（Artifact 責任分界）、REQ-0114（case-auto 最大自走モード）、REQ-0130（case-run 実装パイプライン）、REQ-0139（外部エージェント統合契約）、REQ-0160（Project Extensions 機構と配布物参照境界）、REQ-0151（コンフリクト解消モデルと実行時間観測）
- **関連ADR**: ADR-0136（配布物の harness 実行制御分離、accepted）、ADR-0138（case-auto オーケストレーション制御の AgentDevFlow 側集約、accepted。ADR-0136 決定2の限定注記）
