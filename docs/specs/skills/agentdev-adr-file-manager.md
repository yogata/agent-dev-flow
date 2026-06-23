---
title: agentdev-adr-file-manager SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# agentdev-adr-file-manager SPEC

## 目的

ADR ファイルの作成、追記、更新を管理する知識ベースとして採番ルール、ファイル操作モード、判定基準、ステータス遷移、整合性チェックを提供する。

## 適用対象

- req-save（ADR ファイル保存時、採番、CREATE 操作、`new:{topic-slug}` 形式から確定番号への置換）
- case-open（Issue 作成時の ADR 参照）
- case-run（実行時の ADR 参照）

## 提供する判断、操作

- ADR 番号採番（最大番号 +1、欠番再利用禁止）
- CREATE / APPEND / UPDATE 操作モード選択
- ステータス遷移ルール（proposed → accepted → deprecated / superseded）
- 整合性チェック（frontmatter、ID、日付フォーマット、ステータス遷移）
- 現行 ADR（`docs/adr/ADR-01XX.md`）と廃止 ADR（`docs/adr/retired/ADR-00XX.md`）の区別

## 参照する references

- `templates/doc_adr.md`（ADR テンプレート）

## 現在の動作

- ADR-{NNNN} 形式で4桁ゼロ埋め採番
- 初期ステータスは `proposed`（req-save で作成時）
- 単なる廃止、削除、移行は新規 ADR ではなく `retire` / `supersede` で処理
- accepted 後は非セマンティックな軽微修正のみ許可
- 確定番号は req-save が本スキルの採番ルールで確定し、draft 内の全 ADR 参照（`new:{topic-slug}` 形式）を置換

## 対象外

- ADR 作成ガイドライン、ADR 必要かどうかの判定（`agentdev-adr-guidelines` 担当）
- 要件分析手法（`agentdev-req-analysis` 担当）
- 文書品質査読（`agentdev-doc-writing` 担当）

## 検証観点

- frontmatter 必須フィールドの充足
- ID とファイル名の一致
- 日付フォーマットの正当性
- ステータス遷移が許容遷移に従っているか

## See Also

- [agentdev-adr-guidelines.md](agentdev-adr-guidelines.md)
- [agentdev-req-file-manager.md](agentdev-req-file-manager.md)
- [commands/req-save.md](../commands/req-save.md)
- REQ-0112（ADR ライフサイクル標準化）
