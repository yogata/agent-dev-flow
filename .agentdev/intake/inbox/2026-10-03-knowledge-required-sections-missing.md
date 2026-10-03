# intake: docs/knowledge 2 文書の REQ-056-003 必須セクション欠落の補完

## 内容

check_knowledge_docs.ts（REQ-056-003 必須セクション検査）で、次の 2 つの知識文書が必須セクション（適用対象・根拠・関連知識）を欠落している（合計 6 findings）。

- docs/knowledge/structure-migration-followup-checklist.md
- docs/knowledge/windows-rename-eperm-diagnosis-and-bounded-retry.md

対応候補: REQ-056-003 に従い、両文書へ欠落セクション（適用対象・根拠・関連知識）を補完する。検査は `check_knowledge_docs.ts --root <root> --json` で再実行して 6 findings の解消を確認する。

## 根拠

- 観測元: PR #3378（Case #3338・OU-008）本文 Findings / Capture候補 セクション
- 元テキスト: 「docs/knowledge/structure-migration-followup-checklist.md と docs/knowledge/windows-rename-eperm-diagnosis-and-bounded-retry.md が REQ-056-003 必須セクション（適用対象・根拠・関連知識）を欠落（check_knowledge_docs 6 findings）。base（main root）でも同発生する既存債務。knowledge 文書のセクション補完は本 Case 対象範囲外のため intake 候補として記録」
- case-close 再実測（2026-10-03・PR HEAD worktree 37ccd5c5 と origin/main 041647b3 の両方で 6 findings 同発生を確認・本 Case 変更起因 0件）
- captured_at_commit: 07339129f54e2ba177123efbd8b33f4c26b5c205
