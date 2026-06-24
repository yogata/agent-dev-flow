# llm-expression-patterns.md の table cells に空 backtick セルが散見

## 観測内容

`src/opencode/skills/agentdev-doc-writing/references/llm-expression-patterns.md` の table cells に空 backtick（`` `` ``）のセルが散見する。
表現パターン名が欠落している可能性がある。
該当箇所の目安は lines 54-59 および 65 周辺。

## 影響

`llm-expression-patterns.md` は LLM 表現の表現パターン辞書として残るため、セル欠落は検出辞書の網羅性に影響する。

## 課題

空 backtick セルを実測確認し、表現パターン名を補充するか、空欄が意図的かを判断する。

## 既存要件との関連

- Issue #1106（mechanical-replacement-rules.md 新設）、PR #1117（merged, squash 9d692b8）
- 本件は #1106 のスコープ外（PR #1117 では現状維持）
- 連動: 機械判定アルゴリズム（`mechanical-replacement-rules.md` section 3）との対象整合

## 対応方針の方向性

- 該当行の空 backtick セルを実測確認する
- 補充が必要な場合は表現パターン名を補い、機械判定アルゴリズム（`mechanical-replacement-rules.md` section 3）との対象整合を再確認する
