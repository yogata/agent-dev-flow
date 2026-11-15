# inspect-promote promoted 2026-11-15（REQ-119/120 採番仮記括弧句の表層是正 1件）

- 採用実行: backlog-auto stage 2 inspect 系統（inspect-promote、--auto なし）。ソース: `.agentdev/inspect/inbox/inspect-docs-finding-20261115T103843Z.md`（対象版 main HEAD `cf7ac3729`、stage 1 診断基点 aa5123e54 からの delta window は空で docs 配下の変更なし）
- 分類: 自律確定（HITL 対象なし・破壊的変更なし）。根拠: 明確な不整合（REQ-001-014「現行文書の本文は過去前提を含まない」違反の表現残留）で正規情報源特定済み・修正方向一意（仮記括弧句の除去）であり、STEP-3 分類基準「明確な不整合 → promote」の正規契約からの決定的導出。Jev 先行評価（観測 20261115T105719Z-9776、r5-disposition promote 1.0）と LLM 最終判断一致。本成果物は採用記録であり docs 側の直接修正を含まない（修正は backlog-review 経由の RU 化後）
- 前提の現物確認（2026-11-15 inspect-promote 実行時）: REQ-119.md:35 の括弧句「（本文は現行最大 REQ-118 時点の次番号を仮記）」と REQ-120.md:41 の括弧句「（本文は現行最大 REQ-119 時点の次番号 REQ-120 を仮記）」は現物で存続。採番確定の根拠: REQ-119 / REQ-120 の frontmatter id と本文行 ID（REQ-119-xxx / REQ-120-xxx）は一致、docs-check pass（stage 1 診断記載・本実行で対象行は変化せず）

## R-5（原状保存）

- id: R-5
- category: DRIFT（過去前提文言の残留）
- target: `docs/requirements/REQ-119.md:35`、`docs/requirements/REQ-120.md:41`
- evidence: REQ-119「REQ-119 の番号は決定的採番スクリプト（alloc-req-number.ts）の採番結果を正とする（本文は現行最大 REQ-118 時点の次番号を仮記）」、REQ-120「（本文は現行最大 REQ-119 時点の次番号 REQ-120 を仮記）」。採番は確定済み（frontmatter id、本文 REQ-119-xxx / REQ-120-xxx とも一致、docs-check pass）であり、文言は採番前の一時状態の記述がそのまま残留している
- severity: low
- confidence: high（前提文「採番結果を正とする」により意味は自己解決されるため軽微）
- source_of_truth: REQ-001-014（現行文書の本文は過去前提を含まない）＋各行自身の「採番結果を正とする」前提文
- recommended_route: inspect-promote → backlog-review（仮記括弧句の除去候補）
- ng_classification: pre-existing
