---
id: 2026-11-25-main-copy-projection-manifest-mismatch
created_at: 2026-11-25T04:10:00+09:00
source: case-close (Issue #4222 PR #4225 本文 Findings の回収)
status: unreviewed
---

# main の copy 投影 manifest が正本と一致していない（`- agentdev-workflow-migrate` の 1 行が多い）

- **課題**: main の `.opencode/skills/repo-agentdev-integrity/data/skill-projection-manifest.yaml` は正本 `src/common/skills/repo-agentdev-integrity/data/skill-projection-manifest.yaml` に対して `- agentdev-workflow-migrate` の 1 行が多く、`generated_at` が正本は 2026-11-21、投影は 2026-11-23 である。main root で `generate_indexes.ts --dry-run` は manifest の WOULD UPDATE を報告する。マージ結果 tree の直接比較で内容一致の比較のみ不成立として再現する
- **期待する処分**: main の copy 投影 manifest の再生成
- **出典**: PR #4225 本文「Findings/ Capture候補」の intake 4 件目（取りまとめが最終 gate で追加した記録）。全文は PR コメント 7139211529「Findings と Design 確定候補の詳細記録」
- **実証根拠**: 過剰行の由来は main の commit `dfd66d5d6`（Refs #4214、別案件）。本 PR 起因ではない。Issue #4222 では直していない
