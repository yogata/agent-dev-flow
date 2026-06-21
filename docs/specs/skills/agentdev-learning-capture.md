---
title: agentdev-learning-capture SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# agentdev-learning-capture SPEC

## 目的

エージェントが自律的に検知・回避・修正した問題から学びを抽出し、ユーザー承認なしで `.agentdev/learning/inbox.md` に蓄積する。

## 適用対象

- case-close 実行中・バグ修正・CI 失敗・テンプレート逸脱の修正時
- エージェントが学び有無を自律判断する場面

## 提供する判断・操作

- 自律的検知・抽出
- 13フィールド形式でのエントリ生成（問題事象・発生局面・検知方法・根本原因・自律対応内容・ユーザー確認有無・ADR/REQ/spec 影響・横展開観点・再発条件・予防策候補・想定反映先・関連・タグ）
- Split Rule（learning vs intake 分離）
- 閾値チェック（15件以上で promote 提案）

## 参照する references

- `references/capture-entry-template.md`
- `references/example.md`

## 現在の動作

- ユーザー承認なしで `inbox.md` に追記
- git 永続化は呼出元コマンド（case-close 等）の責務
- 実観測ベース（実際に検知・回避・修正した問題のみ）

## 対象外

- 一般的なノートテイク
- 文書生成
- 昇格判断（learning-promote 責務）
- ADR/REQ/spec 作成

## 検証観点

- 実観測ベースか（実際に検知・回避・修正した問題のみ）
- 13フィールドの完備性
- learning と intake の分離遵守（Split Rule）

## See Also

- [agentdev-learning-pipeline.md](agentdev-learning-pipeline.md)
- [agentdev-workflow-orchestration.md](agentdev-workflow-orchestration.md)
- [../workflows/capture-boundaries.md](../workflows/capture-boundaries.md)
- [commands/case-close.md](../commands/case-close.md)
