# Intake Item: SKILL.md 本文の参照選択表以外へのプレースホルダ表記残置

## 発生源

- PR: #2187 (Issue #2182 / OU-005, Epic #2178 Wave 2)
- 発生 phase: case-run 実装
- capture 分類: intake（具体的修正対象、判断候補）

## 問題

SKILL.md 本文の参照選択表以外の行にもプレースホルダ表記が残置している（例: agentdev-doc-writing SKILL.md 冒頭「QG-{N}〜QG-{N} の主ゲート体系」、agentdev-quality-gates SKILL.md の Gate 一覧表 QG-{N} 列）。#2180/#2181 が並列編集中のため PR #2187 では参照リンク行のみ修正し、それ以外は未対応。

## 推奨対応

Wave 3（OU-004）または別途 Issue で SKILL.md 本文のプレースホルダ表記を整理する。文脈から特定可能な QG-{N} は具体値への解決候補。

## 関連

- Issue: #2182 (CLOSED), Epic: #2178
- PR: #2187 (Findings / Capture候補 セクション intake 2)