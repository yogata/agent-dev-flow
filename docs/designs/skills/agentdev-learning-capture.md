---
title: `agentdev-learning-capture` Design
status: accepted
created: 2026-06-21
updated: 2026-07-27
---
<!-- ADF-COVERS(implementation): REQ-038-001 -->

# `agentdev-learning-capture` Design

## 目的

エージェントが自律的に検知、回避、修正した問題から学びを抽出し、ユーザー承認なしで `.agentdev/learning/inbox.md` に蓄積する。

## 適用対象

- case-close 実行中、バグ修正、CI 失敗、テンプレート逸脱の修正時
- エージェントが学び有無を自律判断する場面

## 提供する判断、操作

- 自律的検知、抽出
- 13フィールド形式でのエントリ生成（問題事象、発生局面、検知方法、根本原因、自律対応内容、ユーザー確認有無、Decision/REQ/spec 影響、横展開観点、再発条件、予防策候補、想定反映先、関連、タグ）
- Split Rule（learning vs intake 分離）
- 閾値チェック（15件以上で promote 提案）

## 参照する references

- `references/capture-entry-template.md`
- `references/example.md`

## 現在の動作

- ユーザー承認なしで `inbox.md` に追記
- git 永続化は呼出元 command（req-save / design-save / case-open / case-close）の責務（後述「呼出元 command 契約」参照）
- 実観測ベース（実際に検知、回避、修正した問題のみ）

## 呼出元 command 契約

本スキルは、主ワークフロー構成工程 command（req-save / design-save / case-open / case-close）から委譲を受ける。
各 command は自工程で実観測した deviation のうち learning 該当分を本スキルへ委譲する。
command は他 command を直接呼び出さず、Skill へ一方向に委譲する（Command→Skill 依存方向、[artifact-contracts.md](../responsibilities/artifact-contracts.md)「依存方向」、[capture-boundaries.md](../workflows/capture-boundaries.md)「委譲契約（Command→Skill 依存方向）」参照）。

### 呼出元 command と委譲契約の根拠

| 呼出元 command | REQ 根拠 | 委譲対象 |
|---|---|---|
| req-save | REQ-006-106 | req-save 実行中に実観測した deviation のうち learning 該当分 |
| design-save | REQ-006-107 | design-save 実行中に実観測した deviation のうち learning 該当分 |
| case-open | REQ-006-021 | case-open 実行中に実観測した deviation のうち learning 該当分 |
| case-close | REQ-006-105 | case-close 実行中に実観測した deviation のうち learning 該当分（PR 本文から回収した learning 候補を含む） |

`case-run` は `.agentdev/` 直接変更を禁止し PR 本文記録のみを行うため、本スキルへの委譲を行わない（[capture-boundaries.md](../workflows/capture-boundaries.md)「各コマンドの capture 責務」参照）。

### 本スキルの責務（呼出元に対する提供）

- 実観測ベースで learning 該当分を判定する（[capture-boundaries.md](../workflows/capture-boundaries.md) Split Rule 準拠）
- 13フィールド形式で `inbox.md` エントリを生成、追記する
- extraction（知見の分類、抽出）を担う

### 呼出元 command の責務（本スキルが委譲しないもの）

- git 永続化（commit、push）は呼出元 command が担う。本スキルは候補生成と file 書き込みまでを担い、commit 実行を委譲しない
- 完了報告の `Capture結果` 小節に保存先パス、分類（learning）、保存結果（成功/失敗、件数、コミットハッシュ等）を含める

## 対象外

- 一般的なノートテイク
- 文書生成
- 昇格判断（learning-promote 責務）
- Decision/REQ/spec 作成

## 検証観点

- 実観測ベースか（実際に検知、回避、修正した問題のみ）
- 13フィールドの完備性
- learning と intake の分離遵守（Split Rule）

## See Also

- [agentdev-learning-pipeline.md](agentdev-learning-pipeline.md)
- [agentdev-workflow-orchestration.md](agentdev-workflow-orchestration.md)
- [../workflows/capture-boundaries.md](../workflows/capture-boundaries.md)
- [commands/case-close.md](../commands/case-close.md)

