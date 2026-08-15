# lint_skills.ts の走査ルート固定による worktree 環境での配布 Skill 走査不能

## 観測内容

lint_skills.ts は走査ルートを `.opencode/skills` に固定しているため、worktree（ジャンクション未伝播）環境では配布 Skill を走査できない。skills_structure.test.ts / commands_structure.test.ts は同様の問題に src/ フォールバックで対応済み。

## 影響

- worktree で作業する Wave が lint_skills.ts による構造検査を直接実行できず、手動の同等検査で代替することになる
- 検査網羅の自動化が worktree 環境で部分的に失われる

## 課題

lint_skills.ts に兄弟テストと同じ src/ フォールバック（または同等のパス解決）を実装する。

## 既存要件・成果物との関連

- 対象: lint_skills.ts
- 関連: skills_structure.test.ts、commands_structure.test.ts（対応実績あり）

## 出典

- 発生日: 2026-08-15
- 取得元: worktree 環境での検査実行時の観測
- 元 item: intake-2026-08-15-lint-skills-src-fallback-missing.md
