# quality-gates Design への QG-4 観点 10・機械受理基準の反映（Design確定候補、見送り）

## 観測

PR #2394（Issue #2386、OU-008）が agentdev-quality-gates の QG-4 に観点 10「フル suite 機械受理（bun test 正規形）」と機械受理基準5項（正規形実行の記録、環境ラベル3要素、件数突合、fail 全件の由来分類と由来不明 0 件、baseline 基準の明示）を新設し、pass/ fail 基準へ織り込んだ。正規原本の quality-gates Design（docs/designs/quality/quality-gates.md、QG-4 定義）には未反映。同 Design の「full integrity suite 合格基準（QG-4）における bun test 実行形態契約」節は Wave 1 の Design確定候補（既存 intake item `2026-08-22-quality-gates-design-bun-test-canonical-form.md`）も未反映のまま残存している。

## 今回扱わない理由

Design ファイルの内容更新は design-save 系手続きの責務であり、case-close の capture 責務は回収・保存のみ（STEP-3-2 パターン (c) 見送り。Wave 1 同一 Design への候補と同一タイミングで整理することが望ましいため併記）。

## 影響

quality-gates Design の QG-4 定義が skill 側（観点 10・機械受理基準）から遅れ、QG-4 実行時の正の参照源が不安定になる。

## レビューで決めること

- quality-gates Design の QG-4 定義へ観点 10・機械受理基準5項・pass/fail 基準織り込みを反映する実施
- 既存 intake item `2026-08-22-quality-gates-design-bun-test-canonical-form.md`（bun test 実行形態契約節の正規形反映）との統合反映の可否

## 根拠

- PR #2394 本文「Design確定候補」（回収元: https://github.com/yogata/agent-dev-flow/pull/2394 ）
- 既存 intake item: `.agentdev/intake/inbox/2026-08-22-quality-gates-design-bun-test-canonical-form.md`
