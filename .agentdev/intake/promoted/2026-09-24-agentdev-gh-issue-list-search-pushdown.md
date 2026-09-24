# agentdev_gh issue_list の search 絞り込みがサーバ推送されず全件走査相当で安全上限に到達する

## 観測内容

Custom Tool `agentdev_gh` の `issue_list` は、`search` 引数を指定した呼出でも GitHub のサーバ側絞り込みクエリへ search を推送しておらず、search の有無にかかわらず全件走査相当（安全ページ上限 10 ページ × 100 件 = 1000 件）に到達し operation-failed で失敗する。

- 実測（case-open workflow、Case #3089 STEP-5 冪等検出、2026-09-24 00:52-00:53 JST、batch restart 2026-09-24T00:38:31+09:00 attempt 2、delegation 4/7）: 同一実行内で (1) state=closed（search なし）、(2) search 指定・state なし、(3) search 指定（REQ 番号語）の計 3 回がいずれも同一定義の operation-failed で失敗。
- 一方、同一検索キー（例: `gh-issue-list-filter-discipline`、`REQ-092`）を `gh issue list --search` で実行すると即時に 0〜少数件が返る。
- コード上の根拠: runner-cli.ts L495 のクエリ構築に search が含まれず、L536 でクライアント側 title 絞り込みのみ実施。
- 検出自体は gh CLI 読取系切替（definition-pr-and-idempotency.md STEP-5 fallback 手順）により完了。

## 影響

REQ-092-001（呼出側の state/search 併用規律）は search が実効することを前提としており、Tool 実装側で search が推送されない現状は同規律の実効前提を侵食する。

## 課題

search API 等によるサーバ側推送の実現。対応は (a) `agentdev_gh` issue_list 実装の search 推送修正、または (b) 契約文言（一覧完全性節）への search 推送対象明記、の双方を提示して判断する。処分区分候補: nonconformance_fix（高優先度）。

## 既存要件との関連

- Custom Tool 操作契約 Design の一覧完全性節は「フィルタ可能な軸（state、labels 等）はサーバ側絞り込みクエリへ推送し、安全上限への到達可能性を低減する」ことを定めるが、search が推送対象に含まれるかは不明確。
- REQ-092 は呼出側規律のみを対象とし、Tool 実装をスコープ外と明記している。本件は Tool 実装側の課題であるため REQ-092 の呼出側規律とは重複しない（スコープ分離: 本件は Tool 実装、REQ-092 は呼出側運用規律）。
