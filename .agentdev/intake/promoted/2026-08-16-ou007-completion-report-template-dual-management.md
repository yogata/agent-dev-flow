# 完了報告テンプレートの二重管理（command-local と skill 側 templates/case-open）

## 観測内容

command-local `src/opencode/commands/agentdev/templates/case-open/{standard,epic,multi-req-epic}.md` と、PR #2152 で正規化した skill 側 `src/opencode/skills/agentdev-workflow-templates/templates/case-open/` が同一内容で二重管理となる。配布物の単一管理原則（DEC-010 の責務3層分化）に照らして重複是正候補である。intake-promote 実行時点で両側の 3 ファイル実在を確認済み。

## 影響

- 同一テンプレートが2箇所で管理され、片側のみ更新された場合の乖離リスクが恒常的に存在する

## 課題

OU-010（Issue #2144、PR #2153 でマージ済み）の配布物書式統一の枠で片側の廃止または参照統一を検討する。テンプレート選定規則の正規所有者（agentdev-workflow-templates）を残す方向が自然。

## 既存要件・成果物との関連

- 対象: src/opencode/commands/agentdev/templates/case-open/（3ファイル）、src/opencode/skills/agentdev-workflow-templates/templates/case-open/（3ファイル）
- 原則: DEC-010 責務3層分化（配布物の単一管理）

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2152 (Issue #2141 / OU-007, Epic #2134 Wave 2) Findings / Capture候補 セクション intake 1
- 元 item: intake-2026-08-16-ou007-completion-report-template-dual-management.md
