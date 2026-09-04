---
id: intake-20260904-frontmatter-machine-check-design-candidate-2562
title: Knowledge frontmatter 機械検査の判定形式 5 項目の patterns Design 追記候補（OU-009 実装で確定した解釈）
created: 2026-09-04
status: inbox
---

## 情報源
- PR: #2581（Issue #2562・ru-batch-20260903 Epic 1・OU-009 knowledge frontmatter 検査 checker 実装）
- 検出工程: case-close の Capture 回収（PR 本文「Design確定候補」セクション由来・STEP-3 Design 確定チェック）

## 内容

OU-009 実装（check_knowledge_docs.ts）で確定した frontmatter 機械検査の判定形式。patterns Design「Knowledge frontmatter 規約」には実装で確定した解釈が未記載のため、追記候補:

1. frontmatter ブロックは先頭行が `---` で、次の `---` 行までを本体とする解釈（閉じ欠落は欠落扱い）
2. 必須フィールド title / created / updated の存在・非空検査
3. created / updated は YYYY-MM-DD 形式 + カレンダー妥当性検査（月末日数・Date.parse 不使用）
4. updated >= created の文字列比較検査
5. 違反種別は missing-frontmatter / invalid-frontmatter の 2 種別

既存の「knowledge 見出し一致の機械判定形式」記載と同位置への追記を想定。

## 処分候補

- patterns Design「Knowledge frontmatter 規約」セクションへの機械判定形式追記（REQ-056 系の design-save 経路）
- checker 実装との整合維持（実装が正となり Design が追従する形）

## 関連
- #2562 対応記録コメント（case-close・2026-09-04）
- PR #2581（merge commit fff6c98b）
- docs/designs/foundations/patterns.md「Knowledge frontmatter 規約」
