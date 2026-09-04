---
id: intake-20260904-delegation-context-purpose-mismatch-2562
title: case-auto の case-run 委譲 structured_context.purpose と Issue 本文概要の一致検査（DEL-2562-1・別課題の目的記述混入）
created: 2026-09-04
status: inbox
---

## 情報源
- PR: #2581（Issue #2562・ru-batch-20260903 Epic 1・OU-009 knowledge frontmatter 検査 checker 実装）
- 検出工程: case-close の Capture 回収（PR 本文「委譲 context と Issue 本文の齟齬」セクション由来）

## 内容

委譲 structured_context（DEL-2562-1）の purpose が別課題の内容を記載していた:

- 委譲情報の purpose: 「OU-009 — REQ-017-018（Issue 監査値の計測基準記録）のテンプレート・workflow 実行系への反映」
- Issue #2562 本文（SSoT）の実際の内容: 「docs/knowledge/ frontmatter 検査の checker 実装（AG-009 / RA-005 / TS-009 / REQ-056-010）」

実行側は Issue 本文 SSoT 原則に従い実装し、成果物（PR #2581）は Issue 本文どおりに妥当であった（実害なし）。#2566（DEL-2566-1）の Issue 番号対応付け齟齬とは異なり、purpose フィールド自体に別課題の目的が混入した事例であり、委譲 context 生成時の purpose 一致検査の不足を示す。

## 処分候補

- 委譲 prompt 生成時に structured_context.purpose と Issue 本文概要（または REQ 参照）の一致検査を追加する
- purpose 生成を Issue 本文からの抽出に限定し、波及推定・会話コンテキスト由来の記述を注入しない
- 影響範囲: agentdev-workflow-case-run の委譲 context 生成契約（#2566 齟齬 item と統合検討の可能性）

## 関連
- #2562 対応記録コメント（case-close・2026-09-04）
- PR #2581（merge commit fff6c98b）
- intake inbox「2026-09-04-delegation-context-mismatch-2566.md」（同系統の委譲 context 齟齬・統合候補）
