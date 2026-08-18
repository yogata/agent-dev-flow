---
title: `agentdev-command-authoring` SPEC
status: accepted
created: 2026-06-21
updated: 2026-08-18
spec_logical_division: cross_cutting_contract
canonical_owner: agentdev-command-authoring
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
- 参照先実ファイル存在確認（command 本文から workflow 節・テンプレート・完了一覧等へのパス参照が実ファイルを指すこと。参照のみが存在し実ファイルが不存在する状態を査読で検出する）

## See Also

- [agentdev-skill-authoring.md](agentdev-skill-authoring.md)
- [agentdev-command-creator.md](agentdev-command-creator.md)
- REQ-002（Artifact責任分界）
- REQ-003（コマンド、スキル、サブエージェント責務分界）

## 公開IF と dispatch

Command authoring は公開interface と workflow dispatch のみを Command に記述する
（DEC-010）。
workflow 実装本体は Workflow Skill が所有する。
Command は Workflow Skill 名レベルで
参照し、STEP 内部パスへ直接依存しない（REQ-002-017）。

## command authoring 基準（層1〜3適用）

- command 定義は公開 interface（入出力契約、ガードレール、dispatch 宣言）に限定し、Workflow Skill が所有する工程詳細を再要約しない
- 工程の要約は前提条件・出力契約・検証基準の表形式（前得出出力検証表）で記述する。様式の詳細は authoring/command-file-format.md が正規所有する
- 権威情報源宣言はコマンド本文に 1 回までとする。計測単位は dispatch 宣言と soft guard 宣言節を除く明示的な宣言サイト（「〜が正規所有する」「正典は〜」等の記述）の数とし、PR #2186 の運用解釈に基づく
- ガードレールは硬い境界（否定規則）と肯定形の不変条件へ分類集約し、工程上の選好を G 番号で列挙しない
- 本文の soft guard 宣言節（core 8 + inspect 3）は grep 可能な `soft guard` マーカーを維持する

