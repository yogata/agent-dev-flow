---
title: backlog-auto Design
status: accepted
created: 2026-08-17
updated: 2026-10-24
---
<!-- ADF-COVERS(implementation): REQ-041-001, REQ-041-002, REQ-041-003, REQ-041-004, REQ-041-005, REQ-041-006, REQ-041-007, REQ-041-008, REQ-041-009, REQ-041-010, REQ-041-011, REQ-041-012, REQ-041-013, REQ-041-014, REQ-041-015, REQ-041-016 -->
<!-- ADF-COVERS(design): REQ-108-011 -->
<!-- ADF-COVERS(design): REQ-108-018, REQ-108-019, REQ-108-020, REQ-108-021, REQ-108-024（重要変更の通知と結果説明節。AG-004〜006 に対応。REQ-108-024 は一気通貫経路での検証構造） -->
<!-- ADF-COVERS(design): REQ-041-017 -->
<!-- ADF-COVERS(design): REQ-114-001, REQ-114-010, REQ-114-011, REQ-114-012, REQ-114-014 -->

# backlog-auto Design

## 目的

`/agentdev/backlog-auto` 公開コマンド。backlog 整理サイクル（inspect-docs → 昇格3系統 → backlog-review）を1 回起動で実行する薄いオーケストレータの公開 interface を定義する。workflow 実装本体は `agentdev-workflow-backlog-auto` Workflow Skill が所有する。対象は、backlog 整理サイクルに加えて RU 一式の要件定義・実行・検証・統合・全体完了判定・パッチリリース作成への接続（一気通貫実行）まで拡張する。一気通貫実行の実行契約は REQ-114 が所有する。

既存5コマンド（inspect-docs、learning-promote、intake-promote、inspect-promote、backlog-review）は置換しない。backlog-auto は backlog-driven の要求入口であり、整理結果（RU）は req-define → case-auto へ接続する。

## 入力

- 引数なし（対象状態は各子コマンドと set-state の永続状態から解決する）

## 出力

- 各子コマンドの既存出力（`.agentdev/inspect/inbox/`、各 promoted/、`.agentdev/backlog/req-units/RU-*.md` 等、子コマンド公開契約どおり）
- backlog-auto 全体の実行結果報告（工程別結果、停止理由、再開コマンド提示を含む共通実行契約形式）
- 一気通貫の実行結果報告（工程別結果、全体完了判定結果、リリース結果または保留理由、再開経路を含む共通実行契約形式）

## 副作用

- 各子コマンドの既存副作用（`.agentdev/` 配下の成果物作成・削除、git commit/push、ユーザー対話）を子コマンド公開契約どおりに発生させる
- set-state の作成・更新（`.agentdev/` 配下、req-units/drafts の外）
- git タグ作成・push（リリース時、DEC-059 準拠）
- 追加公開成果物の対応（ADF本体では GitHub Release の草稿作成・読み戻し、および承認済みの場合の公開までを Custom Tool カタログ経路で実行する。公開は利用者が草稿作成とは別に明確に認めた場合に限る。カタログに含まれない操作の実行は承認後の所定経路）

## HITL 境界

- 各子ワークフローの既存 HITL 境界を維持する。既存境界の自動化は行わない
- 複数系統が判断待ちの場合はユーザー対話を直列化し、対象子ワークフローを識別可能に表示する
- 一気通貫実行の利用者判断境界: 開始時基準点確認（初期状態・到達不能正式タグの場合の停止）、リリース条件確認、公開権限確認

## 停止条件

- inspect-docs が blocked / failed の場合、下流工程を開始せず停止する
- 昇格3系統に blocked / failed / 未完了が残る場合、backlog-review を開始せず停止する
- 再実行時は子ワークフローの既存再開契約に従う
- 一気通貫実行の停止条件: 基準点確定不能、要件定義・実行の blocking 停止伝播、全体完遂不成立、リリース条件・権限不成立（完遂済み・リリース保留として報告）、公開途中失敗（読み戻し再開可能な状態で報告）

## 現在の動作

- 実行順序は inspect-docs → 昇格3系統（learning-promote、intake-promote、inspect-promote）→ backlog-review の順とし、工程間の開始条件ゲートを制御する
- workflow 実装本体（orchestration stage 構成、直列化契約、fan-in 判定、resume 契約）は Workflow Skill（`agentdev-workflow-backlog-auto`）が所有し、本 Design はこれらを複製しない

## 昇格3系統の実並列と競合排他の接続

REQ-041-017の成立は系統別の起動と活動区間の実観測で確認する。親orchestratorが既存の委譲手段へ3系統の独立読取・分析を並列接続し、共有書込み・Git操作・利用者対話の競合要求だけを排他する。提供元不調やGit競合を理由に系統全体を直列化しない。子workflowの内部分類・評価・承認は子側の正規責務に残す。

既存referenceの直列化キューの報告項目を再定義せず、排他の担当・操作要求・実行順序・解除・結果回収の実記録を既存記録へ接続する。失敗・停止時も解除と結果回収を確認し、独立兄弟を連鎖停止しない。全対象収束の工程間gateは変更しない。新しい全工程制御基盤・台帳・スケジューラ基盤は追加しない。

## 有限実行における要求蓄積入口の維持（REQ-108-011）

本節は backlog 系と ADF v5 有限実行（REQ-108）の接続を所有する。

- backlog-auto は backlog-driven の要求入口であり、Intake・Learning・Backlog を継続的な発見・改善と要件化への接続能力として維持する（REQ-108-011）。発見・学習情報は必要な評価と承認（昇格3系統の HITL、backlog-review の承認）を経て RU となり、req-define → case-auto へ渡される。実行から生じた改善情報も Capture 経路で同じ循環へ戻る。
- 旧公開コマンド名や旧内部状態の維持を合否条件としない（REQ-108-011）。v5 の実行モデルの実現確定に伴う公開経路の再構成があっても、発見から要件化・実行・検証への接続能力の維持が本 Design の合格条件である。
- v5 の実行モデルの実現確定までの間、本節の運用は現行の実行契約（REQ-108-012 移行期権威行）の下で行う。循環の実現手段の v5 向け処遇は v4 -> v5 crosswalk（[../foundations/references/v4-v5-crosswalk.md](../foundations/references/v4-v5-crosswalk.md)）の棚卸し対象として管理する。

## 一気通貫実行の拡張（REQ-114）

公開 interface の拡張（実行構造の複製は行わない。orchestration stage 構成・set-state 形式・resume 契約は Workflow Skill 側 Design の所有）:
- 目的: backlog-auto の対象を、backlog 整理サイクルに加えて RU 一式の要件定義・実行・検証・統合・全体完了判定・パッチリリース作成への接続（一気通貫実行）まで拡張する。所有する実行契約は REQ-114。
- 入力: 引数なし（対象状態は各子コマンドと set-state の永続状態から解決する）。
- 出力: 整理サイクルの既存出力に加え、一気通貫の実行結果報告（工程別結果、全体完了判定結果、リリース結果または保留理由、再開経路を含む共通実行契約形式）。
- 副作用: 整理サイクルの既存副作用に加え、set-state の作成・更新（.agentdev/ 配下、req-units/drafts の外）、git タグ作成・push（リリース時、Decision DEC-059 準拠）、GitHub Release 草稿作成および承認済みの場合の公開を含む追加公開成果物の対応（Custom Tool カタログ経路。公開は利用者が草稿作成とは別に明確に認めた場合に限る）を発生させる。
- HITL 境界: 既存の子ワークフロー HITL 境界に加え、開始時基準点確認（初期状態・到達不能正式タグの場合の停止）、リリース条件確認、公開権限確認を利用者判断境界として持つ。既存境界の自動化は行わない。
- 停止条件: 整理サイクルの既存停止条件に加え、基準点確定不能、要件定義・実行の blocking 停止伝播、全体完遂不成立、リリース条件・権限不成立（完遂済み・リリース保留として報告）、公開途中失敗（読み戻し再開可能な状態で報告）。
- 対象外: REQ-114 対象外節（docs/requirements/REQ-114.md 適用範囲）および本 Design「対象外」節に列挙した事項。
- 検証観点: 一気通貫の実行結果報告が共通実行契約形式で報告されること、既存子コマンドの公開契約に差分がないこと。
- 詳細受入条件: backlog-auto 一気通貫実行の受入条件は docs/requirements/REQ-114.md の要件行 REQ-114-001〜015 を参照
- 対論型レビュー: REQ-114 の対論型レビュー審議は定義 Case #3725 の審議記録を参照

## 参照する横断 Design

- [workflows/v4-lifecycle-state-machine.md](../workflows/v4-lifecycle-state-machine.md)（コマンド分類、共通実行契約）
- [case-auto.md](case-auto.md)（orchestration stage モデル・ドラフト間並列実行モデル。v3 epic-wave-model Design 吸収先）
- [workflows/v4-collaboration-loop.md](../workflows/v4-collaboration-loop.md)（継続コラボレーションループ: ループ内位置づけ、RU 生成・合流）

## 対象外

- 既存5コマンドの定義変更を行わない
- inspect-promote --auto を暗黙的に有効化しない
- 子ワークフロー内部の分類、評価、昇格、RU 生成ロジックの再実装（Workflow Skill の責務範囲）
- 一気通貫実行に係る対象外事項は REQ-114 対象外節（docs/requirements/REQ-114.md 適用範囲）を参照

## 検証観点

- 工程別結果と停止理由が共通実行契約形式で報告されること
- 既存5コマンドの公開契約に差分がないこと
- 一気通貫の実行結果報告が共通実行契約形式で報告されること
- 既存子コマンドの公開契約に差分がないこと

## 重要変更の通知と結果説明
