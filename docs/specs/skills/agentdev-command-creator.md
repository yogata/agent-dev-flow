---
title: agentdev-command-creator SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# agentdev-command-creator SPEC

## 目的

繰り返しタスクの自動化のための OpenCode カスタムコマンドを作成・設定するウィザード。

## 適用対象

- コマンド新規作成
- テンプレート設定
- エージェント/モデルバインディングの設定

## 提供する判断・操作

- 配置場所（`.opencode/commands/`）
- ファイル命名規則（ハイフン区切り・ファイル名がコマンド名になる）
- 基本的な設定項目（`description`・`agent`・`model`・プレースホルダー）

## 参照する references

- なし（SKILL.md 本文に集約）

## 現在の動作

- 配置場所: `.opencode/commands/`
- ファイル名（`test.md`）がコマンド名（`/test`）になる
- Markdown 形式

## 対象外

- 既存コマンドの実行
- Skill ファイル修正（`agentdev-skill-authoring` 担当）
- 一般的な開発作業
- コマンド品質基準（`agentdev-command-authoring` 担当）

## 検証観点

- 配置場所の適切性（`.opencode/commands/`）
- 命名規則の遵守（ハイフン区切り）
- 基本設定項目（`description`・`agent`）の適切性

## See Also

- [agentdev-command-authoring.md](agentdev-command-authoring.md)
- [agentdev-skill-authoring.md](agentdev-skill-authoring.md)
