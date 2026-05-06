---
name: commands-creator
description: Creates and configures OpenCode custom commands for automating recurring tasks. Use when creating commands, setting up command templates, or configuring agent/model bindings.
---

# commands-creator

## プロジェクト固有ルール

- 配置場所: `.opencode/commands/`（Markdown形式）
- ファイル名（`test.md`）がコマンド名（`/test`）になる
- ハイフン区切り: `my-command.md`

## Quick Reference

| 設定項目 | 必須/任意 | 説明 |
|----------|-----------|------|
| frontmatter後の本文 | 必須 | LLMに送信するプロンプト |
| `description` | 任意 | TUIで表示される説明 |
| `agent` | 任意 | 実行するエージェント名 |
| `subtask` | 任意 | サブエージェントとして実行（true/false） |
| `model` | 任意 | 使用するモデル名 |

| プレースホルダー | 例 |
|------------------|-----|
| `$ARGUMENTS` | `/component Button` → `Button` |
| `$1`, `$2` | `/create-file config.json src` → `$1=config.json`, `$2=src` |
| `` !`command` `` | `` !`npm test` `` でシェルコマンド出力を注入 |
| `@filename` | `@src/components/Button.tsx` でファイル参照 |
