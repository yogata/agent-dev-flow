---
title: agentdev-learning-pipeline SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# agentdev-learning-pipeline SPEC

## 目的

Learning pipeline（capture → promote）の共通知識。schema・分類基準・評価ディメンション・prune 方針を定義する。

## 適用対象

- learning-promote の実行時参照
- pipeline の拡張・変更時の基準確認

## 提供する判断・操作

- inbox entry schema（13フィールド）
- 問題クラス分類基準
- 8軸評価ディメンション
- evaluation-report schema
- prune 方針（昇華時必須）
- 処分区分（11処分区分 + duplicate）
- artifact lifecycle（inbox → archive/active → promoted）

## 参照する references

- なし（SKILL.md 本文に集約）

## 現在の動作

- capture と promote の責務分界を明確化（capture は独立スキル `agentdev-learning-capture`）
- promote が本スキルを参照して schema・基準を取得
- 既存対策優先（新規 X 化より既存 X へ反映）

## 対象外

- agentdev-learning-capture（独立スキル）
- req-define（参照のみ）
- 一般的なコマンド作成

## 検証観点

- 分類の整合性
- 8軸スコアの精度
- schema 遵守
- prune ポリシーの適用（昇華時必須）

## See Also

- [agentdev-learning-capture.md](agentdev-learning-capture.md)
- [agentdev-backlog-integration.md](agentdev-backlog-integration.md)
- [commands/learning-promote.md](../commands/learning-promote.md)
- REQ-0128 — Learning-promote
