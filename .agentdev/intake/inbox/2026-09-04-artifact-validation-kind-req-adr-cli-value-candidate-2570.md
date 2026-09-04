---
id: intake-20260904-artifact-validation-kind-req-adr-cli-value-candidate-2570
title: agentdev-artifact-validation の kind(req|adr) CLI 値の現行化候補（.ts 変更を伴う実装側現行化）
created: 2026-09-04
status: inbox
---

## 概要

- PR #2593 本文明記の Findings（case-run DEL-2570-1 実行時に記録、case-close STEP-6 で capture 回収）
- `check-frontmatter-consistency.ts` の CLI kind 値が旧称（`adr`）を維持している（`kind(req|adr)`）
- 本 OU（OU-020）は .md 対象のため .ts 変更を伴うこの値は範囲外として記録留め

## 内容

DEC-009 正規成果物モデル移行後、正規名称は Decision だが検証 script の CLI 契約値は旧称のまま。機械契約値のため本文現行化（OU-020 の docs/src .md 対象）だけでは解消せず、実装側（.ts）の現行化判断が必要。棚卸し記録 §4 では「機械契約・検出器語彙」として除外規則該当と確認済み。

## 対応候補

- kind 値への decision 追加（後方互換のため adr 値の維持か別名受付かを含む）または現状維持判断
- 対象: `src/opencode/skills/agentdev-artifact-validation/scripts/check-frontmatter-consistency.ts`、SKILL.md:53、scripts/README.md:16 の契約表

## 関連

- PR #2593 本文明記の Findings/ Capture候補（intake）
- Issue #2570 対応記録コメント（case-close 対応記録セクション）
- docs/reports/integrity/normalizations/ou-020-adr-vocabulary-sweep-20260904.md §4（機械契約・検出器語彙の除外確認）
