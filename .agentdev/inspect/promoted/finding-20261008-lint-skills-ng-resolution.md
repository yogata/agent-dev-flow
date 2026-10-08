# lint_skills NG 2件 + WARNING 1件 の是正（配布物構造）

- 出所: inspect-docs 20261008T025952Z F-26・F-27・F-28（backlog-auto stage 1、lint_skills 機械検査由来）
- 種別: 配布物構造是正（RU-0018 層1・層2）
- 対象: src/common/skills/ 配下

## F-26: agentdev-epic-tracker SKILL.md description が上限超過

- target: `src/common/skills/agentdev-epic-tracker/SKILL.md:3`（description 610 文字 > 個別上限 600）
- evidence: lint_skills NG「description is 610 chars, exceeding the individual limit 600 (検証不通過, RU-0018 層1)」。前回診断時点（6d3c9134）から不変。node 実測でも 610 文字を確認（adversarial-review Stream A 検証）。
- severity: low-medium / confidence: high（機械検査）
- source_of_truth: lint_skills 規則（RU-0018 層1）
- 処置方針: description 縮約（136 文字程度の削減）。

## F-27: agentdev-issue-management references が行数上限超過・目次なし

- target: `src/common/skills/agentdev-issue-management/references/issue-operation-safety.md`（lint 報告 346 行 > 300、目次なし）
- evidence: lint_skills NG「references file exceeds 300 lines (346) without a table of contents (RU-0018 層2)」。実測では `wc -l`/`grep -c ""` とも 345 行（最終行改行の数え方で lint 側と ±1 の差があるが 300 超過の結論は不変）。見出し構造は # 直後に ## が続き目次節なし。
- severity: low-medium / confidence: high（機械検査）
- source_of_truth: lint_skills 規則（RU-0018 層2）
- 処置方針: 目次追加または分割。

## F-28: SKILL description 総量の集計予算超過（傾向管理）

- target: `.opencode/skills/agentdev-*/SKILL.md` 50 ファイル（総量 18600 文字、平均 372 > 予算 350×50=17500）
- evidence: lint_skills WARNING「aggregate description budget exceeded: total 18600 chars across N=50 (avg 372) > 350*50=17500 (warn, 傾向管理, RU-0018 層1)」。
- severity: low / confidence: high（機械検査）
- source_of_truth: lint_skills 規則（RU-0018 層1 傾向管理）
- 処置方針: 観察メモ（新規・更新 skill の description 縮約傾向管理）。F-26 の是正（-136 文字）だけでは 18600-136=18464 > 17500 が残るため、F-26 是正に加えて傾向管理としての縮約方針を維持する。

## 関連指示（textlint 系統との相互参照）

- intake promoted `2026-10-08-textlint-hard-violations-resolution-policy.md`（textlint hard 40 件是正）と `2026-10-08-terminology-policy-scope-definition-amendment-pr.md` が F-28 を「textlint 系統の解消方針の一部」として参照している。F-26〜F-28 は lint_skills（SKILL description 文字量）であり textlint prh 系とは機構が別のため統合しないが、backlog-review で「docs gate と配布物 lint の全統制」文脈の相互参照として明示する。

## review 検証記録（adversarial-review 2026-10-08）

- Stream A: F-26 の 610 文字を node 実測で確認、F-27 の 345 行を実測（lint 報告 346 は ±1 誤差）。
- Stream B: F-28 を artifact 9 に含める判断（F-26 単独では総量解消しないため）の妥当性を確認。learning promoted 9 件（既存措置 update 型）とのファイル単位重複なしを確認。
