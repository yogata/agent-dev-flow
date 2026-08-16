# Intake Item: repo-agentdev-integrity SKILL.md 検査カテゴリ表への AG-005（lint_skills.ts）行の未記載

## 発生源

- PR: #2184 (Issue #2179 / OU-001, Epic #2178 Wave 1)
- 発生 phase: case-run 実装（AG-005 規則追加の副産物）
- capture 分類: intake（具体的修正対象、積み残し作業）

## 問題

AG-005 の層1〜2機械検査規則（hard 6規則 + warn 1規則）を lint_skills.ts へ追加実装したが、repo-agentdev-integrity SKILL.md の「検査カテゴリ」表に AG-005 / lint_skills.ts の行が未記載のまま。Issue #2179 の変更対象成果物は scripts/** に限定されたため本 PR では未対応。

## 推奨対応

repo-agentdev-integrity SKILL.md の検査カテゴリ表へ AG-005 行（lint_skills.ts、層1〜2記述基準検査）を追加する。次回 inspect-docs / docs-check での検出候補。

## 関連

- Issue: #2179 (CLOSED), Epic: #2178
- PR: #2184 (Findings / Capture候補 セクション intake 1)
