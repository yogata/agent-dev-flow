# check_integrity.test.ts 既存テスト5件の pre-existing failure

## 観測

`.opencode/skills/repo-agentdev-integrity/scripts/check_integrity.test.ts` の valid fixture テスト（exit code / ng count）と Classification Policy テストが main ブランチ時点で失敗している。フィクスチャ期待値と実装の経年乖離が原因。PR #976 と無関係だが、IR-044 新規テストとは独立して残存。

## 影響

- IR-044 新規テスト7件は全件合格するが、既存5件が赤いため `bun test` 全体が赤。
- 今後 integrity スクリプトを触る際に「既知の赤」を除外して判断するコストが発生。

## レビューで決めること

- フィクスチャの経年劣化を一括修正する Issue を起票するか。
- Classification Policy 期待値の現在の正解を整理し、テスト側を更新するか実装側を更新するか。

## 根拠

- PR #976: https://github.com/yogata/agent-dev-flow/pull/976 (テスト結果セクションに pre-existing failure として記載)
- Issue #972: https://github.com/yogata/agent-dev-flow/issues/972
