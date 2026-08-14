# intake: commands_e2e.test.ts の ADR README 存在検査が移行済み docs/adr/README.md を要求し失敗

## 発生日

2026-08-15

## 発生元

- Epic: #2099 (Command/Workflow/Capability architecture remediation)
- 取得元: PR 2114 Findings / Capture候補（OU-002 実装時の検証作業）

## 問題事象

`commands_e2e.test.ts` の「ADR README.md exists」検査が `docs/adr/README.md` の存在を要求するが、DEC-009（ADR から Decision への移行）以降、同パスは存在せず base ブランチから失敗している。テスト期待値の更新（`docs/decisions/README.md` へ）または当該検査の意義再評価が必要である。

## 影響

- repo-integrity test suite の base 由来失敗（PR 2114 時点で 1875 pass / 4 fail のうちの 1 件）として残存し、新規失敗との判別ノイズになる
- 同根の既知欠陥 `generate_indexes.ts` ADR README 必須参照（intake-2026-08-14-generate-indexes-requires-removed-adr-readme.md）と合わせ、DEC-009 移行後の stale 期待値群の一部

## 発生局面

実装（repo-integrity test suite 実行）

## 検知方法

`bun test` における `commands_e2e.test.ts` ADR README 存在検査の失敗（base ブランチでも再現）。

## 想定される対応方向

- (a) テスト期待値を `docs/decisions/README.md`（現行 DEC モデル）へ更新する
- (b) 当該検査の意義を再評価する
- (a)/(b) の選定は backlog-review で判断する。OU-007（cleanup）または OU-008a（全受け入れ条件再検証）での処理候補

## 関連

- Epic: #2099
- Issue: 2102（OU-002）, PR: 2114
- 対象テスト: `commands_e2e.test.ts`（ADR README.md exists 検査）
- 移行元: DEC-009（ADR → Decision 移行）
- 同根既知欠陥: `intake-2026-08-14-generate-indexes-requires-removed-adr-readme.md`（generate_indexes.ts 側。別 file・別対応）

## 出典引用

PR 2114 本文 `## Findings / Capture候補` intake 節より:

> `commands_e2e.test.ts` の「ADR README.md exists」が `docs/adr/README.md` の存在を要求するが、DEC-009（ADR から Decision への移行）以降 同パスは不存在で base から失敗している。テスト期待値の更新（`docs/decisions/README.md` へ）または当該検査の意義再評価が必要。

## タグ

#intake #stale-test-expectation #adr-dec-migration #commands-e2e #epic-2099
