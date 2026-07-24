---
name: agentdev-command-creator
description: Creates and configures OpenCode custom commands for automating recurring tasks. USE FOR: creating commands, setting up command templates, or configuring agent/model bindings. DO NOT USE FOR: executing existing commands, modifying skill files, or general development tasks.
---

# `agentdev-command-creator`

## 原本（SSoT）

本スキルの原本仕様は `agentdev-command-creator` SPEC である。
SPEC を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。重複または不一致がある場合は SPEC を正とする。
extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## プロジェクト固有ルール

- 配置場所: `.opencode/commands/`（Markdown形式）
- ファイル名（`test.md`）がコマンド名（`/test`）になる
- ハイフン区切り: `my-command.md`

## 簡易参照（Quick Reference）

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
