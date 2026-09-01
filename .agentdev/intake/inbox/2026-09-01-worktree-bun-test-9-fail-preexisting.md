# worktree 環境で repo-agentdev-integrity scripts の bun test に既存 9 fail が再現する

## 観測

worktree 環境で `bun test ./.opencode/skills/repo-agentdev-integrity/scripts/` を実行すると 9 fail / 4 errors が再現する。新規 checker ファイル（check_knowledge_docs.ts / .test.ts）を退避しても同一内容の fail となる本変更と無関係の既存状態。内訳: command 定義数期待値（18 固定に対し実在 19、third-party-sync 追加時に期待値未更新）、IR-055 配布物 runtime-unresolved-reference の worktree 環境 delta、check_command_format、command_fixtures（third-party-sync workflow step identifiers）。

## 影響

worktree 内で実行する回帰検証の結果読み取りで、変更起因の fail と既存 fail の切り分けコストが毎回発生する。メインリポジトリ main での再現有無の確認と期待値更新が未実施。

## レビューで決めること

- メインリポジトリ main での再現有無の確認と、期待値更新（COMMAND_COUNT、public_commands 等）の実施要否
- 既存 intake item（2026-08-30-integrity-suite-command-count-stale-expectations.md）との統合要否

## 根拠

- PR #2503 本文「検証差分」回帰確認（REQ-010-068）と「Findings / Capture候補」intake 1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2503 ）
