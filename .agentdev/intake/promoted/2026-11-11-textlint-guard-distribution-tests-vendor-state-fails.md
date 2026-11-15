# textlint-guard-distribution.test.ts の 2 件の既存 failure（vendor 生成状態に依存するテスト環境条件）

## 観測内容

- Case #3994（PR #3998 本文 Findings/intake 候補）で記録。`textlint-guard-distribution.test.ts` の 2 件の failure は修正前 HEAD で同一再現の既存失敗であり、vendor 生成状態に依存するテスト環境条件に起因する。
- case-run の TS-003 実行（`bun test ./scripts/self/release/`）で確認され、実行記録は PR #3998 本文検証差分セクションに保存済み。PR #3998 では修正せず（対象範囲外）。
- case-close（Issue #3994・2026-11-11）の final suite 再実行（PR HEAD・origin/main + PR patch の最終統合内容の双方）でも同一 2 件を再現（fail 明細は Issue #3994 完了記録コメント 6794721225 の full integrity suite 行・baseline 再現記録付きで受理）。

## 影響

- vendor 生成状態依存のテスト条件が恒常的な既存 fail として suite 計数に残り、環境既知 fail と実回帰の区別コストを継続的に生む。

## 課題

- vendor 生成状態に依存しないテスト条件への是正、またはテストの実行環境前提（vendor 生成済み / 未生成の別）の明記と条件分岐の要否を判断して実施する。

## 既存要件との関連

- Case #3994・PR #3998 本文 Findings/intake 候補・Issue #3994 完了記録コメント 6794721225
- scripts/self/release/textlint-guard-distribution.test.ts・REQ-009-053

## 突合対象

- 2026-11-08-bun-test-preexisting-baseline-fails.md（bun test suite の pre-existing fail の baseline 処置）
- 2026-11-12-textlint-guard-gate-crash-vendor-missing-windows.md（gate 本体側の vendor 未生成 crash 事象・別観点）
