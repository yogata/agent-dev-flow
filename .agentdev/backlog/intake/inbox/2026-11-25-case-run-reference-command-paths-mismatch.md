---
id: 2026-11-25-case-run-reference-command-paths-mismatch
created_at: 2026-11-25T04:10:00+09:00
source: case-close (Issue #4222 PR #4225 本文 Findings の回収)
status: unreviewed
---

# 手順書の検証コマンドのパスが実体と違う（agentdev-workflow-case-run と agentdev-quality-gates の references）

- **課題**: agentdev-workflow-case-run と agentdev-quality-gates の references は bun test 分割①の起動パスとして `./.opencode/skills/<integrity-detector-skill>/scripts/` を記載するが、配下の tracked な `*.test.ts` は 0 件で検査にならない。正本は `./src/common/skills/repo-agentdev-integrity/scripts/` で、pre-push と `local_verification_gates.test.ts` はこちらを使う。agentdev-workflow-case-run の references が checker の起動パスとして書く `scripts/check_distribution_boundary.ts` も実在しない（実体は `trusted-distribution-gate/check_distribution_boundary.ts`）
- **期待する処分**: references の記載パスの修正判断
- **出典**: PR #4225 本文「Findings/ Capture候補」の intake 6 件目（取りまとめが最終 gate で追加した記録）。全文は PR コメント 7139211529「Findings と Design 確定候補の詳細記録」
- **実証根拠**: 誤ったパスでの起動は `22 files were searched` で exit 1（`C/buntest-integrity-1.stderr`、`G/prhead-buntest-integrity.stderr.txt`）。正しいパスでは 1449 pass / 0 fail（`G/prhead-buntest-integrity2.*`）
- **関連 learning**: `.agentdev/backlog/learning/inbox/2026-11-25-delegate-command-prelaunch-zero-target-check.md`
