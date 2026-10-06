# 採用済み成果物: prepare_definition_pr.ts の check_integrity commit 前順序性による構造的 fail の解消

## 観測内容

Case #3497（RU-0163）の case-open STEP-4 で、Definition 行変更を伴う Definition Package（REQ-095.md の REQ-095-002 行文言修正を含む）に対し `prepare_definition_pr.ts` を呼び出した結果、worktree 作成・edits 適用・generate_indexes までは成功したが、check_integrity が fail（exit 1）し stage/commit に到達しなかった。

fail の内容は req-updated-freshness（IR-072）で、REQ-095.md の frontmatter `updated: 2026-10-06`（IR-072「REQ 変更時に frontmatter updated を変更日へ進行させる」の遵守値）が、commit 実行前のため最終内容変更 commit の author date（2026-10-04）と突合不一致になるというもの。残工程（明示パス stage・commit）を手動実行して完結し、commit 後の check_integrity 再実行では本 Case 起因分は解消した。

adversarial-review による実装検証（2026-10-07、すべて claim-verified）:

- 工程順序: worktree-create → definition-edit（:283-322）→ generate_indexes（:324-339）→ **check_integrity（:341-352。fail 時 :348-351 で return し stage/commit 未到達）** → traceability-check（:354-374）→ stage-and-commit（:376-417）
- IR-072 の突合方式（IR-072-req-updated-freshness.md:15, 18）: frontmatter `updated` vs 当該ファイルの最終内容変更 commit の author date（`%as`）
- 構造的必発性: tracked ファイルの working tree 変更は「最終内容変更 commit」を進めないため、REQ 行編集で updated を当日値へ進めた場合、commit 前検査は構造的に必ず不一致になる。commit 後は author date が当日になり解消。IR-072 の false_positive_risk フィールドにも squash merge author date に関する既知の構造的限界が記録されている
- IR-072 の Design 拡張（PR #3483、merge ce6bd072・2026-10-05）直後の発生であり、以後の REQ 行変更 Case で同様の中断が継続する

## 影響

- REQ 行変更を伴う Definition Package で、updated を正規運用（変更日への進行）に従う限り script が常に check_integrity で中断し、stage/commit の残工程を手動実行せざるを得ない
- 手動救済は「機械工程は script 1 回の呼び出しで実行」契約（case-open Design、docs/designs/commands/case-open.md:73-75）からの運用上の逸脱を毎回発生させる

## 課題（統合先・現行状態の明記）

いずれかの構造解決（req-define で方針確定）:

1. script の工程順序変更（check_integrity を stage/commit の後に移動し、fail 時は commit 済み HEAD での検査結果報告にする）
2. req-updated-freshness の commit 前検査で working tree の updated を考慮する（検査側の変更）
3. updated の運用側を merge 前の commit 日に合わせる運用への明文化・機械化（IR-072 文言の具体化）
4. 手動救済を継続する場合の逸脱記録の標準様式（報告 JSON への救済済みフラグ追加等）

## 既存要件との関連

- case-open Design「機械工程の script 呼び出し契約」（script 1 回の呼び出しで機械工程を実行）
- IR-072 req-updated-freshness（frontmatter updated の進行規則・突合方式。PR #3483 による Design 拡張を含む）
- prepare_definition_pr.ts（case-open scripts）

## 出処・根拠

- 元 inbox item: `.agentdev/intake/inbox/2026-10-06-defpr-script-check-integrity-precommit-ordering.md`（分類採用により削除済み）
- Case #3497 / RU-0163、Definition PR #3498（definition/issue-3497、commit b0e43b1c）の script 報告 JSON（check_integrity fail ステップ・stderrTail）と commit 後再実行結果
- REQ-095.md の updated 変更履歴（git log: #3428 で updated を merge 日に更新した運用実績）
- adversarial-review Stream A/B 実装検証（工程順序・IR-072 突合・ce6bd072 merge 日付、2026-10-07。worktree 内 integrity レポート `.worktrees/3497-definition/.agentdev/integrity/reports/` は worktree cleanup 済みで揮発 — 恒久証跡は PR #3498・報告 JSON の内容引用）
