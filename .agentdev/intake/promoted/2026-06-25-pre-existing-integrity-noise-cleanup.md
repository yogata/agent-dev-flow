# check_integrity の pre-existing NG / fail の一括是正（bundle）

## 統合の根拠

3 つの intake item が重複・関連する pre-existing integrity ノイズを扱うため、単一成果物に統合する。
観測レイヤー（checker 出力 NG / test suite fail）は異なるが、根（valid fixture の既存 NG）は共通する可能性がある。
#3 の 2 NG は #1 の 4 NG と重複するため、重複を吸収して一括管理する。

- 元 item 1: `2026-06-24-issue1105-check-integrity-preexisting-4ng.md`（docs-check 出力の安定 4 NG）
- 元 item 2: `2026-06-24-issue1109-check-integrity-test-preexisting-5fail.md`（check_integrity.test.ts の既存 5 fail）
- 元 item 3: `check-integrity-pre-existing-ng.md`（PR #1137 検証時の pre-existing 2 NG、#1 と重複）

## 観測内容

### checker 出力の安定 NG（4 件）

`bun run check_integrity.ts --json` の出力に 4 件の NG が安定して存在する（ok 294 / ng 4 / warning 10、SPEC 変更前後で同一・リグレッションなし）。

1. case-run-execution-adapter reference path
2. japanese-tech-writing skill prefix
3. project-docs-and-specs REQ 範囲表記（REQ-0147 で古い表記）← #3 と重複
4. case-close duty keyword（'回収・保存' duty キーワード不在）← #3 と重複

### test suite の既存 fail（5 件）

`scripts/tests/check_integrity.test.ts` の実行結果が全体で 39 pass / 5 fail（main ブランチと同一・本 PR 由来ではない）。

1. `valid fixture > exits with code 0`
2. `valid fixture > has zero ng results`
3. Classification Policy 系 3 件

`valid fixture` が一部検査で NG を出す状態（CanonicalBoundary や CaptureBoundary の既存 NG に起因する可能性）。IR-044 関連テストは全件 PASS（5/5）。

## 影響

- docs-check 出力に継続的に 4 件の NG が現れ、新規 SPEC 変更時のリグレッション検出ノイズとなる。本来 ok 判定すべき PR の CI で NG が混在するため、人手で pre-existing か新規かを判別する負荷が発生する。
- test suite が恒久的に 5 fail を含むため、CI の赤が常態化し、新規変更時のリグレッション検出ノイズとなる。本来 green であるべき PR で fail が混在するため、同様の判別負荷が発生する。

## 課題

pre-existing NG / fail を是正、または検出ルール調整、または除外仕組みを導入し、CI の赤常態化と判別負荷を解消する。

## 既存要件との関連

- 元 item 1: Issue #1105、PR #1108（merged, squash 1fc14a18）
- 元 item 2: Issue #1109、PR #1119（merged, squash 61c98d50）
- 元 item 3: PR #1137（Case-close Completion Verification）検証時
- 根拠報告: `.agentdev/integrity/reports/`（docs-check 実行結果）
- 関連: REQ-0144（docs-check/integrity 運用是正）、REQ-0131（test strategy cycle）

## 対応方針の方向性

設計判断（backlog-review で決定）として以下が並立する。

- 既存 4 NG を個別是正するか、検出ルール側を調整するか（false positive 判定）
- valid fixture が NG を出す検査（CanonicalBoundary / CaptureBoundary 周辺）を是正するか、検出ルール側を調整するか
- pre-existing NG / fail を docs-check / test 出力で除外・マークする仕組みを導入するか
- 既存 intake 同士の統合（checker 出力 NG と test suite fail は根が共通する可能性）を前提に一括 Issue 化するか
