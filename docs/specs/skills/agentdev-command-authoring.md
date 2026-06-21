---
title: agentdev-command-authoring SPEC
status: draft
created: 2026-06-21
updated: 2026-06-21
---

# agentdev-command-authoring SPEC

## 目的

OpenCode コマンド定義（`.opencode/commands/`）の品質基準とベストプラクティスを提供する。

## 適用対象

- 新規コマンド作成・既存コマンド改善
- コマンド品質レビュー
- orchestration skill 切り出し判断
- 委譲定義記述時

## 提供する判断・操作

- Frontmatter 規約（`description`・`agent` 等）
- 責任分界（薄いコマンド構造）
- DoD 基準（行数・Steps）
- 実行時パス規約（`.opencode/commands/`）
- サブエージェント編集安全性
- 委譲定義の最小構成・delegated_check・中間成果基準

## 参照する references

- `references/command-authoring-standards.md`

## 現在の動作

- Command は公開 API・入出力・Steps に徹する
- 詳細は Skill へ・決定的処理は Script へ
- 行数上限 150行

## 対象外

- Skill 作成（`agentdev-skill-authoring` 担当）
- テンプレート作成（`agentdev-workflow-templates` 担当）
- 一般的なコーディング
- ドキュメント修正

## 検証観点

- DoD 項目の充足
- Frontmatter 純粋性（`description` / `agent` のみ）
- 行数（150行上限）

## See Also

- [agentdev-skill-authoring.md](agentdev-skill-authoring.md)
- [agentdev-command-creator.md](agentdev-command-creator.md)
- REQ-0103 — Artifact責任分界
- REQ-0119 — コマンド・スキル・サブエージェント責務分界
