# distribution_boundary_routing_contract テストの期待値ラベル陳腐化（Epic #2134 完了条件残課題）

## 観測内容

`distribution_boundary_routing_contract.test.ts` は `extractSection(content, "### Step 3-1:")` で docs-and-spec-promotion.md のセクション抽出を期待する。Wave 2 の OU-010 ラベル統一（commit fb0a5ac5、PR #2153）で当該見出しは `### STEP-3-1:`（実番号形式）へ変更されたため、セクション抽出が空になり 7 テストが失敗する（2274 tests 中 8 fail のうち 7 件）。セクション本文には detector entrypoint（check_distribution_boundary.ts）と `--profile source` トークンが存在しており、実体は見出しラベルの期待値陳腐化のみ。full integrity suite 受入れ基準（quality-gates SPEC QG-4 節）上、未登録の fail は当該変更起因として扱われ合格の根拠にできないため、Epic #2134 の完了条件3 が未達となり Epic クローズを保留した。

## 影響

- full integrity suite に 7 fail が残存し、Epic #2134 の完了条件3（QG-4 評価）が未達のまま Epic クローズが保留している

## 課題

extractSection の見出し期待値を実番号形式（`### STEP-3-1:`）へ更新する、または大小文字・ハイフン様式に依存しないマッチングへ変更する。修正後に bun test 全件で 8 fail 中 7 fail の解消を確認し、Epic #2134 の完了条件3 を評価し直して Epic をクローズする。

## 既存要件・成果物との関連

- 対象: distribution_boundary_routing_contract.test.ts
- 由来 commit: fb0a5ac5 (PR #2153, Issue #2144 / OU-010)
- 阻害対象: Epic #2134 (OPEN、完了条件3 未達)

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2154 case-close 実行時の full integrity suite（Epic #2134 完了条件3 の QG-4 評価）
- 元 item: intake-2026-08-16-epic2134-routing-contract-stale-labels.md
