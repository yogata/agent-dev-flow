# intake: check_integrity 検出の AUTOGEN 陳腐化 4 件の pre-existing 記録（main 側は #3207 により解消済み）

- 観測日: 2026-09-28
- 観測元: case-close #3190（RU-0014 legacy-gateway-key・PR #3205 merge 済み・merge commit 1084358dacf53162747261c9a4aca52e4452fd70）の Capture 回収（PR 本文「Findings / Capture候補」intake）
- 種別: 検出事項の記録（**解消済み**。新規対応は不要。backlog-review 採用判断時の参照記録）
- ステータス補記: case-close 実行時に解消済みを確認済み。以下の「解消済みの事実」を必ず参照すること

## 要求内容（PR #3205 本文「Findings / Capture候補」からの転記）

case-run（worktree full 走査）で check_integrity の IndexGenerationConsistency による AUTOGEN 陳腐化 4 件が既出検出された:

- decision-baseline-table（docs/decisions/README.md・DEC-043 の索引反映遅れ）
- decision-status-superseded（docs/decisions/README.md・同上）
- readme-decision-summary-table（docs/decisions/README.md・同上）
- req-metrics-measurement-example（docs/designs/quality/req-health-metrics.md・計測日 2026-09-27 → 2026-09-28）

本 Case（#3190・docs/guides/supervisor-credential-bridge.md のみ変更）変更対象外ファイル由来の pre-existing であり、修復（generate_indexes.ts 再生成）は本 Case 対象範囲外のため実施しない旨を PR 本文に記録。main 側の定期 docs-check で検出・処置される性質のものだが、case-open が先行 commit 検出で squash merge する場合の main 側鮮度に影響し得るため intake 候補として記録された。

## 解消済みの事実（case-close #3190 実行時追記・2026-09-28）

- 当該 4 件は PR #3207（#3201 Case・AUTOGEN 再生成・merge commit 1fd42e08d4c77762820fcb563efbc5a75bc4aac3）のマージにより main 側で解消済み。
- case-close #3190 の STEP-3 でマージ後 main（1084358d）にて check_autogen_freshness.ts を再実行し、検出鮮度違反 0 件（再生成不要）を機械確認済み。
- したがって本 item に基づく新規の再生成・修復対応は不要。

## 残存する参照価値（採用判断時の考慮点）

- PR 本文が指摘した構造的論点は残る: worktree 内で check_integrity full 走査等を実行する Case では、分岐以降に main 側で解消済みの pre-existing 違反が worktree 側に残留し得る。worktree 側の検出は main 側の解消状況（並行 Case のマージ）と突合して pre-existing と解消済みを区別し、worktree 側で安易に再生成すると並行マージ済み修正と競合し得る点は、今後の docs-check 判定・worktree 検証運用の判断材料として参照できる。
