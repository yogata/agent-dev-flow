---
title: agentdev-spec-file-manager SPEC
status: draft
created: 2026-07-22
updated: 2026-07-24
---

# agentdev-spec-file-manager SPEC

SPEC ファイルの作成、更新、配置先判断、target_area 処理、SPEC 固有整合性確認、SPEC 固有 script の選択と呼出契約を担う操作用 skill の仕様を定める。

> **リポジトリ内部設計文書**: 本 SPEC は agent-dev-flow リポジトリのリポジトリ内部設計文書である。
> 実行時配布対象ではなく、実行時コマンドは本ファイルに依存しない（ADR-0103, ADR-0104）。

## 目的

`spec-save` command の実行時に SPEC 操作（SPEC 作成、更新、配置判断、target_area による更新判断、SPEC 固有整合性確認、SPEC 固有 script 呼出契約）を担う操作用 skill の責務、対象外、境界を定義する。REQ/ADR 操作 skill（`agentdev-req-file-manager`、`agentdev-adr-file-manager`）との責務重複を防ぎ、SPEC 操作の正規所有者を一つに定める。

## 適用対象

**USE FOR**:

- SPEC ファイル（`docs/specs/**/*.md`）の作成、更新、配置先判断
- `target_area` による SPEC 内セクション置換判断
- SPEC ライフサイクル規則（`draft` / `accepted` / `superseded`、ADR-0123）の適用と整合性確認
- SPEC 固有 script（`search-target-area.ts` 等、将来追加）の選択と呼出契約
- `docs/specs/README.md` の SPEC 一覧表整合性確認

**DO NOT USE FOR**:

- REQ 操作、ADR 操作（`agentdev-req-file-manager`、`agentdev-adr-file-manager` の責務）
- SPEC 内容の新規推論（req-define、`agentdev-req-analysis` の責務）
- accepted 昇格判断（case-close の責務、ADR-0123 / REQ-0136-024 準拠）
- ユーザー承認（親エージェントの責務）
- commit、push（command の責務）
- 共通 script の重複実装（`agentdev-artifact-validation` の公開検証契約へ委譲）

## 提供する判断・操作

- SPEC 作成、追記、target_area 置換の配置先解決
- 新規 SPEC 作成時の frontmatter（`title`、`status: draft`、`created`、`updated`）付与
- 既存 SPEC 追記時の `status` 維持（変更しない）
- target_area が指定された update/spec-update 操作におけるセクション置換ロジック（REQ-0136-027/028）
- SPEC 固有整合性確認（frontmatter 完全性、target_area マッチング規則、SPEC status ライフサイクル）
- `search-target-area.ts`（SPEC 固有 script）の呼出契約
- 共通検証（frontmatter 整合性、エントリ存在、変更範囲）は `agentdev-artifact-validation` の公開検証契約へ委譲

## 参照する references

- spec-save.md（command 手順）の SPEC 操作 Step
- artifact-contracts.md「Script 所有権と委譲契約」
- artifact-responsibilities.md「操作 skill 正規所有者台帳」

## 現在の動作

- `spec-save` は `target_area` 指定時、当該 skill の配置先解決、target_area マッチング規則を適用してセクション置換を行う
- 新規 SPEC 作成時は frontmatter `status: draft` を必ず付与する（G05）
- 既存 SPEC へ追記時は当該 SPEC の `status` を変更しない（G06、ADR-0123 Decision #1）
- SPEC 固有 script は `search-target-area.ts`（target_area 見出し検索）を正規所有対象とする
- 共通検証 script（`check-frontmatter-consistency.ts`、`check-entry-existence.ts`、`check-change-impact.ts`）は `agentdev-artifact-validation` が所有し、本 skill は公開検証契約経由で委譲する

## 境界

`agentdev-req-file-manager`（REQ 操作）および `agentdev-adr-file-manager`（ADR 操作）との責務重複がないこと。SPEC 操作は本 skill が正規の所有者となる。

`agentdev-artifact-validation` との責務重複がないこと。共通検証 script は `agentdev-artifact-validation` が所有し、本 skill は内部 script パスを直接参照せず公開検証契約へ委譲する。

`agentdev-doc-diagnostics` との責務重複がないこと。docs 横断診断、証拠構造、finding 出力契約は `agentdev-doc-diagnostics` が所有し、本 skill は SPEC 操作（作成、更新、配置判断）に限定する。

## 対象外

- REQ 操作、ADR 操作（各操作 skill の責務）
- SPEC 内容の新規推論（req-define、`agentdev-req-analysis` の責務）
- accepted 昇格判断（case-close の責務、ADR-0123 / REQ-0136-024 準拠）
- ユーザー承認、commit、push（command、親エージェントの責務）
- 共通 script の重複実装（`agentdev-artifact-validation` へ委譲）

## 検証観点

- 新規 SPEC 作成時の frontmatter 完全性（`title`、`status: draft`、`created`、`updated`）
- 既存 SPEC 追記時の `status` 変更がないこと（G06）
- target_area マッチング規則の適用結果（単一マッチ、複数マッチ時の warn、未検出時のスキップ + follow-up）
- 共通検証委譲の結果（`agentdev-artifact-validation` 公開検証契約経由）
- `docs/specs/README.md` の新規 SPEC エントリ登録（REQ-0154-004）

## See Also

- [agentdev-req-file-manager.md](agentdev-req-file-manager.md)（REQ 操作 skill）
- [agentdev-adr-file-manager.md](agentdev-adr-file-manager.md)（ADR 操作 skill）
- [agentdev-artifact-validation.md](agentdev-artifact-validation.md)（共通検証 skill）
- [agentdev-doc-diagnostics.md](agentdev-doc-diagnostics.md)（docs 横断診断 skill）
- ADR-0123（SPEC lifecycle と spec-save の導入）
- REQ-0136（REQ/SPEC 責務分離）、REQ-0103-159（script 所有権）
