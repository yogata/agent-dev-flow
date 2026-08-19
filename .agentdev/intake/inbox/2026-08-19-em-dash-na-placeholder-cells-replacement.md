# テーブルセル em-dash N/A プレースホルダ4セルの置換是正が未実施（規則確定と是正の分離）

## 観測

機械置換規則の判別基準確定（PR 2271、main 8649c006 時点）で分類されたテーブルセル em-dash のうち、N/A プレースホルダ4セルが置換対象（残存）と確定した。

- inspect-promote SPEC: 2セル
- project-extensions SPEC: 1セル
- agentdev-artifact-graph SKILL.md: 1セル

意図的マトリックス表記7セル（integrity-contracts SPEC）は恒久維持、パターン説明行は適用除外として確定済み。

## 今回扱わない理由

Issue 2234（OU-0017）は規則確定がスコープであり、是正実施は OU-0018 と同一境界の別単位（規則確定と是正実施の分離）。Issue 2235（OU-0018）の配布物機械是正は X-4 単独適用で em-dash 置換を含まなかった。

## 影響

確定済み判別基準に対する置換対象セルが残存したままであり、機械判定観点の残存違反として扱われ続ける。

## レビューで決めること

- 4セル置換のは正実施単位（docs 側2ファイルと SKILL.md 1ファイルで分離するか、一括するか）

## 根拠

- PR 2271 本文「Findings / Capture候補」1件目・「残存セルの実態と扱い」節（回収元: https://github.com/yogata/agent-dev-flow/pull/2271）
