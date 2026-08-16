# Intake Item: 完了報告テンプレートの二重管理（command-local と skill 側 templates/case-open）

## 発生源

- PR: #2152 (Issue #2141 / OU-007, Epic #2134 Wave 2)
- 発生 phase: case-run 実装（templates/case-open/ 実体化）
- capture 分類: intake（具体的検討候補、積み残し作業候補）

## 問題

command-local `src/opencode/commands/agentdev/templates/case-open/{standard,epic,multi-req-epic}.md` と、PR #2152 で正規化した skill 側 `src/opencode/skills/agentdev-workflow-templates/templates/case-open/` が同一内容で二重管理となる。配布物の単一管理原則（DEC-010 の責務3層分化）に照らして重複是正候補。

## 推奨対応

OU-010（Issue #2144、PR #2153 でマージ済み）の配布物書式統一の枠で片側の廃止または参照統一を検討する。テンプレート選定規則の正規所有者（agentdev-workflow-templates）を残す方向が自然。

## 関連

- Issue: #2141 (CLOSED), Epic: #2134
- PR: #2152 (Findings / Capture候補 セクション intake 1)
