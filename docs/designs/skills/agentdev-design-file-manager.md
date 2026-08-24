---
title: agentdev-design-file-manager Design
status: draft
created: 2026-07-22
updated: 2026-07-28
---

# agentdev-design-file-manager Design

Design ファイルの作成、更新、配置先判断、target_area 処理、Design 固有整合性確認、Design 固有 script の選択と呼出契約を担う操作用 skill の仕様を定める。

> **リポジトリ内部設計文書**: 本 Design は agent-dev-flow リポジトリのリポジトリ内部設計文書である。
> 実行時配布対象ではなく、実行時コマンドは本ファイルに依存しない（REQ-001）。

## 目的

`design-save` command の実行時に Design 操作（Design 作成、更新、配置判断、target_area による更新判断、Design 固有整合性確認、Design 固有 script 呼出契約）を担う操作用 skill の責務、対象外、境界を定義する。
REQ/Decision 操作 skill（`agentdev-req-file-manager`、`agentdev-decision-file-manager`）との責務重複を防ぎ、Design 操作の正規所有者を一つに定める。

## 適用対象

**USE FOR**:

- Design ファイル（`docs/designs/**/*.md`）の作成、更新、配置先判断
- `target_area` による Design 内セクション置換判断
- Design ライフサイクル規則（`draft` / `accepted`）の適用と整合性確認
- Design 固有 script（`search-target-area.ts` 等、将来追加）の選択と呼出契約
- `docs/designs/README.md` の Design 一覧表整合性確認

**DO NOT USE FOR**:

- REQ 操作、Decision 操作（`agentdev-req-file-manager`、`agentdev-decision-file-manager` の責務）
- Design 内容の新規推論（req-define、`agentdev-req-analysis` の責務）
- accepted 昇格判断（case-close の責務、v2:ADR-0123 / REQ-001-024 準拠）
- ユーザー承認（親エージェントの責務）
- commit、push（command の責務）
- 共通 script の重複実装（`agentdev-artifact-validation` の公開検証契約へ委譲）

## 提供する判断、操作

Design operation の公式 enum は `create` / `append` / `update` の3値であり、旧別名（`spec-create`、`spec-update`、`spec-append`）と新別名（`design-create`、`design-update`、`design-append`）を受け付けない（REQ-008-058）。

- Design 作成、追記、target_area 置換の配置先解決
- 新規 Design 作成時（`create`）の frontmatter（`title`、`status: draft`、`created`、`updated`）付与
- 既存 Design 変更時（`append` / `update`）の `status` 維持（変更しない）
- target_area が指定された `update` 操作におけるセクション置換ロジック（REQ-001-027/028）
- `append` 操作における新規セクション追加ロジック（anchor と placement に基づく追加、REQ-008-058）。詳細な契約（placement 別挙動、anchor マッチング規則、anchor 未検出時挙動、同名見出し時挙動、合格基準）は `../commands/design-save.md`「append 操作時のセクション追加ロジック」が正規所有する
- Design 固有整合性確認（frontmatter 完全性、target_area マッチング規則、Design status ライフサイクル）
- `search-target-area.ts`（Design 固有 script）の呼出契約。同 script は見出し行全体との完全一致のみを受け付け、前方一致、後方一致、部分一致を受け付けない（正規入力 `### IR-044` は見出し行 `### IR-044 - 題` とはマッチしない）。この契約は `target_area` マッチング規則と `append` の anchor マッチング規則の双方に適用される
- 共通検証（frontmatter 整合性、エントリ存在、変更範囲）は `agentdev-artifact-validation` の公開検証契約へ委譲

### APPEND 操作

`append` は既存 Design ファイルへ新規セクションを追加する操作である（REQ-008-058）。
配置契約の実行詳細（`placement` 別挿入位置の算出、anchor マッチング規則）は `../commands/design-save.md`「append 操作時のセクション追加ロジック」が正規所有する。

- `content` は新規見出し行から始まる
- `placement`: `tail`（既定）/ `after_anchor` / `before_anchor` のいずれか
- `anchor`: `placement` が `tail` 以外の場合は必須。見出し行全体で指定する
- 同名見出し時: `target_area` と完全一致する見出しが既存 Design ファイルに存在する場合、追加をスキップし follow-up 報告を行う（重複追加防止、全体中止しない）
- anchor 未検出時: `placement` が `tail` 以外で `anchor` 見出し行が存在しない場合、当該 action をスキップし follow-up 報告を行う（全体中止しない）
- follow-up 報告は「operation を `create` へ切り替えを推奨」を含む
- 合格基準: 追加後の Design ファイルに `target_area` と完全一致する見出しが1つだけ存在すること

### search-target-area.ts 契約

`search-target-area.ts` は見出し行全体との完全一致のみを受け付ける。
前方一致、後方一致、部分一致を受け付けない（前方一致廃止）。
正規入力（例: `### IR-044`）で回帰テストを維持する。
この契約は `target_area` マッチング規則と `append` の anchor マッチング規則の双方に適用される。

## 参照する references

- design-save.md（command 手順）の Design 操作 Step
- artifact-contracts.md「Script 所有権と委譲契約」
- artifact-responsibilities.md「操作 skill 正規所有者台帳」

## 現在の動作

- `design-save` は `target_area` 指定時、当該 skill の配置先解決、target_area マッチング規則を適用してセクション置換を行う
- `design-save` は `operation: append` 指定時、当該 skill の配置先解決、anchor と placement に基づく新規セクション追加を行う（REQ-008-058）
- 新規 Design 作成時は frontmatter `status: draft` を必ず付与する
- 既存 Design 変更時（`append` / `update`）は当該 Design の `status` を変更しない（v2:ADR-0123 Decision #1）
- Design 固有 script は `search-target-area.ts`（target_area 見出し検索、見出し行全体完全一致）を正規所有対象とする。`update` の target_area マッチングと `append` の anchor マッチングの双方で使用する
- 共通検証 script（`check-frontmatter-consistency.ts`、`check-entry-existence.ts`、`check-change-impact.ts`）は `agentdev-artifact-validation` が所有し、本 skill は公開検証契約経由で委譲する

## 境界

`agentdev-req-file-manager`（REQ 操作）および `agentdev-decision-file-manager`（Decision 操作）との責務重複がないこと。
Design 操作は本 skill が正規の所有者となる。

`agentdev-artifact-validation` との責務重複がないこと。
共通検証 script は `agentdev-artifact-validation` が所有し、本 skill は内部 script パスを直接参照せず公開検証契約へ委譲する。

`agentdev-doc-diagnostics` との責務重複がないこと。
docs 横断診断、証拠構造、finding 出力契約は `agentdev-doc-diagnostics` が所有し、本 skill は Design 操作（作成、更新、配置判断）に限定する。

## 対象外

- REQ 操作、ADR 操作（各操作 skill の責務）
- Design 内容の新規推論（req-define、`agentdev-req-analysis` の責務）
- accepted 昇格判断（case-close の責務、v2:ADR-0123 / REQ-001-024 準拠）
- ユーザー承認、commit、push（command、親エージェントの責務）
- 共通 script の重複実装（`agentdev-artifact-validation` へ委譲）

## 検証観点

- 新規 Design 作成時の frontmatter 完全性（`title`、`status: draft`、`created`、`updated`）
- 既存 Design 変更時（`append` / `update`）の `status` 変更がないこと
- target_area マッチング規則の適用結果（単一マッチ、複数マッチ時の warn、未検出時のスキップ + follow-up）
- `append` 操作時の anchor マッチング、placement 別挙動の適用結果、挿入後の Markdown 構造破損がないこと
- 共通検証委譲の結果（`agentdev-artifact-validation` 公開検証契約経由）
- `docs/designs/README.md` の新規 Design エントリ登録（REQ-001-004）

## See Also

- [design-save.md](../commands/design-save.md)（Design 操作 command。`append` 操作時のセクション追加ロジック詳細を正規所有）
- [agentdev-req-file-manager.md](agentdev-req-file-manager.md)（REQ 操作 skill）
- [agentdev-decision-file-manager.md](agentdev-decision-file-manager.md)（Decision 操作 skill）
- [agentdev-artifact-validation.md](agentdev-artifact-validation.md)（共通検証 skill）
- [agentdev-doc-diagnostics.md](agentdev-doc-diagnostics.md)（docs 横断診断 skill）
- v2:ADR-0123（Design lifecycle と design-save の導入）
- REQ-001（REQ/Design 責務分離）、REQ-002-159（script 所有権）、REQ-008-058（Design operation enum 公式契約。別名不受理）
