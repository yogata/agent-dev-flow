---
title: `agentdev-intake-pipeline` SPEC
status: accepted
spec_logical_division: behavior
canonical_owner: agentdev-intake-pipeline
created: 2026-06-21
updated: 2026-07-27
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

### 自動 capture 向け item 生成操作

各工程 command（req-save/spec-save/case-open/case-close）からの自動 deviation capture 要求を受ける item 生成操作。本操作は intake/inbox/*.md への item 保存を担い、git 永続化は呼出元 command が担当する。intake-capture command（ユーザー手動入力用）とは別操作であり、入力形式も異なる。

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

