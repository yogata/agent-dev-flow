---
title: `agentdev-command-authoring` SPEC
status: accepted
created: 2026-06-21
updated: 2026-08-10
---

# `agentdev-command-authoring` SPEC

## 目的

OpenCode コマンド定義（`.opencode/commands/`）の品質基準とベストプラクティスを提供する。

## 適用対象

- 新規コマンド作成、既存コマンド改善
- コマンド品質レビュー
- orchestration skill 切り出し判断
- 委譲定義記述時

## 提供する判断、操作

- Frontmatter 規約（`description` 単一）
- 責任分界（薄いコマンド構造）
- DoD 基準（行数、Steps）
- 実行時パス規約（`.opencode/commands/`）
- サブエージェント編集安全性
- 委譲定義の最小構成、delegated_check、中間成果基準

## 参照する references

- `references/command-authoring-standards.md`

## 現在の動作

- Command は公開 API、入出力、Steps に徹する
- 詳細は Skill へ、決定的処理は Script へ
- 行数上限 150行

## 対象外

- Skill 作成（`agentdev-skill-authoring` 担当）
- テンプレート作成（`agentdev-workflow-templates` 担当）
- 一般的なコーディング
- ドキュメント修正

## 検証観点

- DoD 項目の充足
- Frontmatter 純粋性（`description` 単一）
- 行数（150行上限）

## See Also

- [agentdev-skill-authoring.md](agentdev-skill-authoring.md)
- [agentdev-command-creator.md](agentdev-command-creator.md)
- REQ-002（Artifact責任分界）
- REQ-003（コマンド、スキル、サブエージェント責務分界）

## 公開IF と dispatch

Command authoring は公開interface と workflow dispatch のみを Command に記述する
（DEC-010）。workflow 実装本体は Workflow Skill が所有する。Command は Workflow Skill 名レベルで
参照し、STEP 内部パスへ直接依存しない（REQ-002-017）。

## command authoring 基準

command authoring SPEC の frontmatter 例、DoD、fixture 指針を description 単一契約へ更新する。command 薄型化の基準（入力/出力/高レベル工程/副作用境界/QG/停止条件/承認境界/委譲境界は command 残置、詳細分類表/script CLI例/正規表現/prompt 全文/未採用候補は skill/reference 移管、150行以内・主要7command は100〜140行）を REQ-002-001..004 と整合して明記する。詳細 normative は移行計画 §5.2, §8.1。

