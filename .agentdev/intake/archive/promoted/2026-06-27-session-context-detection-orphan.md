# session-context-detection.md の未使用参照ファイル

## 観察

PR #1199（Issue #1197「agentdev-req-analysis SKILL.md の references 参照整合性を検証し dangling 参照を確定する」）は、`agentdev-req-analysis` SKILL.md の references 参照整合性を検証した。結果として `references/session-context-detection.md` は「SKILL.md から明示参照されていない」ことが判明した。

同 PR はこれを dangling 参照ではなく「未使用の参照ファイル」と分類し、「intake 候補として記録する（別途 inspect-skills / intake-candidate）」と明示して本 Issue スコープから除外した。

## 修正されなかった理由

Issue #1197 のスコープは「dangling 参照の確定」であり、未使用参照ファイルの処分（統合か削除か）は別課題。参照先ファイル自体は実在し、dangling ではないため、本 PR では「intake 候補」として記録のみ行った。

PR #1251（Issue #1251「agentdev-req-analysis SKILL.md に session-context-detection.md 参照追加 (orphan解消)」）が事後対応した可能性があるが、対象 SKILL が同一か（`agentdev-req-analysis` か別 SKILL か）確認が必要。

## 課題

- PR #1199 が指摘した「未使用参照」の SKILL.md と PR #1251 が対応した SKILL.md が同一か
- 未使用参照ファイルの処分基準（SKILL.md への明示参照追加か、ファイル削除か、別 SKILL へ移送か）
- inspect-skills での「未使用参照ファイル」検出観点の有無と、検出辞書への追加要否

## 根拠

PR #1199 本文（Findings / Capture候補）より引用:

> `references/session-context-detection.md` は SKILL.md から明示参照されていない。これは dangling 参照ではなく「未使用の参照ファイル」であり、本 Issue スコープ外。intake 候補として記録する（別途 inspect-skills / intake-candidate）。

## 観測元

- PR #1199
- Issue #1197
- 関連: Issue #1251 / PR #1279（agentdev-req-analysis SKILL.md への session-context-detection.md 参照追加）
