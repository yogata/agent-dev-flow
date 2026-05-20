---
name: agentdev-command-authoring
description: Provides quality criteria and best practices for authoring OpenCode command definitions (`.opencode/commands/`), including line count thresholds, step structure standards, load_skills rules, and orchestration skill judgment criteria. USE FOR: creating new commands, improving existing commands, reviewing command quality, deciding whether to extract orchestration skills, or validating load_skills consistency. DO NOT USE FOR: creating skills, writing templates, general coding tasks, or documentation fixes.
---

# Command Authoring Best Practices

OpenCodeのCommand定義（`.opencode/commands/`）を書く際の実践ガイド。Command / Skill / Template / Script の責任分界に基づき、Commandを薄く保つ基準を提供する。

## 基本ディレクトリ

`.opencode/skills/agentdev-command-authoring/`

## 責任分界の原則

Commandは **公開APIと高レベル実行骨格** に徹する。詳細な判定基準・状態機械・スキーマはSkillへ、決定的処理はScriptへ移す。

Commandに書くべき内容:
- Input / Output / Guardrails / Steps
- ユーザー確認ポイント
- 使用するSkill一覧（frontmatter `load_skills`）
- 成果物の読み書き対象
- Command固有の制約・前提

Commandに書くべきでない内容:
- 詳細な判定表・分類表 → Skillのreferenceへ
- 大きな状態機械・再開ポイントロジック → Orchestration skillへ
- 決定的な変換・検証・生成処理 → Scriptへ
- テンプレート選定ルールの詳細 → Skillへ

## 行数目安

| 行数 | 判定 |
|------|------|
| ≤100行 | 目標（理想的なCommand） |
| 101〜150行 | 分割検討対象 |
| 151〜200行 | 分割推奨 |
| >200行 | orchestration skill / reference / script への切り出し必須検討 |

## Steps数目安

- 原則 **5〜12個** のStepsに抑える
- 1 Step = 1つの明確な操作単位
- 詳細な判定を含むStepはSkill参照に置き換える
- 複数Commandで使う手順はSkillへ移す

## load_skills 整合性ルール

Command本文でSkill名・Skill配下テンプレート・Skill配下referenceを明示参照する場合、原則としてfrontmatterの`load_skills`に当該Skillを含める。

例: Command本文に `agentdev-workflow-templates` のテンプレートを参照する記述がある場合、`load_skills` に `agentdev-workflow-templates` を含める。

## Orchestration Skill 化判断基準

`1 command = 1 orchestration skill` は原則とはしない。以下の条件を満たす場合にのみ orchestration skill 化を認める:

- 大きな状態機械を持つ
- 再開ポイント検出が必要
- CI loopを持つ
- Wave schedulingを持つ
- サブエージェント protocol を持つ
- 失敗時の再開ポイントが複数ある

小さいCommandごとの不要な1:1 orchestration skill追加は行わない。Orchestration skillはCommand単位ではなく、状態機械・protocol・再利用境界単位で作る。

## Review Checklist

Command作成・改定時に以下を確認する:

- [ ] 行数が150行以内か（超過する場合は分割検討）
- [ ] Stepsが5〜12個か
- [ ] 詳細な判定表・分類表がSkillに移されているか
- [ ] load_skillsに参照するSkillが全て含まれているか
- [ ] ロジックが宣言的（Skill参照）になっているか
- [ ] Script化すべき決定的処理がCommandに残っていないか

## See Also

- **artifact-boundaries.md**: Command / Skill / Template / Script の責務境界定義
- **agentdev-skill-authoring**: Skill品質基準（Command測定基準は本スキルが提供）
- **command-authoring-standards.md**: 行数目安・Steps数目安・書いてよい/書くべきでない内容の詳細（`references/command-authoring-standards.md`）
