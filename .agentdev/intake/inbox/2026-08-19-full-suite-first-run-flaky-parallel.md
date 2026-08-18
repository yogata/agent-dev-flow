# full integrity suite の初回実行のみ失敗する flaky（並列実行系の競合推定）

## 観測

full integrity suite の初回実行のみ 4 fail、2・3回目の実行は 3 fail で安定した（PR #2263 の検証実行）。

## 今回扱わない理由

初回のみ発現する flaky であり、反復実行で安定したため PR #2263 の完了判定には影響しなかった。並列実行系の競合と推定されるが特定には至らず。

## 影響

full suite を1回だけ実行した際に偽の fail 増加として読まれる危険がある。

## レビューで決めること

- 再発時の調査対象として扱うか（再発報告時に調査 Issue 化する運用で十分か）
- 並列実行系テストの競合検知（リトライ・逐次化）を導入するか

## 根拠

- PR 2263 本文「Findings / Capture候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2263）
