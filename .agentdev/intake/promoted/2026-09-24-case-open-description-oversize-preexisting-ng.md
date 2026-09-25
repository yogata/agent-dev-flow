# 観測: agentdev-workflow-case-open SKILL.md description の個別上限超過が origin/main で既存違反として残存（Case #3109 品質ゲートで実観測）

## 記録情報

- 元 intake item: `2026-09-24-case-open-description-oversize-preexisting-ng.md`（採用確定後に inbox から削除。原文は本ファイルに保持）
- intake_type: workflow-observation
- source_case: #3109
- source_workflow: case-close
- observed_at: 2026-09-24T14:20:00+09:00
- 分類: 採用（ユーザー明示指定 2026-09-25・intake-promote）

## 観測内容

skills_structure checker（lint_skills AG-005 層1）が origin/main HEAD 時点で既に NG を報告している既存問題: agentdev-workflow-case-open SKILL.md description 629 文字（個別上限 600 超）。origin/main 実測 627 文字（checker 測定 629 文字・測定方法差）で pre-existing であり、Case #3109 の変更ファイル（PR #3129・merge commit f6e4f187）への新規違反ではない。

- Case #3109 実装時（PR #3129 品質ゲート表）: lint_skills 実行 OK 656 / NG 1 / Warning 1。NG は agentdev-workflow-case-open description 629 文字 > 600。Warning は aggregate budget
- 修正には合意済み対象範囲外の SKILL.md description 短縮（合意済み本文の変更）が必要なため Case #3109 では修正せず記録

## 影響

- origin/main HEAD で skills_structure の既存違反が常態化し、lint 結果の NG 1 件が恒常表示となる。pre-existing 違反の見かけ上の許容が続き、同種違反の新規混入検知の感度を下げる
- 修正は合意済み本文（SKILL.md description）の変更を伴うため、Case 単位の実装では扱えない

## 課題（候補改善・要判断）

- agentdev-workflow-case-open SKILL.md description の 600 文字以内への短縮（合意済み本文の変更を伴うため要判断）
- 同種の pre-existing description 長超過違反が他 skill にないかの棚卸し（PR 本文 Findings セクションでの提案候補）

## 検証記録（promote 時）

- 2026-09-25 の promote 実行時に `src/opencode/skills/agentdev-workflow-case-open/SKILL.md` の description を確認し、600 文字上限超過（観測どおり 627〜629 文字規模）が引き続き pre-existing で残存していることを確認した

## 既存要件・関連

- Case #3109 / PR #3129（squash f6e4f187、2026-09-24 merge）
- 入力源: PR #3129 本文「Findings / Capture候補」intake セクション（case-close Capture 回収・2026-09-24）
- 関連: skills_structure checker（lint_skills AG-005 層1）の description 個別上限 600 文字
