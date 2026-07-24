---
title: agentdev-doc-diagnostics SPEC
status: draft
created: 2026-07-22
updated: 2026-07-24
---

# agentdev-doc-diagnostics SPEC

docs 横断の診断カテゴリ、共通証拠構造、共通 finding 出力契約、文書種別別診断へのルーティングを担う診断判断 skill の仕様を定める。

> **リポジトリ内部設計文書**: 本 SPEC は agent-dev-flow リポジトリのリポジトリ内部設計文書である。
> 実行時配布対象ではなく、実行時コマンドは本ファイルに依存しない（ADR-0103, ADR-0104）。

## 目的

`inspect-docs` command の実行時に docs 横断診断の実行を担う診断判断 skill の責務、対象外、境界を定義する。REQ 固有診断（`agentdev-req-structure-diagnostics`）、文意品質（`agentdev-doc-writing`）、探索順（`agentdev-doc-map`）との責務重複を防ぎ、docs 横断診断の正規所有者を一つに定める。名称は REQ-0124-025 の diagnostics 許容例外境界に基づき `agentdev-doc-diagnostics` を維持する（CR-001）。

## 適用対象

**USE FOR**:

- inspect-docs command の診断カテゴリ定義
- docs 横断の診断判定規則
- 共通証拠構造（finding schema、severity、信頼度）
- 診断結果（finding）の出力契約
- 診断に必要な reference または script の選択
- 文書種別別診断（REQ 固有、文意品質、探索順）へのルーティング

**DO NOT USE FOR**:

- 診断対象の修正（読み取り専用、intake/inspect pipeline 経由でのみ修正）
- promote 判断（`inspect-promote` の責務）
- REQ、SPEC、RU の保存（各保存 command の責務）
- commit、push（command の責務）
- Issue、PR 操作（case-* command の責務）
- REQ 固有の SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT 診断（`agentdev-req-structure-diagnostics` の責務）
- 文意品質診断（`agentdev-doc-writing` の責務）
- 探索順（`agentdev-doc-map` の責務）

## 提供する判断・操作

- docs 横断診断カテゴリの定義（廃止 REQ/SPEC 由来記述残置、REQ/SPEC 境界違反、REQ 粒度過小 等）
- 診断判定規則と証拠構造
- 共通 finding 出力契約（`.agentdev/inspect/inbox/*.md`、severity 分類、信頼度）
- 文書種別別診断へのルーティング表
- inspect-docs command への診断カテゴリ、証拠、finding 形式の提供

## 参照する references

- inspect-docs.md（command 手順）の診断実行 Step
- artifact-responsibilities.md「操作 skill 正規所有者台帳」
- artifact-contracts.md「サブエージェント委譲契約」（finding 出力契約）

## 現在の動作

- inspect-docs command は診断の実行と finding 出力を担い、診断カテゴリ、証拠構造、出力契約、ルーティングは本 skill が一次所有する（REQ-0109-048）
- REQ 固有診断（SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT）は `agentdev-req-structure-diagnostics`、文意品質は `agentdev-doc-writing`、探索順は `agentdev-doc-map` が残留する
- 本 skill は横断編成と結果統合のみを所有し、専門診断の再定義を行わない
- 診断対象は読み取り専用とし、許可される副作用は `.agentdev/inspect/inbox/*.md` の生成と `.agentdev/inspect/` 配下の git 永続化（commit / push）のみ（REQ-0103-140-151、inspect lifecycle 準拠）

## 境界

`agentdev-doc-writing`（文意品質）、`agentdev-doc-map`（探索順）、`agentdev-req-structure-diagnostics`（REQ 固有 SPLIT/MERGE/MOVE/DUPLICATE/RETIRE/DRIFT）との責務重複がないこと。docs 横断診断は本 skill が正規の所有者となる（REQ-0124-025 の diagnostics 許容例外境界、CR-001）。

## 対象外

- 診断対象の修正（読み取り専用、intake/inspect pipeline 経由でのみ修正）
- promote 判断（`inspect-promote` の責務）
- REQ、SPEC、RU の保存（各保存 command の責務）
- commit、push、Issue/PR 操作（command の責務）
- REQ 固有診断、文意品質、探索順（各専門 skill の責務）

## 検証観点

- 診断カテゴリ定義の完全性（廃止 REQ/SPEC 由来記述残置、REQ/SPEC 境界違反 等）
- 共通証拠構造と finding 出力契約の適合性
- 文書種別別診断へのルーティング精度
- 読み取り専用制約の遵守（許可副作用は `.agentdev/inspect/inbox/*.md` 生成と git 永続化のみ）
- 既存専門診断 skill との責務重複なし

## See Also

- [agentdev-req-structure-diagnostics.md](agentdev-req-structure-diagnostics.md)（REQ 固有診断 skill）
- [agentdev-doc-writing.md](agentdev-doc-writing.md)（文意品質 skill）
- [agentdev-doc-map.md](agentdev-doc-map.md)（探索順 skill）
- REQ-0124-025（diagnostics 命名許容例外境界）
- REQ-0109-048（inspect-docs と diagnostics skill の責務分離）
