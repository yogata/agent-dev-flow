# intake: backlog-integration Design の旧発動契約記述残存（case-close 実行中に是正済み）

## 内容

docs/designs/skills/agentdev-backlog-integration.md 79行目に adversarial-review の旧専用発動契約記述（「発動条件はユーザー明示指定のみ（REQ-015-002）を正とし」）が残存していた。Definition PR #3421 の 16 ファイル対象外のため本委譲では修正不可として申告された。

**処置（2026-10-04 case-close #3420）**: case-close STEP-3-1 docs 検出として commit 9090fa57 で是正済み（REQ-015-002 現行本文に整合・yomiyasu 推敲済み）。TS-006 現行契約面 0 件条件の達成確認済み。本 intake は解消済みとして review で処分判定すること。

## 根拠

- 観測元: PR #3422（Case #3420・DEL-3420-1）本文 Findings / Capture候補 セクション
- 元テキスト: 「docs/designs/skills/agentdev-backlog-integration.md 79行目に旧発動契約記述（「発動条件はユーザー明示指定のみ（REQ-015-002）を正とし」）が残存。Definition 16ファイル対象外のため本委譲では修正不可（docs 変更禁止）。次回 docs 是正対象。」
- captured_at_commit: a15f55df（PR #3422 squash merge commit）
- 解消 commit: 9090fa57
