# Intake Item: SPEC確定候補 — 他成果物の工程ラベル参照の形式規約

## 発生源

- PR: #2153 (Issue #2144 / OU-010, Epic #2134 Wave 2)
- 発生 phase: case-close Step 3-2 SPEC 確定フロー（パターン (c) 見送り、後続へ委ねる記録）
- capture 分類: intake（SPEC 更新候補。`## SPEC確定候補` 由来。`## Findings / Capture候補` とは区別）

## 問題

Workflow Skill 本文から当該 command の公開順序ラベルを参照する際の修飾形式（PR #2153 は「case-run command Step 7-1」形式を採用）と、Capability Skill・SPEC から Workflow Skill の工程を参照する際の形式（STEP-S5 等の実番号）の使い分け規約が未整備。

## 推奨対応

spec-save 経由で参照形式の使い分け規約（command 公開ラベル参照は `command` 修飾付き、Workflow Skill 工程参照は実番号）を確定する。

## 関連

- Issue: #2144 (CLOSED), Epic: #2134
- PR: #2153 (SPEC確定候補 セクション 2)
