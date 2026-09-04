---
id: intake-20260904-delegation-context-mismatch-2566
title: case-auto の case-run 委譲 structured_context と Issue 本文 SSoT の不一致（DEL-2566-1・Issue 番号と作業内容の対応付け見直し候補）
created: 2026-09-04
status: inbox
---

## 情報源
- PR: #2579（Issue #2566・ru-batch-20260903 Epic 1・OU-013 GitHub I/O 表記統一）
- 検出工程: case-close の Capture 回収（PR 本文 Findings/Capture候補 セクション由来・case-run 実行時の実行者検出）

## 内容

委譲 structured_context（DEL-2566-1）と Issue #2566 本文（SSoT）に不一致があった:

- 委譲情報の指示内容: 「inspect-skills contracts.md 16 箇所の解消・TS-012・条件付き完了」
- Issue 本文の実際の内容: 「intake-from-github の GitHub I/O 表記統一・TS-013」

実行側は adapter 契約の SSoT 再構成（最上位優先）に従い Issue 本文を採用して実行し、成果物（PR #2579）は Issue 本文どおりに妥当であった。すなわち実行結果への実害はないが、委譲経路が誤った作業内容を structured_context に生成し得たことが実証された。同一 Epic の別 OU として inspect-skills contracts.md 解消（TS-012 系）が実在する場合、Issue 番号と作業内容の対応付け誤りと推定される。

## 処分候補

- case-auto → case-run の委譲経路における structured_context 生成（Issue 番号と作業内容の対応付け）の見直し。Issue 本文からの抽出を正とし、会話コンテキストや波及推定由来の作業内容記述を注入しない
- 同一 Epic 内の複数 OU を 1 つの委譲文脈に混在させない構成チェック（Issue 番号と対象成果物パスの突合）
- 影響範囲: agentdev-workflow-case-run / agentdev-case-run-execution-adapter の委譲 context 生成契約

## 関連
- #2566 対応記録コメント（case-close・2026-09-04）
- PR #2579（merge commit 0c7f9c48）
