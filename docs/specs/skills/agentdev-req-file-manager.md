---
title: `agentdev-req-file-manager` SPEC
status: accepted
created: 2026-06-21
updated: 2026-07-27
---

# `agentdev-req-file-manager` SPEC

## 目的

REQ ファイルの作成、追記、更新を管理する知識ベースとして採番ルール、ファイル操作モード、判定基準、バリデーションルールを提供する。

## 適用対象

- req-define（要件定義時、照合方法論、分類ゲートルール）
- req-save（REQ 保存時、採番、CREATE/APPEND/UPDATE 操作、インデックス、ハブ更新、語彙、責務、runtime 境界矛盾防止、Catalog entry 確認）
- case-open（Issue 作成時の REQ 参照）
- case-run（実行時の REQ 参照）
- case-update（要件更新時、`--req` フラグ）

## 提供する判断、操作

- REQ 番号採番（最大番号 +1、欠番再利用禁止）
- CREATE / APPEND / UPDATE 操作モード選択
- 既存 REQ 照合方法論（CREATE/APPEND/UPDATE 判定、`glob docs/requirements/REQ-*.md` での実ファイル列挙と文書記載レンジ照合）
- 分類ゲートルール（状態要件 vs 反映作業、反映作業のみの要件行混入検出）
- RU パス保存禁止ルール
- ドラフト検証（artifact_actions、operation_units、topic_slug 必須フィールド）
- REQ ファイル整合性検査（docs/requirements/ 配下、README インデックス、docs/README ハブ、frontmatter id 一致）

## 参照する references

- `templates/doc_requirement.md`（REQ テンプレート）

## 現在の動作

- REQ-{NNN} 形式で3桁ゼロ埋め採番
- 要件行は「変更後に満たすべき振る舞い、制約、状態」のみ記述
- 実装指示は要件行に含めない
- bugfix では REQ ファイルを作成しない
- 旧 REQ 群（v2:REQ-0001〜0050）は2026-07-20に物理削除済みであり、履歴資料は tag `v2.11.0` で参照する。現行判断の根拠としない

## 対象外

- 要件分析手法（`agentdev-req-analysis` 担当）
- Decision ファイル作成、更新（`agentdev-decision-file-manager` 担当）
- 文書品質査読（`agentdev-doc-writing` 担当）
- 要件収集

## 検証観点

- frontmatter 必須フィールドの充足
- ID とファイル名の一致
- 日付フォーマットの正当性
- 反映作業のみの要件行が混入していないか
- REQ 番号の連番、一意性（空き番号再利用禁止）

## 実装詳細

### REQ-ID 形式契約の一律性

`alloc-composite-id.ts` が提供する複合ID（要件行ID）の抽出・認識関数は、REQ 番号の桁数として3桁（`REQ-001-NNN`）と4桁（`REQ-0011-NNN`）の両方を一貫して認識する。
現行 REQ 群が3桁（REQ-001〜REQ-011）、旧 REQ 群（v2:REQ-0001〜0050）が4桁であった歴史的経緯に由来する。

関数間で正規表現の桁数契約を不一致させてはならない。
`extractAllCompositeIds`、`extractCompositeIdNumbers`、`extractReqNumber`、`reqNumberFromFilename` は全て `(\d{3,4})` を用い、3桁と4桁を同一に扱う。
一部の関数だけ `(\d{4})` に固定する変更を加えてはならない。

採番結果（`formatCompositeId`）の正規化出力は4桁ゼロ埋めとする。
入力認識は3桁と4桁を許容するが、新規採番結果は4桁へ正規化する。

採番検証テスト（`scripts/tests/alloc-composite-id.test.ts`）は、3桁 REQ 群（REQ-001, REQ-003, REQ-006, REQ-008, REQ-010）と4桁 REQ 群（REQ-0011）が混在する入力で `extractAllCompositeIds` と `extractCompositeIdNumbers` が正しく max を返すことを検証する。
桁数混在による max 計算の歪みを検出するため、混在入力を必須とする。

## See Also

- [agentdev-req-analysis.md](agentdev-req-analysis.md)
- [agentdev-decision-file-manager.md](agentdev-decision-file-manager.md)
- [commands/req-save.md](../commands/req-save.md)
- REQ-001（文書、REQ 管理基準）
- REQ-004（要件定義、保存）
