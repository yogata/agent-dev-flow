# intake: lint_skills.ts が走査ルートを .opencode/skills に固定し worktree で配布 Skill を走査できない

## 発生日

2026-08-15

## 発生元

- Epic: #2099 (Command/Workflow/Capability architecture remediation)
- 取得元: PR 2113 Findings / Capture候補（OU-003 実装時の検証工程、lint_skills.ts 実行）

## 問題事象

`lint_skills.ts` は走査ルートを `.opencode/skills` に固定しているため、worktree（ジャンクション未伝播）環境では配布 Skill を走査できない。`skills_structure.test.ts` / `commands_structure.test.ts` は REQ-018-001 の src/opencode fallback を持つが、`lint_skills.ts` は持たない。

## 影響

- worktree で作業する Wave（case-run / driver）が `lint_skills.ts` による構造検査を直接実行できず、手動の同等検査（frontmatter 検査、目次・参照深度・名レベル参照・符号化検査）で代替することになる
- 検査網羅の自動化が worktree 環境で部分的に失われる

## 発生局面

実装（worktree 上での検証工程）

## 検知方法

worktree 上での `lint_skills.ts` 実行（`.opencode/skills` 配下に repo-local スキルのみ存在し、配布 Skill が走査対象に現れない）。

## 想定される対応方向

- `lint_skills.ts` への src/opencode fallback または走査ルート引数の追加（`skills_structure.test.ts` / `commands_structure.test.ts` と同様の REQ-018-001 対応）
- 対応要否・優先度は backlog-review で判断する

## 関連

- Epic: #2099
- Issue: 2103（OU-003）, PR: 2113
- 対象スクリプト: `.opencode/skills/repo-agentdev-integrity/scripts/lint_skills.ts`
- 類似対応済み: `skills_structure.test.ts` / `commands_structure.test.ts`（REQ-018-001 src/opencode fallback）

## 出典引用

PR 2113 本文 `## Findings / Capture候補` intake 節より:

> lint_skills.ts は走査ルートを `.opencode/skills` に固定しており、worktree（ジャンクション未伝播）環境で配布 Skill を走査できない。skills_structure.test.ts / commands_structure.test.ts は REQ-018-001 の src/opencode fallback を持つが lint_skills.ts は持たない

## タグ

#intake #lint-skills #worktree #src-fallback #repo-agentdev-integrity #epic-2099
