---
title: agentdev-artifact-validation SPEC
status: draft
created: 2026-07-22
updated: 2026-07-24
---

# agentdev-artifact-validation SPEC

複数文書種別で共有する決定的検証 script、共有ライブラリ、公開検証契約、JSON 結果契約を担う検証 skill の仕様を定める。

> **リポジトリ内部設計文書**: 本 SPEC は agent-dev-flow リポジトリのリポジトリ内部設計文書である。
> 実行時配布対象ではなく、実行時コマンドは本ファイルに依存しない（ADR-0103, ADR-0104）。

## 目的

REQ/ADR/SPEC 操作で共有される決定的検証 script（frontmatter 整合性、エントリ存在確認、変更範囲検証）と共有ライブラリの正規所有者を一つに定め、兄弟 skill、command からの内部 script 直接参照を禁止し、公開検証契約への委譲を促す。REQ、ADR、SPEC 固有の内容判断を行わず、決定的検証のみを所有する検証 skill の責務、対象外、境界を定義する。

## 適用対象

**USE FOR**:

- 文書種別横断の決定的検証 script の所有と運用
- 公開検証契約の提供（操作名、入力、JSON 結果契約、エラー契約）
- 共有 lib と対応 test の所有
- 利用側 skill、command への公開検証契約経由の委譲

**DO NOT USE FOR**:

- REQ、ADR、SPEC 固有の内容判断（各操作 skill の責務）
- 文書の作成、更新、削除（各操作 skill の責務）
- 保存、ユーザー承認、commit、push（各 command の責務）
- REQ 番号、ADR 番号、要件行 ID の採番（`agentdev-req-file-manager`、`agentdev-adr-file-manager` の責務）
- target_area の検索（`agentdev-spec-file-manager` の責務）

## 提供する判断・操作

- `check-frontmatter-consistency.ts`（frontmatter id ↔ ファイル名整合性確認、REQ/ADR 横断）の所有
- `check-entry-existence.ts`（README/DOC-MAP/mapping-table エントリ存在確認）の所有
- `check-change-impact.ts`（変更範囲検証、許可パスリストとの照合）の所有
- 上記 script が利用する共有 lib の所有
- 対応 test（`tests/*.test.ts`）の所有
- 利用側 skill、command へ内部パスを公開しない検証操作契約
- 入力、JSON 結果、エラー、副作用なしの共通契約

## 参照する references

- artifact-contracts.md「Script 所有権と委譲契約」
- artifact-responsibilities.md「操作 skill 正規所有者台帳」
- req-save.md、spec-save.md（共通検証 script 呼出 Step）

## 現在の動作

- 所有 script（`check-frontmatter-consistency.ts`、`check-entry-existence.ts`、`check-change-impact.ts`）は `src/opencode/skills/agentdev-artifact-validation/scripts/` 配下に配置する
- script は決定的（純粋関数）、テスト可能（`tests/*.test.ts`）とする
- I/O は argv/stdin で入力を受け取り、stdout で JSON 結果を返す（REQ-0103-160）
- 利用側 command、skill（`agentdev-req-file-manager`、`agentdev-adr-file-manager`、`agentdev-spec-file-manager`、`req-save`、`spec-save` 等）は内部 script パスを直接参照せず、本 skill の公開検証契約へ委譲する
- 同一 script または共有 lib を複数 skill へ複製しない

## 境界

REQ 固有 script は `agentdev-req-file-manager`、ADR 固有 script は `agentdev-adr-file-manager`、SPEC 固有 script は `agentdev-spec-file-manager` が所有する。利用側は本 skill の内部 script を直接参照せず、公開検証契約へ委譲する。同一 script または共有 lib を複製しない。

## 対象外

- REQ、ADR、SPEC 固有の内容判断（各操作 skill の責務）
- 文書の作成、更新、削除（各操作 skill の責務）
- 保存、ユーザー承認、commit、push（command の責務）
- REQ 番号、ADR 番号、要件行 ID の採番（REQ/ADR 操作 skill の責務）
- target_area の検索（SPEC 操作 skill の責務）

## 検証観点

- 公開検証契約の安定性（操作名、入力、JSON 結果契約、エラー契約が変更されないこと）
- script の決定性（同じ入力に対して同じ結果を返すこと）
- 共有 lib のテスト可能性（`tests/*.test.ts` が通過すること）
- 利用側 command、skill に内部 script パス参照がないこと
- 同一 script の複製がないこと

## See Also

- [agentdev-req-file-manager.md](agentdev-req-file-manager.md)（REQ 操作 skill、REQ 固有 script 所有）
- [agentdev-adr-file-manager.md](agentdev-adr-file-manager.md)（ADR 操作 skill、ADR 固有 script 所有）
- [agentdev-spec-file-manager.md](agentdev-spec-file-manager.md)（SPEC 操作 skill、SPEC 固有 script 所有）
- REQ-0103-159（script 所有権の責務別配置）
- REQ-0136-029（決定的処理の script 委譲）
