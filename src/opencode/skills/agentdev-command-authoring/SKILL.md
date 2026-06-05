---
name: agentdev-command-authoring
description: Provides quality criteria and best practices for authoring OpenCode command definitions (`.opencode/commands/`), including frontmatter verification, line count thresholds, step structure standards, and orchestration skill judgment criteria. USE FOR: creating new commands, improving existing commands, reviewing command quality, deciding whether to extract orchestration skills, or checking DoD compliance for command/skill changes. DO NOT USE FOR: creating skills, writing templates, general coding tasks, or documentation fixes.
---

# Command Authoring Best Practices

OpenCodeのCommand定義（`.opencode/commands/`）を書く際の実践ガイド。Command / Skill / Template / Script の責任分界に基づき、Commandを薄く保つ基準を提供する。

## Frontmatter 規約（ADR-0013, REQ-0103-044, Case 5 / RU-0020）

command frontmatter の許可フィールドは `description` と `agent` のみ:

```yaml
---
description: コマンドの簡潔な説明
agent: prometheus | sisyphus
---
```

**禁止フィールド**（frontmatter への記述は error として検出される）:
- `implementation_pattern` — dev メタデータ（REQ-0103-015, REQ-0103-044, REQ-0108-095）
- `secondary_pattern` — dev メタデータ（REQ-0108-096）
- `load_skills` — dev メタデータ（REQ-0103-027, REQ-0108-097）
- `pattern` — 追加禁止フィールド（REQ-0108-124）
- `workflow_route` — 追加禁止フィールド（REQ-0108-124）
- `branch_type` — 追加禁止フィールド（REQ-0108-124）
- `labels` — 追加禁止フィールド（REQ-0108-124）

これらの情報は command-map.md 等の参照用文書で管理し、frontmatter には混入させない。

## 責任分界の原則

Commandは **公開APIと高レベル実行骨格** に徹する。詳細な判定基準・状態機械・スキーマはSkillへ、決定的処理はScriptへ移す。

Commandに書くべき内容:
- Input / Output / Guardrails / Steps
- ユーザー確認ポイント
- 成果物の読み書き対象
- Command固有の制約・前提

Commandに書くべきでない内容:
- 詳細な判定表・分類表 → Skillの`references/`へ
- 大きな状態機械・再開ポイントロジック → Orchestration skillへ
- 決定的な変換・検証・生成処理 → Scriptへ
- テンプレート選定ルールの詳細 → Skillへ

## Definition of Done（DoD）

command / skill 変更時の完了定義。以下の全項目を満たすこと（REQ-0108-060~065）:

- **Frontmatter**: description + agent のみ。dev メタデータ禁止
- **行数**: 100行以内が目標。150行実運用上限。200行超は例外状態
- **Steps数**: 5〜12個
- **共通処理重複**: 共通処理は共通 skill / script に集約
- **Canonical path**: `references/`（非 `reference/`）
- **完了報告 variant**: 本文直接保持なし。variant path + 選択条件 + 置換変数のみ
- **Script-backed 可否**: 決定的検査・変換は script 化を検討

## Review Checklist

Command作成・改定時に以下を確認する:

- [ ] Frontmatter が description + agent のみか（dev メタデータなし）
- [ ] 行数が150行以内か（超過する場合は分割検討）
- [ ] Stepsが5〜12個か
- [ ] 詳細な判定表・分類表がSkillに移されているか
- [ ] ロジックが宣言的（Skill参照）になっているか
- [ ] Script化すべき決定的処理がCommandに残っていないか

→ 詳細な DoD 項目と checklist は `references/command-authoring-standards.md` を参照

## See Also

- **agentdev-skill-authoring**: Skill品質基準
- **docs/specs/artifact-contracts.md**: Command/Skill/Template/Script 責務境界
- **references/command-authoring-standards.md**: 行数目安・Steps数目安・共通処理重複・canonical path・完了報告 variant・後方互換性の詳細
