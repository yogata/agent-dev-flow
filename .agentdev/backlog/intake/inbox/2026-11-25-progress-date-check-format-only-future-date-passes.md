---
id: 2026-11-25-progress-date-check-format-only-future-date-passes
created_at: 2026-11-25T20:35:00+09:00
source: case-close (Epic #4220 の残る事柄の登録。利用者の判断 2026-11-25: 質問1 案A)
status: unreviewed
---

# 進行状況の日時の検査は様式だけを見るため、実際よりあとの終了日時が通る

- **課題**: `agentdev-workflow-case-run/scripts/record-comments.ts` の `validateProgressDate` (210〜242 行目) は、開始日時・終了日時の値が実測値・`N/A`・境界表現のどれかの様式で、推定語彙を含まないことだけを検査する。`validateProgressSection` (249〜260 行目) の注釈に「規律の判定は取りまとめの責務であり、本検証は値の様式のみを扱う」とある。値が今よりあとの日時か、Issue の closedAt と一致するかは、この検査では見ていない。Epic #4220 の終了日時 `2026-11-25T18:04:50+09:00` はこの検査を通った (`2026-11-25-case-close-child-epic-end-date-nine-hours-ahead`)
- **期待する処分**: 終了日時が今よりあとになる値を検査ではじくか、Issue の closedAt と比べるか、取りまとめが読み戻して確かめる今の方法で済ませるかを判断する
- **出典**: case-auto の取りまとめの最終報告「6. 相違点と観測」の「検査のすき間」(2026-11-25 09:52:50+09:00)。監督が main `fa948fd3f` の本文を読んで確認した
- **実証根拠**: 判定に使うのは `MEASURED_PREFIX_RE` (187 行目、`^\d{4}-\d{2}-\d{2}`)、`BOUNDED_RE` (189 行目)、`ESTIMATION_HINT_RE` (191 行目) の 3 つだけで、現在時刻を取得する式は無い。record-comments.ts、`agentdev-epic-tracker/scripts/`、`repo-agentdev-integrity/scripts/cli.ts` を `Date.now()`、`new Date()`、`未来` で検索すると、現在時刻との比較は 0 件だった (見つかったのは cli.ts 274 行目の報告のタイムスタンプだけ)。検査が通ったこと自体は取りまとめの報告による。子の session の記録は残っていないため、監督は再確認していない
