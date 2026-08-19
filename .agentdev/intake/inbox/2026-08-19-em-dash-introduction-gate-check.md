# 配布物変更 PR の導入時ゲートへ em-dash テーブルセル検査を組み込む要否

## 観測

agentdev-artifact-graph SKILL.md の em-dash 実セル1件は、機械是正 PR 2154 の merge 翌日（2026-08-17、commit 201594d93）に導入された。導入 PR の検証で em-dash 検査が実行されず、是正直後に新規導入された。

## 今回扱わない理由

Issue 2234（OU-0017）は機械置換規則の確定がスコープであり、導入時ゲート（case-run・case-close の検証手順）の変更を含まない。

## 影響

機械是正・規則確定後に新規導入される配布物変更で、判別基準に違反するセルが検査を通過し得る。

## レビューで決めること

- case-run Step 7-1 等の導入時ゲートへ em-dash テーブルセル検査（肯定記号併存の機械判定）を組み込むか

## 根拠

- PR 2271 本文「Findings / Capture候補」2件目（回収元: https://github.com/yogata/agent-dev-flow/pull/2271）
