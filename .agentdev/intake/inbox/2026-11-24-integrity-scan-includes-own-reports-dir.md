---
id: 2026-11-24-integrity-scan-includes-own-reports-dir
created_at: 2026-11-24T13:45:00+09:00
source: case-close (Issue #4218 の統合後確認での検出)
status: unreviewed
---

# 全量整合性チェックが自分で書き出した .agentdev/integrity/reports/ を走査対象に含めている

- **課題**: 全量整合性チェック（`cli.ts` の full モード）は、前回の実行が書き出した `.agentdev/integrity/reports/` 配下のレポートを走査対象に含める。`.agentdev/README.md` は `integrity/reports/` を「非永続・git管理対象外」としており、`.opencode/skills/repo-agentdev-integrity/engine/context.ts` の `SKIP_DIR_PREFIXES` も `.agentdev/integrity/` を除外の意図として掲げているが、除外が機能していない
- **期待する処分**: `shouldSkipDir` の prefix 比較を修正し、`.agentdev/integrity/` 配下を走査対象から外す判断
- **出典**: Issue #4218 の case-close。Issue #4218 の対応記録コメント（commentId 7121768655）の残課題。PR #4219 本文の「走査ファイル数は事前実行で 751 件、push 時に 752 件だった。差の 1 件の由来は確認していない」の由来
- **実証根拠**: main root（`c294f965d28fe56f8660123d818713fe08c43122`、2026-11-24 11:01 JST）で `bun .opencode/skills/repo-agentdev-integrity/scripts/cli.ts --root <main root>` を実行すると「走査ファイル: 1687 件」。統合前の再現木（751 件）との差分 936 件はすべて `.agentdev/integrity/reports/` 配下である。成因は `context.ts` の `collectDir`（124〜130 行目）が `shouldSkipDir(relDir, entry.name)` に親ディレクトリの `relDir` を渡しているため、`reports` ディレクトリの判定では `relDir` が `.agentdev/integrity` となり、末尾に `/` の付いた `SKIP_DIR_PREFIXES`（13 行目）と比較に一致しないことである
- **関連 learning**: `.agentdev/learning/inbox/2026-11-24-scan-count-diff-relative-path-set.md`
