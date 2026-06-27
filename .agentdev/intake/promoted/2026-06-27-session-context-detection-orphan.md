# session-context-detection.md の未使用参照ファイル（実態確認含む）

## 観測内容

PR #1199（Issue #1197「agentdev-req-analysis SKILL.md の references 参照整合性を検証し dangling 参照を確定する」）は、`agentdev-req-analysis` SKILL.md の references 参照整合性を検証した。結果として `references/session-context-detection.md` は「SKILL.md から明示参照されていない」ことが判明した。

同 PR はこれを dangling 参照ではなく「未使用の参照ファイル」と分類し、「intake 候補として記録する（別途 inspect-skills / intake-candidate）」と明示して本 Issue スコープから除外した。

PR #1251（Issue #1251「agentdev-req-analysis SKILL.md に session-context-detection.md 参照追加 (orphan解消)」）が事後対応した可能性があるが、対象 SKILL が同一か（`agentdev-req-analysis` か別 SKILL か）は未確認。

## 影響

- PR #1199 指摘時点では未使用参照ファイルとして残置。実害なし（参照先ファイルは実在し dangling ではない）。
- PR #1251 が事後対応済みの場合、本課題は解消済みの可能性がある。

## 課題

- **実態確認（最優先）**: PR #1199 が指摘した「未使用参照」の SKILL.md と PR #1251 が対応した SKILL.md が同一か。`agentdev-req-analysis` SKILL.md の現状で `references/session-context-detection.md` への明示参照が存在するか確認。
- 実態確認の結果、未使用参照が残存する場合の処分基準（SKILL.md への明示参照追加か、ファイル削除か、別 SKILL へ移送か）。
- inspect-skills での「未使用参照ファイル」検出観点の有無と、検出辞書への追加要否。

## 既存要件との関連

- 対象 SKILL: `agentdev-req-analysis`。
- 関連 Issue: #1197, #1251。

## 観測元

- PR #1199
- Issue #1197
- 関連: Issue #1251 / PR #1279（agentdev-req-analysis SKILL.md への session-context-detection.md 参照追加）
