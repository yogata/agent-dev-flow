---
title: "コマンドファイルフォーマット規約"
status: draft
created: 2026-06-22
updated: 2026-06-22
---

# コマンドファイルフォーマット規約

AgentDevFlow が管理する command 定義ファイルの Markdown 構成標準。本 SPEC は command 定義ファイルが従うべき詳細なフォーマット規約を定義する。

> **リポジトリ内部設計文書**: 本 SPEC は agent-dev-flow リポジトリのリポジトリ内部設計文書である。実行時配布対象ではなく、実行時コマンドは本ファイルに依存しない（ADR-0103, ADR-0104）。

## 適用範囲

- **対象**: `src/opencode/commands/agentdev/*.md`（AgentDevFlow 配布 command 原本）、`.opencode/commands/repo/*.md`（repo-local command）
- **対象外**: AgentDevFlow 適用プロジェクト（consumer project）の独自 command

## 手順セクション形式

`## 手順` 配下の Step 構造は以下の形式に従う。

| 項目 | 規約 | 禁止形式 |
|------|------|----------|
| Step 見出し | `### Step N: タイトル` | — |
| Step 番号開始値 | `1` から開始 | `0`（`Step 0`） |
| サブステップ | `Step N-M`（N は親 Step 番号、M は `1` から開始） | ゼロ起点（`Step N-0`） |
| 主手順表現 | `### Step N` 見出しによる構造化 | numbered list（`1.` `2.` ...）による主手順 |
| フェーズ見出し | `## 手順` 配下に配置しない | `## 手順` 内での別軸フェーズ見出しの混在 |

## ガードレール番号

ガードレール番号は `G` + ゼロ埋め2桁（`G01`, `G02`, ..., `G99`）形式に統一する。

## 機械検査対象

`/repo/docs-check` が検出する機械判定可能な違反。

| 検出項目 | 対象 |
|----------|------|
| `Step 0` の使用 | `### Step 0` 見出し、または本文中の `Step 0` 参照 |
| 非連番 Step 番号 | `## 手順` 配下の Step 番号が連続していない（飛び番） |
| ゼロ起点サブステップ | `Step N-0` 形式のサブステップ |
| numbered list 主手順 | `## 手順` 直下の numbered list による手順記述 |
| `G01` 形式以外のガードレール番号 | `G` + ゼロ埋め2桁に一致しないガードレール識別子 |

## 他 SPEC との関係

- **`patterns.md`**: frontmatter 規約・テンプレート命名規則を担当。本 SPEC は command 本文構造を担当し、frontmatter 規約は `patterns.md` を参照する。
- **`docs/specs/commands/*.md`**: 個別 command SPEC の位置づけを維持する。横断フォーマット規約は本 SPEC に集約し、個別 command SPEC には配置しない。
