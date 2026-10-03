---
title: `agentdev-epic-tracker` Design
status: accepted
created: 2026-06-21
updated: 2026-10-03
---
<!-- ADF-COVERS(implementation): REQ-035-003, REQ-035-004 -->
<!-- ADF-COVERS(design): REQ-035-001 -->

# `agentdev-epic-tracker` Design

## 目的

親 Epic Issue のステータス追跡テーブル（`pending` / `ready` / `running` / `completed` / `blocked` / `failed`）を更新する知識ベース。

## 適用対象

- case-auto（子 Issue 選択時の `running` 更新、Wave 反復制御時の進行状況読取）
- case-close（`completed` 更新、Epic 自動クローズ判定）
- case-open（Epic Issue 本文ステータス追跡テーブル初期生成）

## 提供する判断、操作

- ステータス更新プロトコル（`pending` → `ready` → `running` → `completed` / `blocked` / `failed`）
- 親 Epic 検出（`Parent: #{N}` パターン）
- 正規表現パターン（新4列形式: `#` / `Issue` / `ステータス` / `内容`、旧4列形式）
- べき等性確認
- Epic 自動クローズ判定（全子 Issue CLOSED → 自動クローズ）

## 参照する references

- なし（SKILL.md 本文に集約、`agentdev-workflow-lifecycle`、`docs/designs/commands/case-close.md`（Epic Wave クローズ・Epic ステータス追跡テーブル）、`docs/designs/foundations/v4-runtime-execution-model.md`（per-Epic 単一書き手）参照）

## 現在の動作

- 新4列形式と旧4列形式の両方をサポート
- `⏭スキップ` は採用しない（前提未達は `pending` のまま選択対象外、REQ-031-009）
- `ready` / `running` は case-run(#epic) の内部状態であり永続状態には書き込まれない。この取扱いは Case Issue 工程記録の取りまとめ反映とは独立に維持する（実行制御上の内部状態は従来どおり、進行状態の表示は workflows/issue-lifecycle-records Design の写像規則による）
- 永続状態への書き込み遷移は `pending` → `completed` / `blocked` / `failed` の遷移に加え、Case Issue 工程記録の取りまとめによる記録契機に応じた反映（着手、停止、再開、判断変更等の子状態集約・全体条件評価の更新）を含む（REQ-035-001）
- 書き手は case-close に限定せず、case-close と工程記録の取りまとめが per-Epic の単一書き手（排他制御・局所直列化）の下で書き込む（v2:ADR-0125 の単一書き手原則は維持）
- 取りまとめ反映の記録様式（セクション構成・進行状態表記）は workflows/issue-lifecycle-records Design の Epic セクション様式に従う

## 対象外

- Epic の作成（case-open 責務）
- 非 Epic Issue の管理
- 一般的な Issue 操作（`agentdev-issue-management` 担当）

## 検証観点

- ステータス値の正確性
- 正規表現による行特定の精度
- マージコンフリクト対応パターンの遵守
- 単一書き手制約（v2:ADR-0125）の遵守

## See Also

- [agentdev-issue-management.md](agentdev-issue-management.md)
- [agentdev-workflow-lifecycle.md](agentdev-workflow-lifecycle.md)
- [../foundations/v4-runtime-execution-model.md](../foundations/v4-runtime-execution-model.md)（Epic Issue 本文の単一書き手〔直列化単位表〕）
- [commands/case-close.md](../commands/case-close.md)
- REQ-006（Case実行オーケストレーション / Epic、Wave）
- v2:ADR-0125（Epic Issue 本文単一書き手）


## v4 責務分類

ADF v4 の責務分類（正典: DEC-048、foundations/v4-responsibility-boundaries Design「v4 責務分類語彙の後継」節）における本 Design の 3 区分（意味判断担当〔閉じた意味評価・開いた推論を所有〕/ 決定的処理委譲先 / 知識提供）。語彙の原本は foundations/v4-responsibility-boundaries Design「v4 責務分類語彙の後継」節であり、本節はその確定値を記録する。

- **意味判断担当**: 0 件
- **決定的処理委譲先**: API I/O → Custom Tool agentdev_gh
- **知識提供**: Epic テーブル更新手順・Parent: #N 検証
