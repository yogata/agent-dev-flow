# req-file-manager typecheck の pre-existing 型エラー（TS2345）

## 観測

PR 2433（Issue 2429、OU-002）の typecheck で、`src/opencode/skills/agentdev-req-file-manager/scripts/tests/alloc-composite-id.test.ts` (55,36) に TS2345 の型エラーが存在する。bun test 実行時は合格し、`tsc --noEmit` のみ fail する。本変更が未触及のファイルであり pre-existing。

## 今回扱わない理由

PR 2433 の変更対象外の pre-existing エラーであり、Wave 2（OU-002 / OU-003）のスコープに含まれない。

## 影響

req-file-manager の typecheck script が main の現状で失敗状態。typecheck を gate として使う工程で毎回由来分類（pre-existing）の記録コストが発生する。

## レビューで決めること

- 修正を実施する Case の割当（単独の軽微修正として扱うか、次回 req-file-manager 変更時に同時解消するか）

## 根拠

- PR 2433 本文「テスト結果」typecheck 行（fail 由来分類: pre-existing）
- PR 2433 本文「検証差分」bun test 行の既出欄
