---
title: `agentdev-intake-pipeline` SPEC
status: accepted
created: 2026-06-21
updated: 2026-07-28
---

# `agentdev-intake-pipeline` SPEC

## 目的

intake-from-github（GitHub 残課題抽出）と intake-promote（review、分類、振り分け）の共通知識ベースを提供する。

## 適用対象

- intake-from-github 実行時の抽出アルゴリズム、データ取得、検出ルール、item 生成
- intake-promote 実行時の inbox スキャン、レビュー評価、分類提示、整形保存

## 提供する判断、操作

- 期間解釈（「直近1週間」「今月」等）
- データ取得（gh CLI によるクローズ済み Issue/PR 取得）
- 構造的検出
- LLM 全文解析
- intake item 生成
- Review 観点、採用/保留/却下判定
- Split Rule（intake / learning 分離）
- Git 永続化手順

## 操作一覧

本スキルが提供する操作を体系化する。intake 系 command が呼び出す操作と、主ワークフロー各工程 command からの自動 deviation capture 要求を受ける操作の2系統を持つ。

### intake 系 command 向け操作

- **抽出操作**: クローズ済み Issue/PR からの本筋外課題抽出（`intake-from-github` が呼出元）。期間解釈、gh CLI によるデータ取得、構造的検出、LLM 全文解析を経て item を生成する
- **promote 操作**: `inbox/` item の review、分類（採用/保留/却下）、整形保存（`intake-promote` が呼出元）

### 自動 capture 向け item 生成操作

各工程 command（`req-save` / `spec-save` / `case-open` / `case-close`）からの自動 deviation capture 要求を受ける item 生成操作。Command→Skill 依存方向（[artifact-contracts.md](../responsibilities/artifact-contracts.md)「依存方向」、[capture-boundaries.md](../workflows/capture-boundaries.md)「委譲契約（Command→Skill 依存方向）」参照）に従い、command は `intake-capture` 等の他 command を直接呼び出さず本スキルへ一方向に委譲する。

#### 呼出元 command と委譲契約の根拠

| 呼出元 command | REQ 根拠 | 委譲対象 |
|---|---|---|
| `req-save` | REQ-006-106 | `req-save` 実行中に実観測した deviation のうち intake 該当分（REQ 再構成 intake を含む） |
| `spec-save` | REQ-006-107 | `spec-save` 実行中に実観測した deviation のうち intake 該当分 |
| `case-open` | REQ-006-021 | `case-open` 実行中に実観測した deviation のうち intake 該当分 |
| `case-close` | REQ-006-105 | `case-close` 実行中に実観測した deviation のうち intake 該当分（PR 本文から回収した intake 候補を含む） |

`case-run` は `.agentdev/` 直接変更を禁止し PR 本文記録のみを行うため、本操作の呼出元とならない（[capture-boundaries.md](../workflows/capture-boundaries.md)「各コマンドの capture 責務」参照）。

#### 本操作の責務（呼出元に対する提供）

- 実観測ベースで intake 該当分を判定する（[capture-boundaries.md](../workflows/capture-boundaries.md) Split Rule 準拠）
- `.agentdev/intake/inbox/*.md` へ item を生成、保存する。REQ 再構成 intake は `.agentdev/intake/inbox/req-restructure/` 配下へ配置する（REQ-010）
- Split Rule に基づき learning 該当分を `agentdev-learning-capture` skill へ分割指示する（混在させない）

#### 呼出元 command の責務（本操作が委譲しないもの）

- git 永続化（commit、push）は呼出元 command が担う。本操作は item 生成と file 書き込みまでを担い、commit 実行を委譲しない
- 完了報告の `Capture結果` 小節に保存先パス、分類（intake）、保存結果（成功/失敗、件数、コミットハッシュ等）を含める

#### `intake-capture` command との区別

本操作と `intake-capture` command は別操作である。

| 区分 | 入力形式 | 呼出元 | 役割 |
|---|---|---|---|
| 自動 capture 向け item 生成操作（本操作） | 各工程 command が実観測した deviation（構造化済み） | `req-save` / `spec-save` / `case-open` / `case-close`（プログラム的委譲） | 自動 deviation capture |
| `intake-capture` command | ユーザー手動入力 | ユーザー（対話的） | ユーザー主導の作業候補収集 |

`intake-capture` command はユーザー手動入力を想定し、入力形式も異なる。本操作は command から委譲される構造化入力のみを扱い、`intake-capture` command の入力形式は継承しない。

## 参照する references

- `references/intake-extraction.md`
- `references/intake-promotion.md`

## 現在の動作

- 抽出と promote の双方のロジックを提供
- RU 生成は backlog-review に委譲
- intake 系コマンドは `.agentdev/intake/` 更新前後に git 永続化を実行（REQ-010）

## 対象外

- Issue 作成（case-open 責務）
- RU 生成（backlog-review 責務）
- REQ 構造診断（`agentdev-req-structure-diagnostics` 担当）
- work_type 判定（`agentdev-workflow-lifecycle` 担当）

## 検証観点

- 抽出ロジックの正確性（クローズ済み Issue/PR のみ対象）
- 分類基準の適合性
- 振り分け先の正確性（`.agentdev/intake/promoted/`）および inbox ファイル削除の検証

## See Also

- [agentdev-backlog-integration.md](agentdev-backlog-integration.md)
- [commands/intake-from-github.md](../commands/intake-from-github.md)
- [commands/intake-promote.md](../commands/intake-promote.md)
- [../workflows/capture-boundaries.md](../workflows/capture-boundaries.md)
- REQ-010（Intake command群）

## adversarial-review 候補判断と内部挿入

intake-promote 経路C における review 候補判断基準と内部手続き（候補確定位置、
呼出タイミング、結果反映先）を規定する。

