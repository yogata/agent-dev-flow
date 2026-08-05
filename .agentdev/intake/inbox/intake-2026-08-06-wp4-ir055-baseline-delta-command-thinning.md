# intake: IR-055 baseline delta 2件 — command 薄型化による参照行移動で baseline 比較が新規 delta 扱い

## 発生日

2026-08-06

## 発生元

- Issue: #1929 (WP-4 command の薄型化 OU-005)
- PR: #1936
- Epic: #1924 (AgentDevFlow 2026-08 移行)
- 取得元: PR #1936 本文「## 残リスク / follow-up」セクション

## 問題事象

WP-4 の command 薄型化（10ファイル、197 insertions / 1418 deletions）で、`case-run.md` と `case-close.md` 内の `repo-agentdev-integrity` スクリプト呼出し参照行が圧縮によって元の行位置から別行へ移動した。IR-055 RuntimeReference baseline（`src/integrity/baselines/*.json`）は行位置で既知参照を管理しているため、行移動後に baseline 比較を実行すると、機能的に同一の参照が新規 delta（unmanaged NG）として検出された。

- `src/opencode/commands/agentdev/case-close.md:61` の `repo-agentdev-integrity` 参照
- `src/opencode/commands/agentdev/case-run.md:64` の `repo-agentdev-integrity` 参照

check_integrity.ts の NG 件数が before 3件（IR-061 既知）から after 5件（IR-061 既知3 + IR-055 delta 2）へ増加した。

## 影響

- source profile strict NG 件数が 3件から 5件へ増加し、Epic #1924 完了条件「source profile strict NG 0件」から一時的に乖離
- IR-055 baseline を更新しない限り、後続 Wave（WP-5 #1930、WP-6 #1931）の case-run でも同一 delta が継続して検出される
- 機能的変更はなく、WP-2 PR #1934 で対応済みの `repo-*` 参照の行移動のみのため、実害は baseline メンテナンス負荷

## 発生局面

実装（WP-4 case-run、command 薄型化による大規模行削除・移動時）

## 検知方法

WP-4 case-run で check_integrity.ts を実行し、before（HEAD: 18002bfe）と after（HEAD: 90592b53）の delta を比較。NG +2件が IR-055 RuntimeReference delta であることを特定し、PR 本文「残リスク / follow-up」へ記録。TASK MUST NOT DO「baseline / 索引 / 変更前検査結果を修正しない」により本 PR では対処せず、別対応（WP-6 一括解消推奨）へ委譲。

## 想定される対応方向

- `src/integrity/baselines/*.json`（IR-055 baseline）の該当行エントリを新しい行位置（case-close.md:61、case-run.md:64）へ更新する
- 対象スコープ: IR-055 RuntimeReference baseline JSON の該当エントリ2件
- 移行計画 §10.6 最終完了条件「baseline 新規追加 0件」と整合（本件は既存エントリの行位置更新であり新規追加ではない）
- WP-6（#1931 索引再生成・統合検証）で一括解消するか、独立した integrity baseline メンテナンス Issue で早期対処することを推奨

## 関連

- Epic: #1924
- Issue: #1929 (WP-4)
- PR: #1936 (squash merge d35b2ef0)
- 対象ファイル: `src/integrity/baselines/*.json`、`src/opencode/commands/agentdev/case-run.md`、`src/opencode/commands/agentdev/case-close.md`
- 移行計画: `.omo/plans/agentdev-migration-2026-08-05.md` §8、§10.6
- 関連 Issue（解消先）: #1931 (WP-6)

## 出典引用

PR #1936 本文「## 残リスク / follow-up」より:

> ### IR-055 delta 2件（要 follow-up）
>
> `case-run.md:64` と `case-close.md:61` の `repo-agentdev-integrity` 参照が圧縮によって元の行位置から別行へ移動したため、baseline 比較で新規 delta 扱いとなった（`bun run .opencode/skills/repo-agentdev-integrity/scripts/check_changed_docs.ts` 等のスクリプト呼出しパス）。機能的には元から存在する参照（WP-2 PR #1934 でも対応済みの `repo-*` 参照）の行移動のみ。
>
> **対応**: `src/integrity/baselines/*.json`（IR-055 baseline）の該当行エントリを新しい行位置へ更新する必要があるが、TASK MUST NOT DO「baseline / 索引 / 変更前検査結果を修正しない」により本 PR では対処しない。別 Issue（integrity baseline メンテナンス、または WP-6 で一括解消）で対応することを推奨。

## タグ

#intake #ir-055 #baseline #integrity-checker #command-thinning #wp-4 #migration-2026-08 #runtime-reference
