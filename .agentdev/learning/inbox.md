# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

## [2026-10-27T07:20+09:00][workflow_deviation][case-open STEP-4][Case #3866]
- 検知: prepare_definition_pr.ts の DefinitionEdit 行区切り保全契約（newText は oldText の行区切りを保全し行の追加のみ許可・行の削除・統合を拒否）により、REQ 表の空行削除（REQ-108 表統合・ACT-REQ-002）や行移動〔行数減少を伴う分割編集〕を DefinitionEdit で表現できなかった（--validate-input が行構造事前確認で fail-closed 拒否）。
- 対処: REQ-108 空行削除を REQ-117.md 新規作成と同一の前段配置経路（worktree 内への node writeFileSync UTF-8 明示・oldText 一意性検証つき・stagePaths 経由 commit）で適用し、逸脱として PR #3867 本文へ記録。行移動（REQ-010-080）は12行ブロックの行数同数並べ替え（1 edit）で DefinitionEdit 契約内に収めた。
- 学び: DefinitionEdit 契約の行区切り保全は「行の追加のみ許可」が実装の正であり、行削除型の docs 整合操作（空行削除・行削除）は artifact_actions の適用計画段階で前段配置経路への事前割当てが必要。prepare_definition_pr の validateInput 分離入口（REQ-117-010 実装対象）に前段配置対象の明示化を組込む改善候補。
