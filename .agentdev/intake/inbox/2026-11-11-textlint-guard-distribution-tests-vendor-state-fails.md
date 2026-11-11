# textlint-guard-distribution.test.ts の 2 件の既存 failure（vendor 生成状態に依存するテスト環境条件）

## 観測事実

- Case #3994（PR #3998 本文 Findings/intake 候補）で記録。`textlint-guard-distribution.test.ts` の 2 件の failure は修正前 HEAD で同一再現の既存失敗であり、vendor 生成状態に依存するテスト環境条件に起因する。
- case-run の TS-003 実行（`bun test ./scripts/self/release/`）で確認され、実行記録は PR #3998 本文検証差分セクションに保存済み。PR #3998 では修正せず（対象範囲外）。
- case-close（Issue #3994・2026-11-11）の final suite 再実行（PR HEAD・origin/main + PR patch の最終統合内容の双方）でも同一 2 件を再現（fail 明細は Issue #3994 完了記録コメント 6794721225 の full integrity suite 行・baseline 再現記録付きで受理）。

## 処置候補

- vendor 生成状態に依存しないテスト条件への是正、またはテストの実行環境前提（vendor 生成済み / 未生成の別）の明記と条件分岐の要否を promote 判断で評価する。

## 関連

- Case #3994・PR #3998 本文 Findings/intake 候補・Issue #3994 完了記録コメント 6794721225
- scripts/self/release/textlint-guard-distribution.test.ts・REQ-009-053
- 既存 intake: 2026-11-08-bun-test-preexisting-baseline-fails.md（bun test suite の pre-existing fail の baseline 処置）
