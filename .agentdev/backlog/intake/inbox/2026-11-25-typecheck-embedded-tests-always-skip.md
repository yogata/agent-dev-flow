---
id: 2026-11-25-typecheck-embedded-tests-always-skip
created_at: 2026-11-25T04:10:00+09:00
source: case-close (Issue #4222 PR #4225 本文 Findings の回収)
status: unreviewed
---

# typecheck 組込み試験 2 件が常に skip する（対象 directory の誤解決）

- **課題**: 検証エンジンの `scripts/tests/case_run_scripts_typecheck.test.ts` と `scripts/tests/local_package_typecheck.test.ts` は `path.resolve(import.meta.dir, "../../../src/common/skills/…")` で対象 directory を誤解決し、依存を整備しても `hasDeps` が false になる。表示理由は「依存が未解決のため skip」で、実態と異なる
- **期待する処分**: 対象 directory の解決の修正判断（skip 表示理由の整合を含む）
- **出典**: PR #4225 本文「Findings/ Capture候補」の intake 5 件目（取りまとめが最終 gate で追加した記録）。全文は PR コメント 7139211529「Findings と Design 確定候補の詳細記録」
- **実証根拠**: pre-push の出力 `C/push-3.stdout` に同じ skip 表示が出る（PR #4225 の case-run の証跡 `.agentdev/tmp/4225-child-evidence/evidence/`）
