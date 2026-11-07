# prepare_definition_pr.ts の計測日収束 trigger 表記不一致（index-generation-consistency を捕捉しない）

## 観測事実

- case-open STEP-4 機械工程（Case #3964・PR #3965、commit 6ba37c9f7 基準・計測 2026-11-08）で、prepare_definition_pr.ts の measurement-convergence step が check_integrity 報告の NG 行「- **[NG]** index-generation-consistency: req-metrics-measurement-example AUTOGEN block out of sync. …（計測日 2026-11-07 → 期待値 2026-11-08）」を trigger 条件として検出しなかった。
- 原因箇所: `src/common/skills/agentdev-workflow-case-open/scripts/src/prepare_definition_pr.ts` の `runMeasurementDateConvergence` 内 `hasMeasurementDrift` 判定が正規表現 `/IndexGenerationConsistency/`（キャメル表記）を用いる一方、check_integrity.ts の実出力は `index-generation-consistency`（ケバブ表記）であり文字列一致が成立しない。
- 結果: 計測日収束の (a) generate_indexes rerun は実行されたが、rerun 結果の派生物補正 commit と (b) frontmatter updated の commit author date 追随が発動せず、派生物（docs/designs/quality/req-health-metrics.md）が uncommitted のまま残った。
- 回復: reference（definition-pr-and-idempotency.md）の手動 contingency（計測日収束補正 commit 8f4053eb4・frontmatter updated 追随補正 commit bd215ec33）で収束させ、check_integrity 再実行で NG 0件を確認済み。

## 具体的な修正対象

- prepare_definition_pr.ts の `hasMeasurementDrift` 判定（`/IndexGenerationConsistency/.test(checkStdout)`）を、check_integrity.ts の実出力表記 `index-generation-consistency` と突合するように修正する。
- 対応する機械突合テスト（scripts/tests/prepare_definition_pr.test.ts または prepare-validate-input.test.ts）へ、checker 実出力文字列を trigger 判定が捕捉することのテストを追加する。
- 関連 learning entry: `.agentdev/learning/inbox.md` 2026-11-08 記載分（同根因の再発防止知見）。

## 関連

- Case #3964、PR #3965（検証差分に初回 NG と補正経過を記録済み）
- `.agentdev/integrity/reports/prepare-report-3964.json`（step detail 証跡）
