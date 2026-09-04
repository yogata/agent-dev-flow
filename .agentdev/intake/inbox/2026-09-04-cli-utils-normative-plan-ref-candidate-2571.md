---
id: intake-20260904-cli-utils-normative-plan-ref-candidate-2571
title: scripts/cli_utils.ts の将来計画参照コメント（.omo/plans normative）の整備提案
created: 2026-09-04
status: inbox
---

## 概要

- PR #2590 本文明記の Findings（case-run DEL-2571-1 実行時に記録）
- `scripts/cli_utils.ts:21` に `// Normative: .omo/plans/agentdev-migration-2026-08-05.md Sec.7` の将来計画参照コメントが残存
- 本 Issue #2571 の対象範囲は docs/designs 配下の normative 参照除去であり、Script 対象のコメントは範囲外として記録留め

## 内容

REQ-057-015（Design は将来計画を保持しない）は Design 面の契約だが、Script コメントが移行計画（.omo/plans/ 配下の一次資料）を normative として参照し続けると、計画資料の削除・移動時に dangling 参照となり、integrity 検査の対象外で腐敗するリスクが残る。docs/designs/integrity/integrity-contracts.md の同種参照は本 Issue で除去済み。

## 対応候補

- REQ-057-015 の趣旨に沿った Script コメント整備（normative 参照の削除または非 normative の参照先への付け替え）
- 対象: `scripts/cli_utils.ts:21`（repo-agentdev-integrity 配下の Script）

## 関連

- Issue #2571 対応記録コメント（case-close 対応記録セクション）
- PR #2590 本文明記の Findings/ Capture候補
- REQ-057-015（Design は将来計画を保持しない）
