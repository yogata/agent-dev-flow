# prepare_definition_pr.ts が REQ 行変更を伴う Definition Package で check_integrity の commit 前順序性により stage/commit に到達しない

## 観測

Case #3497（RU-0163）の case-open STEP-4 で、Definition 行変更を伴う Definition Package（REQ-095.md の REQ-095-002 行文言修正を含む）に対し `prepare_definition_pr.ts` を 1 回呼び出した結果、worktree 作成・9 edits 適用・generate_indexes までは成功したが、check_integrity が fail（exit 1）し stage/commit まで到達しなかった。

fail の内容は req-updated-freshness（IR-072）で、REQ-095.md の frontmatter `updated: 2026-10-06`（merge 日値。IR-072「REQ 変更時に frontmatter updated を変更日へ進行させる」の遵守値）が、commit 実行前のため last content-change commit date（2026-10-04）と突合不一致になるというものである。script の固定工程順序（definition-edit → generate_indexes → check_integrity → stage/commit）では、REQ 行変更 Case で updated を merge 日へ進める運用と組み合わさると commit 前のこの検査は構造的に必ず不一致になる。本 Case では残工程（明示パス stage・commit）を同じ機械操作として手動実行して完結した。commit 後の check_integrity 再実行では本 Case 起因分は解消し、main HEAD 既存の retired-req-primary-ref 1件のみが残存した（main HEAD でも出力される既存債務）。

## 今回扱わない理由

script の工程順序変更（check_integrity の commit 後実行への移動、または req-updated-freshness の commit 前検査における working tree 考慮）と、IR-072 の updated 運用（merge 日値）との整合は、case-open Design「機械工程の script 呼び出し契約」節と IR-072 の両方に影響する構造変更であり、本 Case（case ラベル整合）の変更単位に含めない。

## 影響

- REQ 行変更を伴う Definition Package で、updated を正規運用（merge 日値）に従う限り prepare_definition_pr.ts が常に check_integrity で中断し、stage/commit の残工程を手動実行せざるを得ない
- 手動救済は「機械工程は script 1 回の呼び出しで実行」契約（case-open Design）からの運用上の逸脱を毎回発生させ、逸脱記録のコストが繰り返し生じる
- 本 Case の発生時点（2026-10-06）では REQ への IR-072 検査拡張（#3483、2026-10-05 merge）直後であり、以後の REQ 行変更 Case で同様の中断が継続すると推定される

## レビューで決めること

- script の工程順序を変更する（check_integrity を stage/commit の後に移動し、fail 時は commit 済み HEAD での検査結果を報告する構造にする）か、req-updated-freshness の commit 前検査で working tree の更新日を考慮するか
- あるいは updated の運用側を Definition PR 作成日ではなく merge 前の commit 日に合わせる運用へ明文化・機械化するか（IR-072 文言の具体化）
- 手動救済を継続する場合の逸脱記録の標準様式（報告 JSON への救済済みフラグ追加等）の有無

## 根拠

- Case #3497 / Definition PR #3498（definition/issue-3497、commit b0e43b1c）の script 報告 JSON（check_integrity fail ステップ・stderrTail）と commit 後 check_integrity 再実行結果（本 Case 起因分解消、既存債務 1件残存）
- worktree 内 integrity レポート: `.worktrees/3497-definition/.agentdev/integrity/reports/2026-10-06-integrity-report-2.md`（req-updated-freshness NG 行）および同 report-3（commit 後は NG 解消）
- REQ-095.md の updated 変更履歴（git log: #3428 で updated を merge 日に更新した運用実績）
