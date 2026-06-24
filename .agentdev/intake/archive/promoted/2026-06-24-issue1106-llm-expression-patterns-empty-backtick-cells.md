# llm-expression-patterns.md の table cells に空 backtick セルが散見

## 発生源

- Issue: #1106
- PR: #1117 (merged, squash 9d692b8)
- 発生日: 2026-06-24

## 内容

`src/opencode/skills/agentdev-doc-writing/references/llm-expression-patterns.md` の table cells に空 backtick (`` `` ``) のセルが散見する。表現パターン名が欠落している可能性がある。

該当箇所の目安は lines 54-59 および 65 周辺。Issue #1106 (mechanical-replacement-rules.md 新設) のスコープ外であり、本 PR #1117 では現状維持とした。`llm-expression-patterns.md` は LLM 表現の表現パターン辞書として残るため、セル欠落は検出辞書の網羅性に影響する。

## 推奨対応先

別 Issue として切り出すことを推奨。作業候補:

- 該当行の空 backtick セルを実測確認し、表現パターン名を補充するか、空欄が意図的かを判断する
- 補充が必要な場合は機械判定アルゴリズム (`mechanical-replacement-rules.md` section 3) との対象整合を再確認する

## 現在の追跡状態

- PR #1117 Findings / Capture候補に記録済み
- 別 Issue 化: 未実施（本 intake が作業候補の起点）
