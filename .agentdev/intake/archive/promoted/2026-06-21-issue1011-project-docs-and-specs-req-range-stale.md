# docs/guides/project-docs-and-specs.md の REQ 範囲が REQ-0141 までで停止（REQ-0142 commit 後に req-range-staleness NG 増加）

## 観測

PR #1012 (Issue #1011 / REQ-0142) のマージ後、`docs/guides/project-docs-and-specs.md` が REQ-0141 までしか言及しておらず、REQ-0142 追加に伴う範囲更新が漏れていることを検出した。`check_integrity.ts` の `req-range-staleness` NG がこれを指摘する。

本 NG は PR #1012 commit 前は pre-existing だったが、REQ-0142 追加 commit で範囲ギャップが広がり、従来の pre-existing 性が維持される（新規導入ではない）。

## 影響

- `req-range-staleness` NG が既知 pre-existing から「範囲拡大」に変化し、docs-check 結果のノイズになる。
- 利用者が `docs/guides/project-docs-and-specs.md` を REQ 範囲の参考資料として使う場合、最新の REQ-0142 が反映されていない。

## レビューで決めること

- `docs/guides/project-docs-and-specs.md` を REQ-0142 まで更新する修正 Issue を起票するか。
- 同種の「REQ 範囲停止」ガイドが他の docs/guides/*.md にも潜在していないか横展開確認するか。
- `req-range-staleness` NG の pre-existing 性をドキュメント化するか（既知 false positive リスト等）。

## 根拠

- PR #1012: https://github.com/yogata/agent-dev-flow/pull/1012
- Issue #1011: https://github.com/yogata/agent-dev-flow/issues/1011
- 対象ガイド: `docs/guides/project-docs-and-specs.md`
- 検出ルール: `req-range-staleness` NG（`check_integrity.ts`）
- AGENTS.md: REQ 範囲は REQ-0101〜REQ-0142（REQ-0111/0115/0116/0117/0118/0120/0121/0122 は廃止）
