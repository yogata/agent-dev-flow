# 既知の false positive 9件 cleanup plan 状態確認

## 観測

Issue #972 の共通完了条件に「既存 exempt 9件（`.agentdev/drafts/req-spec-cleanup-plan.md`）が exemption 実装後に cleanup plan から除外されていること」とある。PR #976 で IR-044 exemption 実装を完了したが、`.agentdev/drafts/` ディレクトリ自体が存在せず（commit 55fe731a で cleanup 済み）、cleanup plan ファイルも存在しない。完了条件は「cleanup plan ファイルが存在しない＝除外対象なし」として満たされているが、削除意図の確認が必要。

## 影響

- cleanup plan が意図的に削除されたのか、誤って削除されたのかが不明。
- 将来同種の cleanup plan 運用時に「削除済みファイル」を前提としてしまうリスク。

## レビューで決めること

- commit 55fe731a で cleanup plan を削除した意図（exemption 実装前に削除→後追いで exemption 実装した、等）を確認。
- cleanup plan 相当の管理を別ディレクトリ（`.agentdev/intake/` 等）で継続するか。

## 根拠

- PR #976: https://github.com/yogata/agent-dev-flow/pull/976 (Issue #972 / バッチD OU-005 + OU-007)
- Issue #972: https://github.com/yogata/agent-dev-flow/issues/972 (共通完了条件)
- commit 55fe731a: cleanup plan 削除
