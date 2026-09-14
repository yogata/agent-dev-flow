# targeted docs guard の case-run プロファイル対象範囲（docs/knowledge・配布 skill 対象外）

※ 統合成果物: 2 intake item（targeted-docs-guard-workflow-profile-scope、case-run-docs-guard-profile-excludes-distribution-skills）を同一根因（case-run workflow profile の appliesTo 対象範囲）として整理

## 観測内容

targeted docs guard（check_changed_docs.ts）の case-run workflow プロファイル（appliesTo）は `docs/designs`・`docs/reports`・`docs/requirements`・`docs/decisions`・`docs/guides/` とルート README 等を対象とし、`docs/knowledge/**` と `src/opencode/**`（配布 skill ソース面）は対象外。2 系統の不均衡が観測されている:

1. docs/knowledge 変更を含む case-run で `--workflow case-run` を指定すると TARGET-EMPTY（検査見逃し防止の fail-closed）となり、全ファイル対象の `--workflow docs-check` プロファイルでの実行が必要になる（実務対応実績: case 2799 DEL-2799-3 で docs-check で 6 ファイル検査・failures 0）
2. 配布 skill のみを変更する case-run PR（case 2789 など）では files_checked 0（warning）となり、TS-007 系完了条件の意味ある検査は配布依存境界 gate（check_distribution_boundary.ts、case-run STEP-S5 / case-close STEP-3 共用 detector）側が担う構造になっている（guard と gate の対象不均衡）。case-close 側は `--files` 明示指定で意味ある検査が実行できており、問題は case-run プロファイルに限定

## 影響

- TARGET-EMPTY 発生時の運用コスト（プロファイル切り替えの判断が実行時解釈に委ねられる）
- 配布 skill 変更時の targeted docs guard が形式的（files_checked 0）となり、品質ゲート構成の実質が gate 側に偏る

## 課題（対応候補と判断材料）

対応候補は 2 系統。対応方針の決定は後続工程（backlog-review → RU）で行う:

- (a) case-run プロファイルの appliesTo へ `docs/knowledge/**`・`src/opencode/skills/**` の対象追加
- (b) 運用明記: docs/knowledge 変更時は docs-check プロファイルを使用、配布 skill 変更時は配布依存境界 gate を正と明記する等の代替検査指定

## 既存要件との関連

- case-run TS-007（targeted docs guard 実行条件）: 対象範囲の要求元
- 配布依存境界 gate（check_distribution_boundary.ts）: 実質検査の現担当中

## 根拠

- 観測元: case 2799（DEL-2799-3、PR #2803）本文 Findings（intake 候補）、case 2789（PR #2790）`## Findings / Capture候補`（TS-007 実行時に検出）、それぞれ case-close（2026-09-14 / 2026-09-13）で回収
- 処分経緯: intake-promote（2026-09-15）で同一根因と判定して統合し、採用を確定（統合・採用ともユーザー承認）
