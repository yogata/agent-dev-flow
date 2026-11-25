---
id: 2026-11-25-case-close-child-epic-end-date-nine-hours-ahead
created_at: 2026-11-25T20:35:00+09:00
source: case-close (Epic #4220 の残る事柄の登録。利用者の判断 2026-11-25: 質問1 案A)
status: unreviewed
---

# case-close の子が Epic の終了日時を実際より 9 時間あとに記録した

- **課題**: Epic #4220 の close の子 (glm-5.3-flash、session `ses_df0339f63ffepttSbh5u3O0MWl`) が、Epic 本文の進行状況に終了日時 `2026-11-25T18:04:50+09:00` を記録した。Issue は 09:16:08+09:00 に閉じたので、この値は実際より 9 時間あとになる。取りまとめの報告では、子は測った値を JST と誤認していた。測定に使った命令は子の transcript に残っておらず、仕組みは特定できていない
- **期待する処分**: 終了日時を記録する手順を見直す (時刻の取得命令を限定する、記録の前に Issue の closedAt と比べる)。検査で機械的にはじくかどうかは `2026-11-25-progress-date-check-format-only-future-date-passes` で扱う
- **出典**: case-auto の取りまとめの最終報告「6. 相違点と観測」の「Epic の終了日時の誤記録」(2026-11-25 09:52:50+09:00)。監督が opencode の DB から読み出した (取りまとめの session `ses_df582d644ffePe08hHvKnxQZH7`)
- **実証根拠**: 取りまとめが 09:20:23 と 09:35:06 に `issue_read` で読んだ Issue #4220 の本文に `2026-11-25T18:04:50+09:00` があった (監督が取りまとめの session の tool 出力で確認)。取りまとめは `issue_update` 2 回 (09:38:07、09:40:33) で `2026-11-25T09:04:50+09:00` に修正し、09:38:59 と 09:40:44 の `issue_read` の出力には `09:04:50` がある。監督が `gh issue view 4220` で確認した値 (2026-11-25 20:19) は state CLOSED、closedAt `2026-11-25T00:16:08Z`、終了日時 `2026-11-25T09:04:50+09:00`
