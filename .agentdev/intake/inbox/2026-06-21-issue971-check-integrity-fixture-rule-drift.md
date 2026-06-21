# check_integrity.test.ts fixture と最新ルールの整合性 drift

## 観測

PR #977（Issue #971 OU-001 copyScripts 本採用）の横展開検証過程で、`scripts/tests/check_integrity.test.ts` の valid fixture が `check_integrity.ts` の最新ルールで 7 件 NG になることを確認した。fixture がルール更新に追従していない。本 PR の対象外（横展開先 test ファイル 3 件のみ）として処理したが、回帰テスト全体の信頼性を損なう潜在的要因。

## 影響

- OU-001 で copyScripts() を「全 .ts コピー方式」に本採用したことで、新規モジュール追加時の fixture 追従漏れリスクは低下した。しかし既存 fixture のルール drift は残存したままであり、`check_integrity.test.ts` 実行時の false negative 7 件が固定化する。
- copyScripts 本採用は「実ファイル構成を完全ミラーリング」するため、fixture 側に手動でメンテナンスした古い期待値が残っている場合、ミラーリングされた最新ルールとの矛盾が顕在化する。

## レビューで決めること

- `check_integrity.test.ts` fixture を最新ルールに追従させる修復 Issue を起票するか（本 Epic #968 の完了後）。
- copyScripts 本採用環境下での fixture drift を自動検出するフック（例: ルール更新時に fixture の expected を再生成）を REQ-0108 に追加要件化するか。
- 既存の pre-existing 失敗 10 件（fixture 古さ・環境固有 worktree パス参照）を backlog 化し個別対応するか。

## 根拠

- PR #977: https://github.com/yogata/agent-dev-flow/pull/977 (Issue #971 / バッチC OU-001 copyScripts 本採用)
- Issue #971: https://github.com/yogata/agent-dev-flow/issues/971
- 関連 REQ: REQ-0108（regression test 信頼性・fixture copy）
- 関連 intake: 既存 `2026-06-21-issue972-check-integrity-test-preexisting-failure.md`（PR #976 で記録された pre-existing 失敗の関連項目）
