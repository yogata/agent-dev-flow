---
id: intake-20260908-case-close-md-mojibake-glyph-2682
title: case-close.md L186 の文字破損グリフ（夺更 → 変更）は本 Epic close で修正済み
created: 2026-09-08
status: inbox
---

## 概要
- PR: #2685（Issue #2682・Epic #2681 Wave 1・OU-001 I/O 境界系移管完了整合）
- 発見経路: case-close の Capture 回収（PR 本文「Findings / Capture候補」セクション由来）

## 内容

design-save commit 1a104944（stage 0）が docs/designs/commands/case-close.md L186 に文字破損を導入していた（「Design status 夺更時」）。1a104944^ の旧版との突合により正字は「変更時」であると確定した。

## 処置状態（本カテゴリの回収時に解決済み）
- 本 Epic #2681 case-close の docs 更新責務により、単一グリフ修正 commit adb7b8cb（main）で修正済み
- intake-promote では採用処置不要。本エントリは記録保持のため残置（処分区分: reject 相当）
- targeted docs guard（check_changed_docs.ts --workflow case-close）で合格を確認済み

## 関連
- Issue #2682（クローズ済み。OU-001）
- PR #2685（squash merge commit 23721a2c）
- commit adb7b8cb（docs(design): case-close.md の文字破損グリフを修正）
- docs/designs/commands/case-close.md L186
