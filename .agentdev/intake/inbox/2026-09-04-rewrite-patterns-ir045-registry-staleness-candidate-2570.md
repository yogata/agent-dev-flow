---
id: intake-20260904-rewrite-patterns-ir045-registry-staleness-candidate-2570
title: rewrite-patterns.md（doc-writing）の IR-045 許容表現と語彙レジストリ実体の Decision 現行化判断
created: 2026-09-04
status: inbox
---

## 概要

- PR #2593 本文明記の Findings（case-run DEL-2570-1 実行時に記録、case-close STEP-6 で capture 回収）
- `src/opencode/skills/agentdev-doc-writing/references/rewrite-patterns.md` の「ADR判断が必要な変更」等の対照表現は、.opencode 語彙レジストリ実体と一体の検出器語彙のため OU-020 の現行化対象外とした
- 語彙レジストリ実体側の現行化は管理側判断が必要

## 内容

rewrite-patterns.md の IR-045 許容表現対照は doc-writing 機械置換ルールの検出対象語彙表と一体であり、本文だけを現行化すると検出器の語彙定義と乖離する。現行化する場合は語彙レジストリ実体（検出器側）との同期変更が必要。

## 対応候補

- 語彙レジストリ実体と rewrite-patterns.md 対照の Decision 現行化をセットで行うか、現状維持（検出器語彙として恒久除外）とするかを intake-promote で判断
- 変更する場合: 検出器語彙定義・baseline・doc-writing 機械置換ルールの整合再確認

## 関連

- PR #2593 本文明記の Findings/ Capture候補（intake）
- Issue #2570 対応記録コメント（case-close 対応記録セクション）
- docs/designs/authoring/vocabulary-registry.md（語彙レジストリ正典）
