# src/opencode/commands/agentdev/*.md のプレースホルダ ID 表記残置の後続整理

## 観測内容

src/opencode/commands/agentdev/*.md にも同種のプレースホルダ ID 表記（REQ-{NNNN}-{NNN}、QG-{N}、（REQ） 等）が多数残置している。Issue #2182 の対象が references/** のみのため未対応。

## 影響

- 配布 command 定義の具体的な解決先がプレースホルダのまま残る

## 課題

後続 Issue として commands 配下のプレースホルダ ID 表記整理を実施する。

## 既存要件・成果物との関連

- 対象: src/opencode/commands/agentdev/*.md
- 関連: 2026-08-16-ou005-skill-md-body-placeholder-remaining.md（SKILL.md 側、統合候補）

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2187 (Issue #2182 / OU-005, Epic #2178 Wave 2) Findings / Capture候補 セクション intake 1
- 元 item: intake-2026-08-16-ou005-commands-placeholder-id-remaining.md
