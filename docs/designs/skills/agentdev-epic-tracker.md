---
title: `agentdev-epic-tracker` Design
status: accepted
created: 2026-06-21
updated: 2026-10-04
---
<!-- ADF-COVERS(implementation): REQ-035-003, REQ-035-004 -->
<!-- ADF-COVERS(design): REQ-035-001, REQ-035-019, REQ-035-020 -->

# `agentdev-epic-tracker` Design

## 目的

親 Epic Issue の実行構成表（`| Wave | Issue | 前提 | 状態 |`、子状態4値 `pending` / `completed` / `blocked` / `failed`）を更新する知識ベース。

## 適用対象

- case-close（`completed` / `blocked` / `failed` 更新、Epic 自動クローズ判定）
- case-auto（取りまとめ反映の書き込み、Wave 反復制御時の実行構成表読取）
- case-open（Epic Issue 本文実行構成表初期生成）

## 提供する判断、操作

- Epic 実行構成表（`| Wave | Issue | 前提 | 状態 |`）の解析と状態更新プロトコル（`pending` → `completed` / `blocked` / `failed`、および再試行時の継続条件成立と旧実行終了確認による `pending` 戻し）
- 親 Epic 検出（`親Epic: #{N}` パターン）
- べき等性確認
- Epic 自動クローズ判定（全子 Issue CLOSED → 自動クローズ）

## 参照する references

- なし（SKILL.md 本文に集約、`agentdev-workflow-lifecycle`、`docs/designs/commands/case-close.md`（Epic Wave クローズ・Epic 実行構成表の子状態更新）、`docs/designs/foundations/v4-runtime-execution-model.md`（per-Epic 単一書き手）参照）

## 現在の動作

- Epic 実行構成表（`| Wave | Issue | 前提 | 状態 |`）を解析する。旧4列形式（`#` / `Issue` / `ステータス` / `内容`）の後方互換検出を行わない（新形式を唯一の現行形式とする）
- `⏭スキップ` は採用しない（前提未達は `pending` のまま選択対象外、REQ-031-009）
- 永続状態は `pending` / `completed` / `blocked` / `failed` の4値のみ。`ready` / `running` は runtime 実行状態であり永続状態には書き込まれない。Wave 状態、状態別件数を Issue 本文へ保存しない

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
- **知識提供**: Epic 実行構成表の更新手順・親Epic: #N 検証
