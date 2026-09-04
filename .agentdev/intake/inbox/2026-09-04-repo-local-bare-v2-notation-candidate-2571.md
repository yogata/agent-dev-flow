---
id: intake-20260904-repo-local-bare-v2-notation-candidate-2571
title: repo-local 資産の裸 REQ-0145-014 表記の v2: 現行化提案
created: 2026-09-04
status: inbox
---

## 概要

- PR #2590 本文明記の Findings（case-run DEL-2571-1 実行時に記録）
- repo-agentdev-integrity SKILL.md L179、`check_integrity.ts:8634`、`cli_utils.ts` L23/94/295/716、`cli_utils.test.ts` 複数箇所に裸 `REQ-0145-014` 表記が残存
- 本 Issue #2571 の対象範囲は integrity-contracts.md・release script・design-save.md に限定されており、repo-local 資産は範囲外として記録留め

## 内容

過去版表記規約（REQ-057-014 系: v2:REQ-{NNNN}-{NNN} 形式を正）に基づき、過去版番号の参照は v2: 付き表記へ統一するのが現行の正。本 Issue で配布系文書・release script の修正は完了したが、repo-local 資産（配布対象外）の同種表記は未整備のまま残存している。一括修正の機会（同種の docs 横断現行化バッチ）で併せて現行化する候補。

## 対応候補

- 上記箇所の `REQ-0145-014` → `v2:REQ-0145-014` 表記への現行化
- 現行番号の正当な裸参照との区別は REQ-057-014 系の表記規約に従う

## 関連

- Issue #2571 対応記録コメント（case-close 対応記録セクション）
- PR #2590 本文明記の Findings/ Capture候補
- REQ-057-014 系（過去版表記規約）
