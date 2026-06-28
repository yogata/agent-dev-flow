---
title: `agentdev-intake-pipeline` SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
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

## 参照する references

- `references/intake-extraction.md`
- `references/intake-promotion.md`

## 現在の動作

- 抽出と promote の双方のロジックを提供
- RU 生成は backlog-review に委譲
- intake 系コマンドは `.agentdev/intake/` 更新前後に git 永続化を実行（REQ-0108）

## 対象外

- Issue 作成（case-open 責務）
- RU 生成（backlog-review 責務）
- REQ 構造診断（`agentdev-req-structure-diagnostics` 担当）
- work_type 判定（`agentdev-workflow-lifecycle` 担当）

## 検証観点

- 抽出ロジックの正確性（クローズ済み Issue/PR のみ対象）
- 分類基準の適合性
- 振り分け先の正確性（`.agentdev/intake/promoted/`、`.agentdev/intake/archive/`）

## See Also

- [agentdev-backlog-integration.md](agentdev-backlog-integration.md)
- [commands/intake-from-github.md](../commands/intake-from-github.md)
- [commands/intake-promote.md](../commands/intake-promote.md)
- [../workflows/capture-boundaries.md](../workflows/capture-boundaries.md)
- REQ-0127（Intake command群）
