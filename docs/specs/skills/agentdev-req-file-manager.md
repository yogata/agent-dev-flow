---
title: agentdev-req-file-manager SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# agentdev-req-file-manager SPEC

## 目的

REQ ファイルの作成・追記・更新を管理する知識ベースとして採番ルール・ファイル操作モード・判定基準・バリデーションルールを提供する。

## 適用対象

- req-define（要件定義時・照合方法論・分類ゲートルール）
- req-save（REQ 保存時・採番・CREATE/APPEND/UPDATE 操作・インデックス・ハブ更新・語彙・責務・runtime 境界矛盾防止・Catalog entry 確認）
- case-open（Issue 作成時の REQ 参照）
- case-run（実行時の REQ 参照）
- case-update（要件更新時・`--req` フラグ）

## 提供する判断・操作

- REQ 番号採番（最大番号 +1・欠番再利用禁止）
- CREATE / APPEND / UPDATE 操作モード選択
- 既存 REQ 照合方法論（CREATE/APPEND/UPDATE 判定・`glob docs/requirements/REQ-*.md` での実ファイル列挙と文書記載レンジ照合）
- 分類ゲートルール（状態要件 vs 反映作業・反映作業のみの要件行混入検出）
- RU パス保存禁止ルール
- ドラフト検証（artifact_actions・operation_units・topic_slug 必須フィールド）
- REQ ファイル整合性検査（docs/requirements/ 配下・README インデックス・docs/README ハブ・frontmatter id 一致）

## 参照する references

- `templates/doc_requirement.md`（REQ テンプレート）

## 現在の動作

- REQ-{NNNN} 形式で4桁ゼロ埋め採番
- 要件行は「変更後に満たすべき振る舞い・制約・状態」のみ記述
- 実装指示は要件行に含めない
- bugfix では REQ ファイルを作成しない
- 旧 REQ 群（REQ-0001〜0050・retired）を履歴参照として扱い、現行判断の根拠としない

## 対象外

- 要件分析手法（`agentdev-req-analysis` 担当）
- ADR ファイル作成・更新（`agentdev-adr-file-manager` 担当）
- 文書品質査読（`agentdev-doc-writing` 担当）
- 要件収集

## 検証観点

- frontmatter 必須フィールドの充足
- ID とファイル名の一致
- 日付フォーマットの正当性
- 反映作業のみの要件行が混入していないか
- REQ 番号の連番・一意性（空き番号再利用禁止）

## See Also

- [agentdev-req-analysis.md](agentdev-req-analysis.md)
- [agentdev-adr-file-manager.md](agentdev-adr-file-manager.md)
- [agentdev-doc-map.md](agentdev-doc-map.md)
- [commands/req-save.md](../commands/req-save.md)
- REQ-0101（文書・REQ 管理基準）
- REQ-0102（要件定義・保存）
