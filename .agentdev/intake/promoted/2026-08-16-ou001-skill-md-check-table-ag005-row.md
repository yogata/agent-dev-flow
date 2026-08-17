# repo-agentdev-integrity SKILL.md 検査カテゴリ表への AG-005（lint_skills.ts）行の未記載

## 観測内容

AG-005 の層1〜2機械検査規則（hard 6規則 + warn 1規則）を lint_skills.ts へ追加実装したが、repo-agentdev-integrity SKILL.md の「検査カテゴリ」表に AG-005 / lint_skills.ts の行が未記載のまま。Issue #2179 の変更対象成果物は scripts/** に限定されたため本 PR では未対応。

## 影響

- 検査カテゴリ表に実在する検査（AG-005）の導線が欠け、SKILL.md が実装の全体像を反映していない

## 課題

repo-agentdev-integrity SKILL.md の検査カテゴリ表へ AG-005 行（lint_skills.ts、層1〜2記述基準検査）を追加する。

## 既存要件・成果物との関連

- 対象: repo-agentdev-integrity SKILL.md 検査カテゴリ表
- 実装: lint_skills.ts AG-005 規則（PR #2184 で main 入り済み）
- 関連: 2026-08-16-ou001-ag005-catalog-registration.md（catalog 登録、統合候補）

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2184 (Issue #2179 / OU-001, Epic #2178 Wave 1) Findings / Capture候補 セクション intake 1
- 元 item: intake-2026-08-16-ou001-skill-md-check-table-ag005-row.md
