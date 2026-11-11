# scripts-behavior.test.ts の最小 consumer fixture（makeConsumerRepo）が機械工程前提検証の対象 script を含まず check ベースアサーション 9 件が fail（REQ-009-053 導入時の fixture 追随漏れ）

## 観測事実

- Case #3994（PR #3998 本文 Findings/intake 候補）で記録。`scripts/self/release/scripts-behavior.test.ts` の最小 consumer fixture（makeConsumerRepo）は `MechanicalStepProbeContract` の対象 script（close_mechanical_steps.ts 等）を含まないため、check ベースのアサーション（TS-002 系 9 件）が機械工程前提検証の「script missing」divergence で失敗する。
- REQ-009-053（機械工程前提検証）導入時にテスト fixture が追随していない既存問題。PR #3998 では修正せず（対象範囲外）と明記のうえ記録された（計測 baseline: PR #3998 case-run の `bun test ./scripts/self/release/` 実行・修正前 HEAD で同一再現。実行記録は PR #3998 本文検証差分セクション）。
- case-close（Issue #3994・2026-11-11）の final suite 再実行でも同一 9 件を再現（fail 明細は Issue #3994 完了記録コメント 6794721225 の full integrity suite 行・baseline 再現記録付きで受理）。

## 処置候補

- makeConsumerRepo に `MechanicalStepProbeContract` の対象 script（close_mechanical_steps.ts 等）を含める、または check ベースアサーションの実行条件を fixture 構成に応じて調整する。要否は promote 判断で評価する。
- Case #3968 の既存 intake（2026-11-08-bun-test-preexisting-baseline-fails.md）は同一領域の 11 件を worktree 環境固有 timeout として記録しており、本 item は 9 件の root cause を fixture の対象 script 不在として特定する別観点。promote 時に両記録を突合して統合判断すること。

## 関連

- Case #3994・PR #3998 本文 Findings/intake 候補・Issue #3994 完了記録コメント 6794721225
- REQ-009-053（機械工程前提検証）・scripts/self/release/scripts-behavior.test.ts
- 既存 intake: 2026-11-08-bun-test-preexisting-baseline-fails.md（同一領域の別 root cause 観点）
