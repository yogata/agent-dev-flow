# intake: IR-055 baseline delta 5件 — SKILL.md 段階的開示化による docs/specs/ 参照再配置で baseline 比較が新規 delta 扱い

## 発生日

2026-08-06

## 発生元

- Issue: #1930 (WP-5 SKILL.md の段階的開示化 OU-006)
- PR: #1937
- Epic: #1924 (AgentDevFlow 2026-08 移行)
- 取得元: PR #1937 本文「## 残リスク / follow-up」セクション

## 問題事象

WP-5 の優先7 SKILL.md 段階的開示化で、SKILL.md 本体にあった `docs/specs/` 参照コンテンツを新規・既存 reference ファイルへ再配置した。IR-055 RuntimeReference baseline（`src/integrity/baselines/*.json`）は参照の出現位置でヒューリスティック管理しているため、再配置後に対象 reference ファイルが新規 delta（heuristic warning）として検出された。

対象5件（すべて warning、strict NG ではない）:

- `src/opencode/skills/agentdev-learning-pipeline/references/disposition-and-artifact-schema.md`（4件）
- `src/opencode/skills/agentdev-req-analysis/references/analysis-viewpoints.md`（1件）

check_integrity.ts（source profile）の warning 件数が before 0件から after 5件へ増加した（strict NG は 5→5 不変、本 WP 起因の strict NG なし）。

## 影響

- source profile strict NG 件数は不変（5→5）のため、Epic #1924 完了条件「source profile strict NG 0件」への追加乖離なし
- warning 件数が 0→5 へ増加し、 heuristic delta として baseline 比較結果にノイズ発生
- 内容は既存 SKILL.md コンテンツの reference への移動であり、配布物境界違反の実害なし
- WP-6（#1931 索引再生成・統合検証）での baseline 再生成時に info 再トラッキングへ移行予定

## 発生局面

実装（WP-5 case-run、SKILL.md 段階的開示化による docs/specs/ 参照の reference 再配置時）

## 検知方法

WP-5 case-run で check_integrity.ts（source profile）を実行し、before（HEAD: 967adce6）と after の delta を比較。warning +5件が IR-055 heuristic delta であることを特定し、PR 本文「残リスク / follow-up」へ記録。TASK MUST NOT DO「baseline / 索引 / 変更前検査結果を修正しない」により本 PR では対処せず、WP-6 一括解消へ委譲。

## 想定される対応方向

- WP-6（#1931 索引再生成・統合検証）での baseline 再生成時に本5件を取り込み、info 再トラッキングへ移行する
- Wave 4 PR #1936 由来の IR-055 delta 2件（command 薄型化）と合わせて WP-6 で一括解消推奨（累積7件）
- 対象スコープ: IR-055 RuntimeReference baseline JSON の再生成（新規ファイル取り込み）
- 移行計画 §10.6 最終完了条件「baseline 新規追加 0件」と整合（本件は baseline 再生成による tracking 移行であり、機能変更ではない）

## 関連

- Epic: #1924
- Issue: #1930 (WP-5)
- PR: #1937 (squash merge 5cf5c1a6)
- 関連 intake: `intake-2026-08-06-wp4-ir055-baseline-delta-command-thinning.md`（Wave 4 由来の同クラス delta 2件）
- 関連 learning: learning/inbox.md「command 薄型化による既存参照の行移動で baseline 比較が新規 delta を生む制約」（WP-4、横展開観点で SKILL.md 再配置もカバー）
- 対象ファイル: `src/integrity/baselines/*.json`、`src/opencode/skills/agentdev-learning-pipeline/references/disposition-and-artifact-schema.md`、`src/opencode/skills/agentdev-req-analysis/references/analysis-viewpoints.md`
- 移行計画: `.omo/plans/agentdev-migration-2026-08-05.md` §9、§10.6
- 関連 Issue（解消先）: #1931 (WP-6)

## 出典引用

PR #1937 本文「## 残リスク / follow-up」より:

> **IR-055 delta +5件（heuristic warning）**: docs/specs/ 参照を SKILL.md → reference へ再配置した結果の新規 delta。内容は既存の移動であり、配布物境界違反の実害なし。WP-6 で baseline 再生成時に info 再トラッキング予定。累積 follow-up（Wave 4 IR-055 delta 2件）と合わせて WP-6 で一括解消推奨

## タグ

#intake #ir-055 #baseline #integrity-checker #skill-progressive-disclosure #wp-5 #migration-2026-08 #runtime-reference #heuristic-warning
