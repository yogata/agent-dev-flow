# 学び、教訓

このドキュメントは、開発過程で得た教訓や失敗から学んだことを記録する。
まだ整理されていない学びを一時的に保存し、十分な数が溜まったら分類、整理して永続的なドキュメントに移動する。

## [2026-10-27T07:20+09:00][workflow_deviation][case-open STEP-4][Case #3866]
- 検知: prepare_definition_pr.ts の DefinitionEdit 行区切り保全契約（newText は oldText の行区切りを保全し行の追加のみ許可・行の削除・統合を拒否）により、REQ 表の空行削除（REQ-108 表統合・ACT-REQ-002）や行移動〔行数減少を伴う分割編集〕を DefinitionEdit で表現できなかった（--validate-input が行構造事前確認で fail-closed 拒否）。
- 対処: REQ-108 空行削除を REQ-117.md 新規作成と同一の前段配置経路（worktree 内への node writeFileSync UTF-8 明示・oldText 一意性検証つき・stagePaths 経由 commit）で適用し、逸脱として PR #3867 本文へ記録。行移動（REQ-010-080）は12行ブロックの行数同数並べ替え（1 edit）で DefinitionEdit 契約内に収めた。
- 学び: DefinitionEdit 契約の行区切り保全は「行の追加のみ許可」が実装の正であり、行削除型の docs 整合操作（空行削除・行削除）は artifact_actions の適用計画段階で前段配置経路への事前割当てが必要。prepare_definition_pr の validateInput 分離入口（REQ-117-010 実装対象）に前段配置対象の明示化を組込む改善候補。

## [2026-10-27T10:45+09:00][intake_candidate][case-close Epic Wave クローズ][Case #3866]
- 検知: Epic Wave クローズの配布依存境界 最終 gate で 21件 violations を検出。本一式の PR 単位の検査（case-run 段階）では配布依存境界 gate を PR 前置として実施しておらず、REQ/AG 識別子（REQ-117-XXX・AG-XXX）を配布物（src/common/skills/** の script コメント・references・README）へ記述したまま merge していた。加えて配布 README への repo-*（repo-local 検査基盤）参照も検出。
- 対処: Epic Wave クローズ工程で 21件全て是正（識別子除去・repo-* 参照除去）し最終 gate pass。実装記録は REQ トレーサビリティ（covers 宣言・sidecar）で管理され、配布物本文中の識別子は不要であることを再確認。
- 学び: 配布物に触れる PR の検証に配布依存境界 gate の前置を組み込む（case-run 前置 gate の強化候補）。REQ 識別子は covers 宣言（inline または sidecar）で保持し、配布物本文へは書かない規律の周知が改善候補。
- 出典: PR #3880・#3881・#3882・#3884・#3885 の Findings と Epic Wave クローズ時の検出記録
