# inspect-docs finding 20260822T080133Z（defer 残置分）

> 本ファイルは inspect-promote（2026-08-22 実施、/agentdev/backlog-auto 経由）の分類確定後、defer となった検出事項のみを残置する。promote 採用分（F-01, F-02, F-03, F-04, F-06）は `.agentdev/inspect/promoted/inspect-docs-promoted-20260822T080133Z.md` へ保存済み。reject 0 件。

## F-05: draft Design 13件が正規所有者として被参照する状態の長期化

- **category**: Design status 整合（draft の正規所有者被参照）
- **target**: workflows 3件（workflow-skill-model.md、step-reference-contract.md、input-resolution-and-durable-state.md）+ 他ドメイン10件（foundations/decision-lifecycle.md、foundations/references/verification-scope-catalog.md、integrity/autogen-freshness-gate.md、integrity/test-impact-detection-gate.md、local/install-script-usability.md、authoring/dependency-version-compatibility.md、skills/agentdev-artifact-validation.md、skills/agentdev-doc-diagnostics.md、skills/agentdev-design-file-manager.md、skills/agentdev-git-worktree-test-fallback.md、responsibilities/artifact-quality-control-routing.md のうち11ファイル＋workflows 3件）
- **evidence**: 被参照例: REQ-027:12「Design（docs/designs/workflows/workflow-skill-model.md）が正規所有者として定義する」（同 Design は status: draft）、document-model.md:254「decision-lifecycle.md が正規所有する」（draft）、artifact-responsibilities.md が draft の agentdev-design-file-manager を責務表に記載。既存 defer finding F-15〜17（20260815T082159Z）の再確認条件（Epic #2099 系 case-close 後の draft 継続）が今回スキャン時点でも未解消
- **severity**: low
- **confidence**: medium
- **source_of_truth**: docs/designs/README.md（Design status 追跡情報源。draft であることは追跡と整合し、index 不整合ではない）を正とし、「draft が正規所有者として被参照する」権限づけの揺れを意味候補として検出
- **recommended_route**: IR-054（draft 放置検出）による継続監視と case-close 工程での昇格判断。既存 defer finding F-15〜17 と統合した再評価（本検出は F-15〜17 のスコープ外の draft Design にも言及）
- **ng_classification**: pre-existing
- **defer 根拠**: draft → accepted 昇格は case-close 工程の正規経路であり、draft であること自体は不正状態ではない。2026-09-07 再評価時点の状況: 再確認条件となっていた Epic #2099 の closed は 2026-09-01 実行で確認済み（F-16/F-17 はユーザー承認で promote 採択、F-15 は reject 済み）。designs/README.md 現状では被参照13件中 workflows 3件・install-script-usability・artifact-validation・design-file-manager は accepted 昇格済み、decision-lifecycle・autogen-freshness-gate・test-impact-detection-gate・dependency-version-compatibility・doc-diagnostics・git-worktree-test-fallback・artifact-quality-control-routing（+ references/verification-scope-catalog）は draft 継続で被参照も継続。残 draft 群の昇格要否・時期は優先順位と対象範囲の判断を要するため、IR-054（draft 放置検出）による経過監視と case-close 正規経路への委譲を維持し観察継続する
- **notes**: draft → accepted 昇格は case-close 工程の正規経路であり、draft であること自体は不正状態ではない。観察継続対象

## 審議記録（参照）

- 暫定分類 → 経路B adversarial-review skip（ユーザー明示要求なし、発動条件不成立）→ 自律確定（F-01〜F-04）+ HITL 確定（F-06: 管理方針「docs/reports/local/ を gitignore 対象とする」をユーザー承認）: promote 5 / defer 1（本ファイル）/ reject 0
- 旧 defer F-15〜17（20260815T082159Z）は再確認条件（Epic #2099 系 case-close 後も draft 継続）が未解消のため defer 継続。F-05 は F-15〜17 と統合した再評価対象
- 2026-09-07 実施（backlog-auto stage 2 inspect 系統、--auto なし）再評価: F-05 は defer 継続（自律確定）。Epic #2099 closed 確認後も残 draft 群の被参照が継続しているが、昇格は case-close 正規経路・IR-054 が経過監視を担い、残 draft 群の昇格要否・時期は優先順位と対象範囲の判断（ユーザー判断事項）を要するため promote せず観察継続
