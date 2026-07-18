# japanese-tech-writing SKILL frontmatter description の USE FOR / DO NOT USE FOR trigger 記述欠落

## 観測内容
- `lint_skills.ts` が `japanese-tech-writing` の SKILL.md frontmatter description について WARNING 2件を検出
  - USE FOR trigger missing
  - DO NOT USE FOR trigger missing

## 影響
- 配布物依存スキル（REQ-0159-001、ADR-0134）として frontmatter description の trigger 記述要件を満たしていない
- ほかの配布スキルとメタ構造が揃わず、検査 WARNING が継続的に発生

## 課題
- `japanese-tech-writing` の SKILL.md frontmatter description に USE FOR / DO NOT USE FOR trigger を追記し、`lint_skills.ts` の WARNING 2件を解消する

## 既存要件との関連
- REQ-0159-001: 配布物依存スキル
- ADR-0134: 配布物依存スキル

## 対応方針の方向性
- `src/opencode/skills/japanese-tech-writing/SKILL.md` の frontmatter description をほかの agentdev-* スキルと同じ形式に整える
- 修正後に `lint_skills.ts` で WARNING 0件を確認

## 出典
- 元 intake item: intake-2026-07-18-1337-japanese-tech-writing-trigger-missing.md
