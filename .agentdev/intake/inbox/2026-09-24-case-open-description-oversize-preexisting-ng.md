---
intake_type: workflow-observation
source_case: "#3109"
source_workflow: case-close
observed_at: 2026-09-24T14:20:00+09:00
status: unclassified
---

# 観測: agentdev-workflow-case-open SKILL.md description の個別上限超過が origin/main で既存違反として残存（Case #3109 品質ゲートで実観測）

## 観測内容

skills_structure checker（lint_skills AG-005 層1）が origin/main HEAD 時点で既に NG を報告している既存問題: agentdev-workflow-case-open SKILL.md description 629 文字（個別上限 600 超）。origin/main 実測 627 文字（checker 測定 629 文字・測定方法差）で pre-existing であり、Case #3109 の変更ファイル（PR #3129・merge commit f6e4f187）への新規違反ではない。

- Case #3109 実装時（PR #3129 品質ゲート表）: lint_skills 実行 OK 656 / NG 1 / Warning 1。NG は agentdev-workflow-case-open description 629 文字 > 600。Warning は aggregate budget
- 修正には合意済み対象範囲外の SKILL.md description 短縮（合意済み本文の変更）が必要なため Case #3109 では修正せず記録

## 候補改善（要判断）

- agentdev-workflow-case-open SKILL.md description の 600 文字以内への短縮（合意済み本文の変更を伴うため要判断）
- 同種の pre-existing description 長超過違反が他 skill にないかの棚卸し（PR 本文 Findings セクションでの提案候補）

## 関連

- Case #3109 / PR #3129（squash f6e4f187、2026-09-24 merge）
- 入力源: PR #3129 本文「Findings / Capture候補」intake セクション（case-close Capture 回収・2026-09-24）
