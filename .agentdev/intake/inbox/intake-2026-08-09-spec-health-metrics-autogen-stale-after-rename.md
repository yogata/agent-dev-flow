# INTAKE: spec-health-metrics.md AUTOGEN 測定表に agentdev-deep-review 行が stale 残存

- **発生日**: 2026-08-09
- **発生源**: PR #1961（case-close for Issue #1960）の `## Findings / Capture候補` セクション
- **観測事実**:
  - `docs/specs/quality/spec-health-metrics.md` の `<!-- AUTOGEN:BEGIN id=spec-metrics-measurement-example -->` ブロック内に `| skills/agentdev-deep-review.md | 93 | draft | skills |` 行が残存する
  - 当該行は spec-save 工程（commit f318d5d8）で `agentdev-deep-review.md` の frontmatter を `status: superseded` へ更新した結果、表中の `draft` 列が実ファイルと不一致となった
  - 同ブロックは `generate_indexes.ts`（`.opencode/skills/repo-agentdev-integrity/scripts/`）が実ファイルから再生成する AUTOGEN 区間であり、手編集は非推奨
  - 本 PR（#1961）では無関係な AUTOGEN 全面再生成を避けるため手動更新を見送った
  - 次回 `generate_indexes.ts` 実行時に `agentdev-adversarial-review.md | <lines> | accepted | skills |` 行へ置き換わり整合が解消する見込み
- **想定する修正対象**:
  - `docs/specs/quality/spec-health-metrics.md` の AUTOGEN ブロック
  - 修正方式: `generate_indexes.ts` の定期再生成により解消（手編集不要）
- **影響度**: 低。表示不正であり、実行時コード・整合性検査には影響しない（`check_changed_docs.ts`、`check_extensions.ts` いずれも strict 違反なし）
- **関連**: Issue #1960、PR #1961、既存 intake `intake-2026-07-27-req-health-metrics-autogen-not-regenerated.md`（同問題クラスの REQ 側事例）
- **出典 PR Findings 見出し**: `### stale-reference`
