# check_integrity.test.ts の既存 5 fail（本スコープ外）が test suite に残留

## 発生源

- Issue: #1109
- PR: #1119 (merged, squash 61c98d50)
- 発生日: 2026-06-24

## 観測

`scripts/tests/check_integrity.test.ts` の実行結果が全体で 39 pass / 5 fail。5 fail はすべて main ブランチと同一の既存失敗であり、本 PR (#1119) の変更に起因しない。

検出されている 5 fail:

1. `valid fixture > exits with code 0`
2. `valid fixture > has zero ng results`
3. Classification Policy 系 3 件

`valid fixture` が一部検査で NG を出す状態（CanonicalBoundary や CaptureBoundary の既存 NG に起因する可能性）。IR-044 関連テストは全件 PASS（5/5）。

## 今回扱わない理由

PR #1119 のスコープは REQ-0114-082 / REQ-0144-008 の IR-044 真陽性是正（SPEC 詳細移管と WARNING=0 確認）である。5 fail は IR-044 関連テストではなく、valid fixture の既存 NG に起因する test suite の前提崩壊であり、本 PR が対応すべき対象ではない。main ブランチでも同一に失敗することを確認済みで、本 PR 由来のリグレッションではない。

## 影響

test suite が恒久的に 5 fail を含むため、CI の赤が常態化し、新規変更時のリグレッション検出ノイズとなる。本来 green であるべき PR で fail が混在するため、人手で pre-existing か新規かを判別する負荷が発生する。

## レビューで決めること

- valid fixture が NG を出す検査（CanonicalBoundary / CaptureBoundary 周辺）を是正するか、検出ルール側を調整するか（false positive 判定）
- 既存 5 fail を個別 Issue 化するか
- 既存 intake `2026-06-24-issue1105-check-integrity-preexisting-4ng.md`（check_integrity.ts 出力の 4 NG）との統合可否。あちらは checker 出力の NG、本件は test suite の fail と観測レイヤーが異なるが、根（valid fixture の NG）は共通する可能性がある

## 根拠

PR #1119 本文「Findings / Capture候補」セクションの intake 候補。同 PR の検証結果: `check_integrity.test.ts` 全体 39 pass / 5 fail（main ブランチ同一）。
