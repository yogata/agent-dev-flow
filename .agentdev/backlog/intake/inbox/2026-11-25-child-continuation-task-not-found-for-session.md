---
id: 2026-11-25-child-continuation-task-not-found-for-session
created_at: 2026-11-25T20:35:00+09:00
source: case-close (Epic #4220 の残る事柄の登録。利用者の判断 2026-11-25: 質問1 案A)
status: unreviewed
---

# 完了済みの子への再開が `Task not found for session` で失敗する

- **課題**: 取りまとめが、完了済みの close の子 (session `ses_df0339f63ffepttSbh5u3O0MWl`) を `task` に `task_id` を渡して再開しようとしたところ、`Task not found for session: ses_df0339f63ffepttSbh5u3O0MWl` が返った。取りまとめの報告では、opencode の log 上には同じ session ID がある。`agentdev-workflow-case-run/references/delegation-and-result.md` は再委譲や継続の指示で作業を再開させることを前提に書かれている (61、78、110 行目) が、完了済みの子への再開が失敗したときの処理は書かれていない
- **期待する処分**: この文言で失敗したときに `task_id` を渡さず新しい委譲として起動する処理を、case-run の references か再開を指示する側の手順に書くか判断する。失敗の原因が plugin 側にあるか opencode 側にあるかの切り分けは、本件ではしていない
- **出典**: case-auto の取りまとめの最終報告「6. 相違点と観測」の「再委譲の失敗」(2026-11-25 09:52:50+09:00)
- **実証根拠**: 監督が opencode の DB で確認した。取りまとめ (session `ses_df582d644ffePe08hHvKnxQZH7`) の 09:30:21+09:00 の `task` 実行 (入力は `task_id` と `run_in_background: true`、説明は "Fix Epic end timestamp") の出力に `Continue background task failed` と `Task not found for session: ses_df0339f63ffepttSbh5u3O0MWl` がある。同じ文言を出力した `task` 実行は、この DB では 2026-05-01 から 2026-11-25 までの 29 日間で 73 件あった (tool 実行の単位。再試行を含む)。opencode の log ファイルには、2026-11-25 20:19 時点でこの文言は残っていなかった
