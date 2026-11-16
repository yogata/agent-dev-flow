# prepare_definition_pr の計測日収束 step と提案本文生成の修正

## 内容

Root Case #4117 の case-open STEP-4 機械工程で実観測された修正対象。case-open の冪等再実行・収束補正の契約（REQ-030-029・REQ-117-011）の実装品質の改善候補。

1. `prepare_definition_pr.ts` は check_integrity が非ゼロ終了した場合、measurement-convergence step の補正 commit の後も処理を打ち切り、traceability gate の実行と提案本文（proposal）の生成を行わない。収束補正を含む実行では、収束後に残工程を継続する経路（補正 commit 後の traceability gate 実行と提案本文の返却）が欠落している
2. `runMeasurementDateConvergence` は frontmatter updated に commit 当日の日付を設定するが、IR-072 req-updated-freshness checker の契約は「最終内容変更 commit の author date との一致（frontmatter-only commit は除外）」である。内容変更日が当日より前の対象（既存債務の吸収を含む）では updated が当日だと NG が解消されず、訂正 commit が追加で要る

## 根拠

- 観測元: Root Case #4117（case-open STEP-4 実行記録）
- 証跡: .agentdev/tmp/case-4117/prepare-report.json（check_integrity step fail・proposal 空）・check-integrity-stdout.txt（NG 3 行）・check-integrity-wt-final.txt（訂正後 exit 0）
- 補正 commit: 2451fa726（measurement-convergence step）・77695d5d4（派生物補正）・6251ba7aa（IR-072 updated 訂正）
- 対応する learning entry: .agentdev/learning/inbox.md「prepare_definition_pr の check_integrity fail 時早期 return が提案本文の欠落と計測日収束の不完結を生む」
- 実装面の接続: 本 Case の REQ-029-017（機械工程の入力構成）の case-run 実装（realization_actions RA-001 の変更対象: prepare_definition_pr.ts）と同一ファイルに触れるため、実行の順の調整は case 側で判断すること（draft の ownership_hints の既存指摘と整合）
