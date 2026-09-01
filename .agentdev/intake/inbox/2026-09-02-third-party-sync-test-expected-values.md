# third-party-sync 追加後のテスト側未追随（既知欠陥 5件）の別 Case 対応

## 観測

third-party-sync command 追加後に integrity suite テスト側が未追随で、bun test ① に既知欠陥 5件が残存する。① check_command_format.test.ts「no format violations」（third-party-sync.md:24 の STEP 識別子保持・command-format-workflow-step-id 違反）、② commands_e2e.test.ts REQ-0030-010（①と同一根因）、③ check_workflow_preventive.test.ts L28 `public_commands === 18`（実態 19）、④ commands_e2e.test.ts REQ-0030-009（③と同一根因）、⑤ commands_e2e.test.ts TS-008 README listing 突合（validCommands 列挙に未登録）。REQ-057-011 の期待値動的化実装は integrity suite 側責務（agentdev-quality-gates.md L92）。

## 今回扱わない理由

実装主体は integrity suite 側であり、Issue #2507（突合検証主体・document のみ）の対象外。REQ-057-011/012 は実装責務が別 Case のため対応宣言しない判断（PR #2523）。

## 影響

bun test ① integrity suite が恒常的に 6 fail（本 5件＋環境依存 1件）で、新規 fail の検出を難しくする。

## レビューで決めること

- 期待値動的化の実装（REQ-057-011: public_commands 件数・validCommands 列挙の導出）
- third-party-sync.md:24 の STEP 識別子除去（command-format 契約対応）

## 根拠

- PR #2523 本文「Findings / Capture候補」finding 2・3（回収元: https://github.com/yogata/agent-dev-flow/pull/2523 ）
