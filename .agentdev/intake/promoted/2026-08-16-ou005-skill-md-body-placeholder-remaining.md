# SKILL.md 本文の参照選択表以外へのプレースホルダ表記残置

## 観測内容

SKILL.md 本文の参照選択表以外の行にもプレースホルダ表記が残置している（例: agentdev-doc-writing SKILL.md 冒頭「QG-{N}〜QG-{N} の主ゲート体系」、agentdev-quality-gates SKILL.md の Gate 一覧表 QG-{N} 列）。#2180/#2181 が並列編集中のため PR #2187 では参照リンク行のみ修正し、それ以外は未対応。

## 影響

- プレースホルダ表記により具体的な解決先が不明のままの箇所が配布 skill に残る

## 課題

別途 Issue で SKILL.md 本文のプレースホルダ表記を整理する。文脈から特定可能な QG-{N} は具体値への解決候補。

## 既存要件・成果物との関連

- 対象: agentdev-doc-writing SKILL.md、agentdev-quality-gates SKILL.md ほか
- 関連: 2026-08-16-ou005-commands-placeholder-id-remaining.md（commands 側、統合候補）

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2187 (Issue #2182 / OU-005, Epic #2178 Wave 2) Findings / Capture候補 セクション intake 2
- 元 item: intake-2026-08-16-ou005-skill-md-body-placeholder-remaining.md
