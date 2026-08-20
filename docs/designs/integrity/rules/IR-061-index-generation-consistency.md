---
title: 索引類自動生成整合性
status: accepted
created: 2026-08-20
updated: 2026-08-20
---

# IR-061: 索引類自動生成整合性

## 検出対象

SC-002 Design（`docs/designs/integrity/index-auto-generation.md`）が定める索引類自動生成対象の各ファイルについて、自動生成マーカー（`<!-- AUTOGEN:BEGIN:id=xxx -->` と `<!-- AUTOGEN:END -->`）で囲まれた領域が実ファイル frontmatter と整合していることを検証する。

対象ファイル:
- `docs/README.md`
- `docs/decisions/README.md`
- `docs/requirements/README.md`
- `docs/designs/README.md`
- `docs/designs/integrity/integrity-rule-catalog.md`
- `docs/designs/integrity/rule-ownership.md`
- `docs/designs/quality/req-health-metrics.md`
- `docs/designs/quality/design-health-metrics.md`

## 検出方法

1. 各対象ファイルから自動生成マーカーで囲まれた領域を抽出
2. 対応する生成元ファイル（frontmatter、本文セクション）から期待される内容を算出
3. 抽出結果と算出結果を比較し、差分があれば NG として報告

## severity

strict（再現可能な機械的パターンマッチングで判定可能）

## exemption

- 自動生成マーカーが存在しないファイルは検証対象外（Phase C 適用前のファイル）
- 自動生成マーカー外の人手編集領域は検証対象外

## 関連

- SC-002 Design: `docs/designs/integrity/index-auto-generation.md`
- 生成スクリプト: `.opencode/skills/repo-agentdev-integrity/scripts/generate_indexes.ts`
- 関連 REQ: REQ-010（docs-check）
- 関連 IR: IR-004（REQ index）、IR-038（ADR index）、IR-039（index REQ title）、IR-042（hardcoded req count）