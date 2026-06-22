# check_integrity.test.ts valid fixture のルール drift（7件 NG）

## 観測

`scripts/tests/check_integrity.test.ts` の valid fixture が `check_integrity.ts` の最新ルールで 7 件 NG になる。fixture がルール更新に追従していない。OU-001 で copyScripts() を「全 .ts コピー方式」に本採用したことで、新規モジュール追加時の fixture 追従漏れリスクは低下したが、既存 fixture のルール drift は残存。

## 影響

- `check_integrity.test.ts` 実行時の false negative 7 件が固定化する
- copyScripts 本採用環境下で、fixture 側に手動でメンテナンスした古い期待値が残っている場合、ミラーリングされた最新ルールとの矛盾が顕在化する

## 課題

- `check_integrity.test.ts` fixture を最新ルールに追従させる修復
- copyScripts 本採用環境下での fixture drift を自動検出するフックを REQ-0108 に追加要件化するか
- 既存の pre-existing 失敗 10 件を backlog 化し個別対応するか

## 既存要件との関連

- REQ-0108（regression test 信頼性・fixture copy）

## 根拠

- 元 inbox item: `2026-06-21-issue971-check-integrity-fixture-rule-drift.md`
- Issue #971
