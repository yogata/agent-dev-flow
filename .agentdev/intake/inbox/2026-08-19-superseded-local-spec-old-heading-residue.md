# superseded ローカル版 AG SPEC に旧見出し「利用上の防護」が見出しとして残存する

## 観測

docs/specs/local/artifact-graph.md L172 に旧見出し「### 利用上の防護」が残存する。status: superseded であり、後継 skills/agentdev-artifact-graph.md への移行表示のある文書である。

現行 AG SPEC の当該見出しは「ワークフロー利用」へ改称済み（e73ba8e5）。OU-0004（Issue 2232、PR 2268）は docs 側6 SPEC の「参照」追従をスコープとし、superseded 文書自身の見出しは対象外だった。

## 今回扱わない理由

旧見出しの「参照」は 0件であり、Issue 2232 の完了条件（旧見出し参照 0件）に影響しない。superseded 文書の本文追従は現行文書体系側の扱い判断を要する。

## 影響

superseded 文書とはいえ、旧見出しの実在が今後の見出し参照 grep で偽陽性として検出され得る。

## レビューで決めること

- superseded SPEC 本文の見出し追従を実施するか、移行表示のみで凍結するか（Epic A・OU-0001 側の判断候補）

## 根拠

- PR 2268 本文「Findings / Capture候補」1件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2268）
