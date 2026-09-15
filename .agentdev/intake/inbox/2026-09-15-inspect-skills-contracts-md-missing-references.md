# agentdev-inspect-skills 配下の references/contracts.md 不在参照 15 件

## 内容

`src/opencode/skills/agentdev-inspect-skills/references/` 配下 2 ファイルに、存在しない `references/contracts.md` への参照が 15 件ある（docs-check reference-path-existence NG）。

## 提案

不在参照の解消（参照先の実在ファイルへの更新、または参照の削除）。REQ-057-002（broken link・不存在参照の残存禁止）の観点で現行化する。

## 根拠

- 観測元: PR #2868 本文 Findings（Case #2852 の case-run 実行時に docs-check で検出、本筋外として記録）
- 観測時 commit: d7372002（PR #2868 head、merge 後の main HEAD は bf4a3224）
- docs-check reference-path-existence NG 15 件

## 分類

- 分類: intake（具体的修正対象あり: src/opencode/skills/agentdev-inspect-skills/references/ 配下 2 ファイル）
- 変更種別: docs（skill references の参照修正）
- 優先度: 低（既存・本 Case 変更外。次回 inspect サイクルでの再評価候補）
