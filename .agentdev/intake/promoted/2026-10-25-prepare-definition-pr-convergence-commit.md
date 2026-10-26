# prepare_definition_pr の計測日収束補正 commit を script 内で完結させる拡張候補

## 観測内容

- `prepare_definition_pr.ts` の generate_indexes は commit 前配置で実行されるため、req-metrics の計測日 AUTOGEN（commit author date 基準）が実行時点では確定しない
- Root Case #3850 の機械工程実行（2026-10-25）では、definition-pr-and-idempotency.md「計測日収束」節の 2 段検出（req-metrics 計測日 AUTOGEN 更新 + req-updated-freshness による frontmatter updated 追随）を同一 PR 内の追加 commit 2 件（b6cd34201、7b5297650）で手動補正した

## 影響

- 機械工程実行のたびに手動補正 commit が発生し、手順の自律性が損なわれる。

## 課題

- generate_indexes 実行後・check_integrity 実行前に、計測日収束の 2 段検出を検出して明示パス指定補正 commit を script 内で完結させる拡張 step（check_integrity 報告の計測日不整合 NG と req-updated-freshness NG を trigger にした自動補正）
- 既存の contingency 手順の機械化候補であり、手順契約（case-open Design「機械工程の script 呼び出し契約」節）の追随更新を伴う

## 既存要件との関連

- definition-pr-and-idempotency.md「計測日収束」節、case-open Design「機械工程の script 呼び出し契約」節

## 出典

- 観測元: PR #3851 本文「## Findings/ Capture候補」セクション（case-open STEP-4 機械工程実行。Root Case #3850）
- 実測証跡: prepare_definition_pr.ts 報告 JSON の check_integrity step fail（req-metrics-measurement-example AUTOGEN 不整合）、補正 commit b6cd34201（計測日 AUTOGEN）と 7b5297650（frontmatter updated 追随）後の check_integrity 再実行 pass（0 new unmanaged NG）
