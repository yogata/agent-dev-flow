---
name: agentdev-skill-authoring
description: Provides quality criteria and best practices for authoring OpenCode SKILL.md files across five evaluation axes and four check protocols. USE FOR: creating or improving skills, reviewing skill quality, designing skill structure, writing trigger descriptions, planning progressive disclosure. DO NOT USE FOR: creating command definitions, general coding tasks, simple documentation fixes.
---

# スキル作成ベストプラクティス

OpenCodeのSKILL.mdを書く際の実践ガイド。
スキルの品質を設計原則、構造、品質評価、開発ワークフロー、配置判断の観点から担保する。

## 原本（SSoT）

本スキルの原本仕様は `agentdev-skill-authoring` SPEC である。
SPEC を正規原本とし、SKILL.md は実行入口および skill 固有の補完情報を保持する。
重複または不一致がある場合は SPEC を正とする。
extension（`.agentdev/extensions/skills/`）は標準 SKILL.md を前提とし、SKILL.md と重複しない補完情報のみを提供する。

## skill extension 参照方針

本スキルは以下の方針に従う（ADR）。

1. **前提とする固定知識の範囲**: docs/ ディレクトリ構成（requirements/adr/specs）のみを前提とし、`docs/specs/**` 内部構成（`foundations`, `responsibilities` 等）は仮定しない
2. **extension の読込契約**: 呼び出し元コマンドから渡された解決済み文脈を優先し、不足分のみ skill extension（`.agentdev/extensions/skills/agentdev-skill-authoring.yaml`）を読む。skill extension はスキル単位で1ファイルに集約し、reference ごとの extension は作らない
3. **`docs/specs/**` 内部パスの固定知識化の禁止**: extension に列挙されていない `docs/specs/**` 内部パスを固定知識として参照しない。スキル本文・references に具体的な project docs 内部パス（`docs/specs/{foundations,responsibilities,quality,integrity,local,authoring,commands,skills,workflows}/**`）を直接記述しない
4. **extension 未配置時の挙動**: skill extension が存在しない場合は標準動作で続行し、推測で docs を読みに行かない

## 入力

- 編集対象の SKILL.md（既存改善）、または新規スキルの要件

## 出力

- 品質基準を満たす SKILL.md（+ 必要に応じた references/ テンプレート）

## 副作用

- `src/opencode/skills/{skill}/SKILL.md` と `references/` を更新する

## 常に守る不変条件

- description は **3人称** で記述し、`USE FOR:`/ `DO NOT USE FOR:` トリガーを **必須** で含める（trigger 数 3〜7個が適正）
- frontmatter の `name:` は **YAML スカラー値（バッククォートなし）** で記述する（PR #1334 事例）
- frontmatter フィールドは `name` と `description` のみ（拡張フィールドを追加しない）
- 参照深度は SKILL.md から **1階層** まで（深いネスト回避）
- 100行を超える参照ファイルには目次を付ける
- Windows 形式パス（`\`）を使わず、フォワードスラッシュ（`/`）を使う

## 主要な判断順序

1. 複雑度分類（simple <200行 / moderate 200-400行 / detailed 400-500行）を決定。デフォルトは simple
2. 設計原則（簡潔さ、自由度、トークン予算、行数ガバナンス）を適用
3. 段階的開示（SKILL.md を目次化、詳細は references/ へ）を適用
4. 品質評価5軸（明確性、完全性、トリガー精度、スコープ範囲、アンチパターン検出）で評価
5. 配置判断フロー（実行時配布物か → Skill/Script/Template、authoring-only か → SPEC/ADR/Guide）で配置先を確定
6. レビュープロトコル（frontmatter、予算、構造、助言、サブエージェント編集安全性）で検証

## 記述削減・抽象化の前段チェック（固定トークン事前 grep）

既存の配布物本文（SKILL.md、references、command、template 等）の記述削減・抽象化の前に、対象ファイルを参照する `*.test.ts`・checker の固定トークンを事前 grep して影響を確認する（必須ステップ）。
自動化は必須とせず、影響判断を含むため手順の明文化を主体とする。

grep 対象の代表例は routing token（検査器エントリポイント、CLI 引数、result 状態語）、期待値固定セクション（テスト・checker が期待値として保持する見出し・セクション文言）、概念名文字列（`content.includes` 由来の責務・契約の概念名）。
手順と両立運用の回避パターンは [references/development-workflow.md](references/development-workflow.md) を参照。

## reference選択表

通常経路で全 reference を無条件読込しない。
必要な条件に応じて読む reference を選択する。

| 条件 | 読む reference |
|---|---|
| 設計原則の詳細（簡潔さ、自由度、トークン予算、行数ガバナンス、抽出ルール）、命名規則、description 記述、トリガー設計、複雑度分類、段階的開示、配置判断フロー、スキル粒度と参照妥当性、参照記述ルール（command→skill、skill→command、See Also 記述規約）が必要な場合 | [references/design-principles.md](references/design-principles.md) |
| レビュープロトコル（frontmatter、予算、構造、助言のチェックリスト）、frontmatter `name:` バッククォート禁止規定、サブエージェント編集安全性（worktree 内制約、パスプレフィクス確認、ファイル存在確認）、品質評価5軸の詳細が必要な場合 | [references/review-protocol.md](references/review-protocol.md) |
| 開発ワークフロー（反復開発、フィードバックループ、評価先行構築、テンプレートパターン Strict/ Flexible、条件付きワークフロー）、記述削減・抽象化の前段チェック（固定トークン事前 grep、両立運用の回避パターン）、アンチパターン一覧（8パターン）が必要な場合 | [references/development-workflow.md](references/development-workflow.md) |

## コマンドとスキルの境界

Skill の品質基準は本スキルの範囲とする。
Command に何を置き、何を置かないかの境界定義は `artifact-contracts.md`（artifact-contracts SPEC）を参照。
Skill 作成時に Command 側の詳細に踏み込みすぎないこと。

## 参考文献

SKILL.md 本文から遅延読み込みされる詳細資料。
各ファイルの冒頭に本文への文脈宣言を備える。

| ファイル | 内容 |
|---|---|
| [references/design-principles.md](references/design-principles.md) | 設計原則、命名規則、description/ トリガー設計、複雑度分類、段階的開示、配置判断フロー、スキル粒度、参照記述ルール |
| [references/review-protocol.md](references/review-protocol.md) | レビュープロトコル（frontmatter、予算、構造、助言、サブエージェント編集安全性のチェックリスト）、品質評価5軸 |
| [references/development-workflow.md](references/development-workflow.md) | 開発ワークフロー（反復開発、フィードバックループ、評価先行構築、テンプレートパターン）、記述削減・抽象化の前段チェック（固定トークン事前 grep）、アンチパターン一覧 |

## See Also

- **agentdev-doc-writing**: ADR/REQ/SPEC横断の文書品質査読ゲート（文書種別責務、要件性、文意品質、粒度）
