---
title: agentdev-req-structure-diagnostics SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# agentdev-req-structure-diagnostics SPEC

## 目的

inspect-docs コマンドの REQ 構造診断ロジックの知識ベースとして判定基準と検出シグナルを提供する。検査対象を直接修正しない診断専用スキル。

## 適用対象

- inspect-docs コマンドにおける docs 全体の意味整合性レビュー
- REQ 参照 ID 整合性・第一参照導線・現行/廃止/世代境界・6観点診断・未処理成果物確認

## 提供する判断・操作

- REQ 参照 ID 整合性確認（frontmatter `id` の一意性・ファイル名整合・相互参照の存在）
- 第一参照導線確認（DOC-MAP・README・requirements/README 導線）
- 現行/廃止/世代境界確認（廃止専有 ID・二重存在・100s 番台境界）
- SPEC 分離基準違反検出
- 6観点診断: SPLIT / MERGE / MOVE / DUPLICATE / RETIRE / DRIFT
- 未処理成果物確認
- 問題候補出力スキーマ（7フィールド構成）

## 参照する references

- `references/req-structure-review.md`

## 現在の動作

- 判定ロジックの提供のみ行い、ファイル変更や成果物処理は行わない
- 問題候補出力スキーマ（7フィールド構成）で診断結果を出力

## 対象外

- backlog 統合手順（`agentdev-backlog-integration` 担当）
- intake pipeline（`agentdev-intake-pipeline` 担当）
- work_type 判定（`agentdev-workflow-lifecycle` 担当）

## 検証観点

- frontmatter `id` の一意性
- ファイル名整合
- 相互参照の存在
- DOC-MAP・README・requirements/README 導線
- 廃止専有 ID・二重存在・100s 番台境界

## See Also

- [agentdev-doc-writing.md](agentdev-doc-writing.md)
- [commands/inspect-docs.md](../commands/inspect-docs.md)
- REQ-0109（inspect-docs / REQ 再構成運用）
- REQ-0136（SPEC 分離基準違反検出強化）
