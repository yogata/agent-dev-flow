# 他成果物の工程ラベル参照の形式規約（SPEC確定候補）

## 観測内容

Workflow Skill 本文から当該 command の公開順序ラベルを参照する際の修飾形式（PR #2153 は「case-run command Step 7-1」形式を採用）と、Capability Skill・SPEC から Workflow Skill の工程を参照する際の形式（STEP-S5 等の実番号）の使い分け規約が未整備である。

## 影響

- 成果物間の工程参照形式が個別 PR の判断に委ねられており、参照解決の判定基準が安定しない

## 課題

spec-save 経由で参照形式の使い分け規約（command 公開ラベル参照は `command` 修飾付き、Workflow Skill 工程参照は実番号）を確定する。

## 既存要件・成果物との関連

- SPEC: command-file-format.md（参照形式規約の正規所有者候補）
- 実績: PR #2153（運用例の採用）

## 出典

- 発生日: 2026-08-16
- 発生源: PR #2153 (Issue #2144 / OU-010, Epic #2134 Wave 2) SPEC確定候補 セクション 2
- 元 item: intake-2026-08-16-spec-cand-step-label-reference-convention.md
